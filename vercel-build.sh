#!/usr/bin/env bash
set -e

# Vercel build script pour Flutter Web.
# - Télécharge Flutter (stable)
# - flutter pub get
# - flutter build web --release
#
# Output: build/web (configuré dans Vercel)

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"

echo "==> Checking environment variables..."
if [[ -z "${SUPABASE_URL:-}" ]]; then
  echo "ERROR: SUPABASE_URL is not set in Vercel Environment Variables"
  exit 1
fi
if [[ -z "${SUPABASE_ANON_KEY:-}" ]]; then
  echo "ERROR: SUPABASE_ANON_KEY is not set in Vercel Environment Variables"
  exit 1
fi
if [[ -z "${WHATSAPP_PHONE:-}" ]]; then
  echo "ERROR: WHATSAPP_PHONE is not set in Vercel Environment Variables"
  exit 1
fi

echo "==> Generating .env from Vercel Environment Variables"
cat > .env <<EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
WHATSAPP_PHONE=${WHATSAPP_PHONE}
EOF
echo ".env file created successfully"

echo "==> Installing Flutter ($FLUTTER_VERSION)"
if [[ ! -d ".flutter" ]]; then
  echo "Cloning Flutter repository..."
  git clone --depth 1 --branch "$FLUTTER_VERSION" https://github.com/flutter/flutter.git .flutter || {
    echo "ERROR: Failed to clone Flutter repository"
    exit 1
  }
else
  echo "Flutter already installed, skipping clone"
fi

export PATH="$PWD/.flutter/bin:$PATH"

echo "==> Flutter version:"
flutter --version || {
  echo "ERROR: Flutter not found in PATH"
  exit 1
}

echo "==> Running flutter pub get"
flutter pub get || {
  echo "ERROR: flutter pub get failed"
  exit 1
}

echo "==> Verifying .env file exists"
if [[ ! -f ".env" ]]; then
  echo "ERROR: .env file not found after generation"
  exit 1
fi
echo ".env file content (first 3 lines):"
head -3 .env

echo "==> Verifying pubspec.yaml assets"
grep -A 5 "assets:" pubspec.yaml || echo "WARNING: No assets section found"

echo "==> Running flutter analyze"
flutter analyze || echo "WARNING: flutter analyze found issues (continuing anyway)"

echo "==> Building web release"
set +e  # Temporarily disable exit on error to capture full output
flutter build web --release 2>&1 | tee build.log
BUILD_EXIT_CODE=$?
set -e  # Re-enable exit on error

if [[ $BUILD_EXIT_CODE -ne 0 ]]; then
  echo "ERROR: flutter build web --release failed with exit code $BUILD_EXIT_CODE"
  echo ""
  echo "=== Last 100 lines of build log ==="
  tail -100 build.log
  echo ""
  echo "=== Searching for ERROR in build log ==="
  grep -i "error" build.log | tail -20 || echo "No 'error' found in log"
  exit 1
fi

# Some CI environments have been observed to print compile errors while still returning exit code 0.
# Treat this as a hard failure so we don't deploy a broken bundle (blank screen).
if grep -q "Failed to compile application for the Web" build.log; then
  echo "ERROR: Flutter reported 'Failed to compile application for the Web' (even though exit code was 0)"
  echo ""
  echo "=== First occurrence context ==="
  grep -n "Failed to compile application for the Web" -n build.log | head -1 || true
  echo ""
  echo "=== Last 120 lines of build log ==="
  tail -120 build.log
  exit 1
fi

echo "==> Build completed successfully. Output in build/web"
ls -la build/web/ | head -10


