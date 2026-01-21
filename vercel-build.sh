#!/usr/bin/env bash
set -euo pipefail

# Vercel build script pour Flutter Web.
# - Télécharge Flutter (stable)
# - flutter pub get
# - flutter build web --release
#
# Output: build/web (configuré dans Vercel)

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"

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


