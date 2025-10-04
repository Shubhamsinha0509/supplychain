# AgriChain Blockchain Integration Startup Script
Write-Host "🚀 Starting AgriChain Blockchain Integration..." -ForegroundColor Green
Write-Host ""

# Step 1: Start Hardhat local blockchain
Write-Host "Step 1: Starting Hardhat local blockchain..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\contracts'; npx hardhat node"

Start-Sleep -Seconds 5

# Step 2: Deploy smart contracts
Write-Host "Step 2: Deploying smart contracts..." -ForegroundColor Yellow
Set-Location "packages\contracts"
npx hardhat run scripts/deploy.js --network localhost

Start-Sleep -Seconds 3

# Step 3: Start API Gateway with blockchain integration
Write-Host "Step 3: Starting API Gateway with blockchain integration..." -ForegroundColor Yellow
Set-Location "..\api-gateway"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\api-gateway'; npm start"

Start-Sleep -Seconds 3

# Step 4: Start Web Dashboard
Write-Host "Step 4: Starting Web Dashboard..." -ForegroundColor Yellow
Set-Location "..\web-dashboard"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\web-dashboard'; npm run dev"

Start-Sleep -Seconds 3

# Step 5: Start QR Service
Write-Host "Step 5: Starting QR Service..." -ForegroundColor Yellow
Set-Location "..\qr-service"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\qr-service'; npm start"

Write-Host ""
Write-Host "✅ All services started with blockchain integration!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  Hardhat Network: http://localhost:8545" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "  Web Dashboard: http://localhost:3001" -ForegroundColor White
Write-Host "  QR Service: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Gray
Read-Host
