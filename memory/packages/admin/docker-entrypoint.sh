#!/bin/sh
set -e

# Replace API_URL_PLACEHOLDER with actual API_URL from environment variable
# Default to http://localhost:8765 if not set
API_URL=${API_URL:-http://localhost:8765}

echo "Configuring nginx with API_URL: $API_URL"

# Replace placeholder in nginx config
sed -i "s|API_URL_PLACEHOLDER|$API_URL|g" /etc/nginx/conf.d/default.conf

echo "Starting nginx..."
exec nginx -g "daemon off;"
