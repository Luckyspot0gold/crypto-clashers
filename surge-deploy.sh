#!/bin/bash

# Surge.sh deployment script for Crypto Clashers
echo "🥊 Deploying Crypto Clashers to Surge.sh..."

# Build the project
echo "📦 Building the project..."
npm run build

# Export static files
echo "📤 Exporting static files..."
npx next export

# Deploy to Surge
echo "🚀 Deploying to surge.sh..."
npx surge out/ cryptoclashers.surge.sh

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://cryptoclashers.surge.sh"