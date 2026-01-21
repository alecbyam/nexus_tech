#!/usr/bin/env bash
set -euo pipefail

# Vercel build script pour Flutter Web.
# - Télécharge Flutter (stable)
# - flutter pub get
# - flutter build web --release
#
# Output: build/web (configuré dans Vercel)

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"

echo "==> Generating .env from Vercel Environment Variables"
# Vercel injecte les variables dans l'environnement du build.
# Flutter lit .env via flutter_dotenv (asset), donc on le génère ici.
: "${SUPABASE_URL:?Missing SUPABASE_URL in Vercel Environment Variables}"
: "${SUPABASE_ANON_KEY:?Missing SUPABASE_ANON_KEY in Vercel Environment Variables}"
: "${WHATSAPP_PHONE:?Missing WHATSAPP_PHONE in Vercel Environment Variables}"

cat > .env <<EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
WHATSAPP_PHONE=${WHATSAPP_PHONE}
EOF

echo "==> Installing Flutter ($FLUTTER_VERSION)"
if [[ ! -d ".flutter" ]]; then
  git clone --depth 1 --branch "$FLUTTER_VERSION" https://github.com/flutter/flutter.git .flutter
fi

export PATH="$PWD/.flutter/bin:$PATH"

flutter --version

echo "==> Pub get"
flutter pub get

echo "==> Build web release"
flutter build web --release

echo "==> Done. Output in build/web"


