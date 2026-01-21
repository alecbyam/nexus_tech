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

echo "==> Building web release"
flutter build web --release || {
  echo "ERROR: flutter build web --release failed"
  exit 1
}

echo "==> Build completed successfully. Output in build/web"
ls -la build/web/ | head -10


