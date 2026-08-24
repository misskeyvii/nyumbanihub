#!/bin/bash

# IntaSend Migration Deployment Script
# This script deploys the IntaSend functions and sets up environment variables

echo "🚀 Deploying IntaSend Integration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy IntaSend functions
echo "📦 Deploying IntaSend functions..."

echo "Deploying intasend-initiate..."
supabase functions deploy intasend-initiate

echo "Deploying intasend-status..."
supabase functions deploy intasend-status

echo "Deploying intasend-webhook..."
supabase functions deploy intasend-webhook

echo "✅ Functions deployed successfully!"

# Remind about environment variables
echo ""
echo "⚠️  IMPORTANT: Don't forget to set these environment variables in Supabase Dashboard:"
echo ""
echo "INTASEND_ENV=live"
echo "INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc"
echo "INTASEND_SECRET_KEY=ISSecretKey_live_9922eb85-7e6c-472a-8da1-0e416c1fa3d6" 
echo "INTASEND_WEBHOOK_SECRET=your_webhook_secret_here"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Supabase Dashboard > Project Settings > Edge Functions"
echo "2. Configure webhook in IntaSend Dashboard: https://dashboard.intasend.com/"
echo "3. Set webhook URL: https://your-project.supabase.co/functions/v1/intasend-webhook"
echo "4. Test the payment flow end-to-end"
echo ""
echo "🎉 IntaSend integration deployment complete!"