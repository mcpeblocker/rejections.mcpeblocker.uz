#!/bin/bash
# Production deployment script

set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Build and start services
echo "📦 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🔄 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker exec rejection-backend npm run migrate

echo "✅ Production deployment complete!"
echo "Frontend: http://localhost:${FRONTEND_PORT:-3333}"
echo "Backend: http://localhost:${BACKEND_PORT:-5555}"
