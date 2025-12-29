#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/memory/packages/server
npx prisma migrate deploy

echo "Starting server..."
exec node dist/main.js
