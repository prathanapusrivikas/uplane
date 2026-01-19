#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-"$ROOT_DIR/web"}"

# Load .env.deploy if it exists
if [[ -f "$ROOT_DIR/.env.deploy" ]]; then
  echo "Loading environment variables from .env.deploy..."
  set -a
  source "$ROOT_DIR/.env.deploy"
  set +a
fi

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "❌ Missing required env var: $name" >&2
    echo "" >&2
    echo "See docs/DEPLOYMENT_ENV_VARS.md for instructions on where to get this value." >&2
    exit 1
  fi
}

require_env VITE_API_BASE_URL
require_env NETLIFY_AUTH_TOKEN
require_env NETLIFY_SITE_ID
require_env RENDER_API_KEY
require_env RENDER_SERVICE_ID

echo "Deploying frontend (Netlify)..."
(
  cd "$FRONTEND_DIR"
  npm install
  VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build
  npx --yes netlify deploy --prod --dir dist --site "$NETLIFY_SITE_ID" --auth "$NETLIFY_AUTH_TOKEN"
)

echo "Triggering backend deploy (Render)..."
curl -fsS -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo "Deploy triggered for backend and frontend."
