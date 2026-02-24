#!/bin/bash
# Build script for CME Agent web deployment
# Combines Expo web export with static marketing + admin pages
#
# IMPORTANT: Expo's `export` command copies public/* into dist/,
# which overwrites Expo's own index.html with our marketing page.
# We temporarily hide marketing index.html during the Expo build
# to preserve the Expo SPA shell, then overlay our static pages after.

set -e

echo "=== CME Agent Web Build ==="

# Step 1: Temporarily move marketing index.html so Expo doesn't overwrite its shell
echo "[1/5] Preserving marketing index from Expo copy..."
if [ -f public/index.html ]; then
    mv public/index.html public/_index_marketing.html
fi

# Step 2: Export Expo web app (creates dist/ with Expo's own index.html intact)
echo "[2/5] Building Expo web export..."
rm -rf node_modules/.cache
rm -rf .expo
npx expo export --platform web --clear

# Step 3: Restore marketing index.html to public/
echo "[3/5] Restoring marketing index..."
if [ -f public/_index_marketing.html ]; then
    mv public/_index_marketing.html public/index.html
fi

# Step 4: Move Expo's index.html to app.html (it becomes the /app route)
echo "[4/5] Relocating Expo SPA entry to app.html..."
mv dist/index.html dist/app.html

# Step 5: Copy static pages (marketing, admin, blog) into dist
echo "[5/5] Copying static pages..."
cp -r public/* dist/

# Verify output
echo ""
echo "=== Verifying build output ==="
echo "  dist/index.html (marketing)   — $(test -f dist/index.html && echo 'OK' || echo 'MISSING')"
echo "  dist/app.html (expo SPA)      — $(test -f dist/app.html && echo 'OK' || echo 'MISSING')"
echo "  dist/blog.html                — $(test -f dist/blog.html && echo 'OK' || echo 'MISSING')"
echo "  dist/admin-teams.html         — $(test -f dist/admin-teams.html && echo 'OK' || echo 'MISSING')"
echo "  dist/admin/index.html         — $(test -f dist/admin/index.html && echo 'OK' || echo 'MISSING')"
echo "  dist/admin/login.html         — $(test -f dist/admin/login.html && echo 'OK' || echo 'MISSING')"

# Sanity check: app.html should contain Expo script tag, index.html should not
if grep -q '_expo/static/js' dist/app.html 2>/dev/null; then
    echo "  app.html contains Expo bundle  — OK"
else
    echo "  WARNING: app.html may not contain Expo bundle!"
fi

echo ""
echo "=== Build complete ==="
