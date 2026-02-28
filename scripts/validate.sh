#!/bin/bash
#
# Pre-push validation script for CME Agent
# Run this before every push: npm run validate
#
# Catches: type errors, placeholder leftovers, asset problems,
# config mismatches, missing imports, and common code smells.

PASS=0
FAIL=0
WARN=0

pass() { PASS=$((PASS + 1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  ❌ $1"; }
warn() { WARN=$((WARN + 1)); echo "  ⚠️  $1"; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       CME Agent Pre-Push Validation          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── 1. TypeScript Compilation ───────────────────────────────
echo "📦 TypeScript Compilation"
if npx tsc --noEmit 2>/dev/null; then
  pass "TypeScript compiles clean"
else
  fail "TypeScript has errors (run: npx tsc --noEmit)"
fi
echo ""

# ─── 2. Placeholder / Debug Leftovers ───────────────────────
echo "🔍 Placeholder & Debug Checks"

# Old logo placeholder
PLACEHOLDER_HITS=$(grep -rn "◎" app/ src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v '.test.' || true)
if [ -n "$PLACEHOLDER_HITS" ]; then
  fail "Old ◎ logo placeholder found in app code:"
  echo "$PLACEHOLDER_HITS"
else
  pass "No ◎ placeholder symbols"
fi

# console.log (not console.warn/error which are intentional)
CONSOLE_LOGS=$(grep -rn "console\.log(" app/ src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v '.test.' | grep -v '__tests__' | wc -l | tr -d ' ')
if [ "$CONSOLE_LOGS" -gt 5 ]; then
  warn "$CONSOLE_LOGS console.log() calls found (consider removing debug logs)"
else
  pass "Console.log count OK ($CONSOLE_LOGS)"
fi

# TODO/FIXME/HACK markers
TODOS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" app/ src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v '.test.' | wc -l | tr -d ' ')
if [ "$TODOS" -gt 0 ]; then
  warn "$TODOS TODO/FIXME/HACK markers found"
else
  pass "No TODO/FIXME markers"
fi

# Hardcoded localhost or test URLs
LOCALHOST_HITS=$(grep -rn "localhost\|127\.0\.0\.1\|httpbin" app/ src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v '.test.' | grep -v 'supabase.ts' || true)
if [ -n "$LOCALHOST_HITS" ]; then
  warn "Hardcoded localhost/test URLs found"
else
  pass "No hardcoded localhost URLs"
fi
echo ""

# ─── 3. Asset Validation ────────────────────────────────────
echo "🎨 Asset Validation"

# Check critical assets exist and have reasonable size
for asset in assets/icon.png assets/adaptive-icon.png assets/splash-icon.png assets/favicon.png; do
  if [ -f "$asset" ]; then
    SIZE=$(wc -c < "$asset" | tr -d ' ')
    if [ "$SIZE" -lt 1000 ]; then
      fail "$asset is suspiciously small (${SIZE} bytes)"
    else
      pass "$asset exists ($(( SIZE / 1024 ))K)"
    fi
  else
    fail "$asset is MISSING"
  fi
done

# Check icon.png dimensions (should be 1024x1024)
if command -v python3 &> /dev/null; then
  ICON_CHECK=$(python3 -c "
from PIL import Image
img = Image.open('assets/icon.png')
w, h = img.size
mode = img.mode
# Check dimensions
if w != 1024 or h != 1024:
    print(f'FAIL:icon.png is {w}x{h}, expected 1024x1024')
elif mode not in ('RGB', 'RGBA'):
    print(f'FAIL:icon.png mode is {mode}, expected RGB/RGBA')
else:
    # Check corners aren't transparent (iOS requirement)
    px = img.load()
    corner = px[0,0]
    if mode == 'RGBA' and corner[3] < 255:
        print('FAIL:icon.png has transparency (iOS icons must be opaque)')
    else:
        print('PASS:icon.png 1024x1024 RGB, opaque corners')
" 2>/dev/null || echo "WARN:Could not validate icon dimensions (PIL not available)")

  if [[ "$ICON_CHECK" == PASS:* ]]; then
    pass "${ICON_CHECK#PASS:}"
  elif [[ "$ICON_CHECK" == FAIL:* ]]; then
    fail "${ICON_CHECK#FAIL:}"
  else
    warn "${ICON_CHECK#WARN:}"
  fi
fi

# Check web assets
for asset in public/app-icon.png public/logo-mark.png; do
  if [ -f "$asset" ]; then
    pass "$asset exists"
  else
    warn "$asset missing (marketing site may have broken images)"
  fi
done
echo ""

# ─── 4. Config Validation ───────────────────────────────────
echo "⚙️  Config Validation"

# app.json exists and has required fields
if [ -f "app.json" ]; then
  # Check buildNumber is a number
  BUILD_NUM=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['ios']['buildNumber'])" 2>/dev/null || echo "MISSING")
  if [[ "$BUILD_NUM" =~ ^[0-9]+$ ]]; then
    pass "iOS buildNumber: $BUILD_NUM"
  else
    fail "iOS buildNumber invalid: $BUILD_NUM"
  fi

  # Check adaptive icon bg matches navy
  ADAPTIVE_BG=$(python3 -c "import json; d=json.load(open('app.json')); print(d['expo']['android']['adaptiveIcon']['backgroundColor'])" 2>/dev/null || echo "MISSING")
  if [ "$ADAPTIVE_BG" = "#0D1321" ]; then
    pass "Adaptive icon backgroundColor: $ADAPTIVE_BG (navy)"
  else
    warn "Adaptive icon backgroundColor: $ADAPTIVE_BG (expected #0D1321 navy)"
  fi

  # Check all referenced assets exist
  for ASSET_PATH in $(python3 -c "
import json
d = json.load(open('app.json'))['expo']
paths = []
if 'icon' in d: paths.append(d['icon'])
if 'splash' in d and 'image' in d['splash']: paths.append(d['splash']['image'])
if 'android' in d and 'adaptiveIcon' in d['android']:
    ai = d['android']['adaptiveIcon']
    if 'foregroundImage' in ai: paths.append(ai['foregroundImage'])
if 'web' in d and 'favicon' in d['web']: paths.append(d['web']['favicon'])
for p in paths: print(p.lstrip('./'))
" 2>/dev/null); do
    if [ -f "$ASSET_PATH" ]; then
      pass "app.json → $ASSET_PATH exists"
    else
      fail "app.json → $ASSET_PATH MISSING"
    fi
  done
else
  fail "app.json not found"
fi
echo ""

# ─── 5. Auth Flow Checks ────────────────────────────────────
echo "🔐 Auth Flow Checks"

# Check that SIGNED_IN sets loading=true (our critical fix)
if grep -q "SIGNED_IN.*setLoading(true)\|setLoading(true).*SIGNED_IN" src/hooks/useAuth.ts 2>/dev/null; then
  pass "SIGNED_IN event sets loading=true"
elif grep -A2 "SIGNED_IN" src/hooks/useAuth.ts 2>/dev/null | grep -q "setLoading(true)"; then
  pass "SIGNED_IN event sets loading=true"
else
  fail "SIGNED_IN event does NOT set loading=true (login race condition!)"
fi

# Check that index.tsx gates on loading
if grep -q "loading.*onboardingChecked\|loading ||" app/index.tsx 2>/dev/null; then
  pass "index.tsx gates redirects on loading state"
else
  fail "index.tsx may redirect before auth completes"
fi

# Check cleanup (unsubscribe) exists
if grep -q "subscription.unsubscribe\|unsubscribe()" src/hooks/useAuth.ts 2>/dev/null; then
  pass "Auth listener cleanup (unsubscribe) present"
else
  fail "Missing auth listener cleanup — memory leak!"
fi
echo ""

# ─── 6. Import / Dependency Checks ──────────────────────────
echo "📎 Import Checks"

# Check for unused Image imports (sign of incomplete refactor)
UNUSED_IMAGE=$(grep -rn "import.*Image.*from 'react-native'" app/ src/ --include="*.tsx" 2>/dev/null | while read line; do
  FILE=$(echo "$line" | cut -d: -f1)
  if ! grep -q "<Image" "$FILE" 2>/dev/null; then
    echo "$FILE"
  fi
done)
if [ -n "$UNUSED_IMAGE" ]; then
  warn "Files importing Image but not using it: $UNUSED_IMAGE"
else
  pass "No unused Image imports"
fi
echo ""

# ─── Summary ────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: ✅ $PASS passed  ❌ $FAIL failed  ⚠️  $WARN warnings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "🚫 VALIDATION FAILED — fix $FAIL issue(s) before pushing"
  exit 1
else
  echo "✅ All checks passed — safe to push"
  exit 0
fi
