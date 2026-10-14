#!/usr/bin/env bash
# Render Build Script for aju.lu (Hugo Extended)
set -eo pipefail

HUGO_VERSION="${HUGO_VERSION:-0.145.0}"

echo "==> Preparing Hugo Extended v${HUGO_VERSION} for Render..."

# Determine if installed Hugo matches requirement and is extended
NEED_INSTALL=true
if command -v hugo &> /dev/null; then
  CURRENT_VERSION=$(hugo version 2>&1 || true)
  if echo "$CURRENT_VERSION" | grep -q "v${HUGO_VERSION}" && echo "$CURRENT_VERSION" | grep -qi "extended"; then
    echo "==> Pre-installed Hugo Extended matches: $CURRENT_VERSION"
    NEED_INSTALL=false
  fi
fi

if [ "$NEED_INSTALL" = true ]; then
  echo "==> Downloading Hugo Extended v${HUGO_VERSION} (linux-amd64)..."
  mkdir -p /tmp/hugo-install
  TAR_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  
  if curl -sSLf "$TAR_URL" -o /tmp/hugo-install/hugo.tar.gz; then
    tar -xzf /tmp/hugo-install/hugo.tar.gz -C /tmp/hugo-install/
    mkdir -p "$PWD/bin"
    mv /tmp/hugo-install/hugo "$PWD/bin/hugo"
    chmod +x "$PWD/bin/hugo"
    export PATH="$PWD/bin:$PATH"
    rm -rf /tmp/hugo-install
    echo "==> Installed Hugo Extended to $PWD/bin/hugo"
  else
    echo "==> Warning: Download failed, falling back to ambient hugo..."
  fi
fi

echo "==> Using $(hugo version)"

# Build site
if [ -n "$RENDER_EXTERNAL_URL" ]; then
  echo "==> Building site with baseURL: $RENDER_EXTERNAL_URL"
  hugo --gc --minify -b "$RENDER_EXTERNAL_URL"
else
  echo "==> Building site with default baseURL..."
  hugo --gc --minify
fi

echo "==> Build complete! Output generated in public/"
