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

echo "==> Building web release (capturing full output)"
set +e  # Temporarily disable exit on error to capture full output
flutter build web --release 2>&1 | tee build.log
BUILD_EXIT_CODE=$?
set -e  # Re-enable exit on error

# Check for compilation failure message (even if exit code is 0)
if grep -qi "Failed to compile application for the Web" build.log || [[ $BUILD_EXIT_CODE -ne 0 ]]; then
  echo ""
  echo "=========================================="
  echo "BUILD FAILED - DETAILED ERROR LOG"
  echo "=========================================="
  echo ""
  echo "Exit code: $BUILD_EXIT_CODE"
  echo ""
  echo "=== First error context (best effort) ==="
  FIRST_ERR_LINE="$(grep -niE -m1 "(error|exception|failed|undefined|isn't defined|not found)" build.log | head -1 | cut -d: -f1)"
  if [[ -n "${FIRST_ERR_LINE:-}" && "${FIRST_ERR_LINE}" =~ ^[0-9]+$ ]]; then
    START=$((FIRST_ERR_LINE - 25))
    END=$((FIRST_ERR_LINE + 60))
    if [[ $START -lt 1 ]]; then START=1; fi
    echo "First match at line: $FIRST_ERR_LINE"
    sed -n "${START},${END}p" build.log || true
  else
    echo "Could not detect first error line via grep. Showing last 80 lines instead:"
    tail -80 build.log
  fi
  echo ""
  echo "=== Searching for compilation errors ==="
  grep -i "error\|failed\|exception" build.log | tail -30 || echo "No errors found in grep"
  echo ""
  echo "=== Last 150 lines of build log ==="
  tail -150 build.log
  echo ""
  echo "=== Full build.log file size ==="
  wc -l build.log || echo "Could not count lines"
  echo ""
  exit 1
fi

echo "==> Build completed successfully. Output in build/web"
ls -la build/web/ | head -10


