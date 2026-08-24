# IntaSend Integration Test Script
# This script verifies that the IntaSend integration is working properly

Write-Host "🧪 Testing IntaSend Integration..." -ForegroundColor Green

# Test 1: Check if functions are deployed
Write-Host "1. Checking deployed functions..." -ForegroundColor Blue
try {
    npx supabase functions list
    Write-Host "✅ Functions listed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to list functions" -ForegroundColor Red
}

# Test 2: Check build status
Write-Host "`n2. Testing build..." -ForegroundColor Blue
try {
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
}

# Test 3: Check environment variables
Write-Host "`n3. Checking environment configuration..." -ForegroundColor Blue
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Where-Object { $_ -match "INTASEND" }
    if ($envContent.Count -gt 0) {
        Write-Host "✅ IntaSend environment variables found:" -ForegroundColor Green
        $envContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
    } else {
        Write-Host "❌ No IntaSend environment variables found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

Write-Host "`n🎉 IntaSend Integration Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Configure webhook in IntaSend Dashboard: https://dashboard.intasend.com/" -ForegroundColor White
Write-Host "2. Set webhook URL: https://fohpbqxpjrknaiqfvlgv.supabase.co/functions/v1/intasend-webhook" -ForegroundColor White
Write-Host "3. Test payment flow in production: npm run dev" -ForegroundColor White
Write-Host "4. Monitor function logs in Supabase Dashboard" -ForegroundColor White