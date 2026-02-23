#!/bin/bash
# Build script for CME Agent web deployment
# Combines Expo web export with static marketing + admin pages

set -e

echo "=== CME Agent Web Build ==="

# Step 1: Clean and export Expo web app
echo "[1/4] Building Expo web export..."
rm -rf node_modules/.cache
rm -rf .expo
npx expo export --platform web --clear

# Step 2: Move Expo's index.html to app.html (it becomes the /app route)
echo "[2/4] Relocating Expo SPA entry..."
mv dist/index.html dist/app.html

# Step 3: Copy static pages (marketing, admin) into dist
echo "[3/4] Copying static pages..."
cp -r public/* dist/

# Step 4: Verify output
echo "[4/4] Verifying build output..."
echo "  dist/index.html (marketing) — $(test -f dist/index.html && echo 'OK' || echo 'MISSING')"
echo "  dist/app.html (expo app)    — $(test -f dist/app.html && echo 'OK' || echo 'MISSING')"
echo "  dist/admin/index.html       — $(test -f dist/admin/index.html && echo 'OK' || echo 'MISSING')"
echo "  dist/admin/login.html       — $(test -f dist/admin/login.html && echo 'OK' || echo 'MISSING')"

echo ""
echo "=== Build complete ==="
