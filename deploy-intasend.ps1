# IntaSend Migration Deployment Script (PowerShell)
# This script deploys the IntaSend functions and sets up environment variables

Write-Host "🚀 Deploying IntaSend Integration..." -ForegroundColor Green

# Check if supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Deploy IntaSend functions
Write-Host "📦 Deploying IntaSend functions..." -ForegroundColor Blue

Write-Host "Deploying intasend-initiate..." -ForegroundColor Yellow
supabase functions deploy intasend-initiate

Write-Host "Deploying intasend-status..." -ForegroundColor Yellow
supabase functions deploy intasend-status

Write-Host "Deploying intasend-webhook..." -ForegroundColor Yellow
supabase functions deploy intasend-webhook

Write-Host "✅ Functions deployed successfully!" -ForegroundColor Green

# Remind about environment variables
Write-Host ""
Write-Host "⚠️  IMPORTANT: Don't forget to set these environment variables in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "INTASEND_ENV=live" -ForegroundColor Cyan
Write-Host "INTASEND_PUBLISHABLE_KEY=ISPubKey_live_624fa2ca-e63f-403c-b7f0-b80fa47ef7dc" -ForegroundColor Cyan
Write-Host "INTASEND_SECRET_KEY=ISSecretKey_live_9922eb85-7e6c-472a-8da1-0e416c1fa3d6" -ForegroundColor Cyan
Write-Host "INTASEND_WEBHOOK_SECRET=your_webhook_secret_here" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Set environment variables in Supabase Dashboard > Project Settings > Edge Functions" -ForegroundColor White
Write-Host "2. Configure webhook in IntaSend Dashboard: https://dashboard.intasend.com/" -ForegroundColor White
Write-Host "3. Set webhook URL: https://your-project.supabase.co/functions/v1/intasend-webhook" -ForegroundColor White
Write-Host "4. Test the payment flow end-to-end" -ForegroundColor White
Write-Host ""
Write-Host "🎉 IntaSend integration deployment complete!" -ForegroundColor Green