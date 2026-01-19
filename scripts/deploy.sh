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

echo "🚀 Starting deployment..."
echo ""

echo "📦 Deploying frontend to Netlify..."
(
  cd "$FRONTEND_DIR"
  echo "  Installing dependencies..."
  npm install --silent
  
  echo "  Building frontend with VITE_API_BASE_URL=$VITE_API_BASE_URL..."
  VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build
  
  echo "  Deploying to Netlify..."
  npx --yes netlify deploy --prod --dir dist --site "$NETLIFY_SITE_ID" --auth "$NETLIFY_AUTH_TOKEN" --json > /tmp/netlify-deploy.json 2>&1 || {
    echo "❌ Netlify deployment failed. Check the output above for details." >&2
    exit 1
  }
  
  if command -v jq &> /dev/null; then
    NETLIFY_URL=$(jq -r '.site_url // empty' /tmp/netlify-deploy.json 2>/dev/null || echo "")
    if [[ -n "$NETLIFY_URL" ]]; then
      echo "  ✅ Frontend deployed to: $NETLIFY_URL"
    fi
  fi
  rm -f /tmp/netlify-deploy.json
)

echo ""
echo "🔄 Triggering backend deploy on Render..."
DEPLOY_RESPONSE=$(curl -fsS -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}' 2>&1)

if [[ $? -eq 0 ]]; then
  echo "  ✅ Backend deployment triggered successfully"
  if command -v jq &> /dev/null; then
    DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.deploy.id // empty' 2>/dev/null || echo "")
    if [[ -n "$DEPLOY_ID" ]]; then
      echo "  📋 Deploy ID: $DEPLOY_ID"
    fi
  fi
else
  echo "  ❌ Failed to trigger Render deployment. Check your RENDER_API_KEY and RENDER_SERVICE_ID." >&2
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  - Check Render dashboard for backend deployment status"
echo "  - Verify frontend is accessible at your Netlify URL"
echo "  - Test the API health endpoint: ${VITE_API_BASE_URL}/api/health"
