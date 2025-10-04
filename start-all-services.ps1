# AgriChain Services Startup Script
Write-Host "Starting AgriChain Blockchain Supply Chain Application..." -ForegroundColor Green
Write-Host ""

# Start API Gateway
Write-Host "Starting API Gateway on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\api-gateway'; npm start"

Start-Sleep -Seconds 3

# Start Web Dashboard  
Write-Host "Starting Web Dashboard on port 3001..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\web-dashboard'; npm run dev"

Start-Sleep -Seconds 3

# Start QR Service
Write-Host "Starting QR Service on port 3002..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\shubham\OneDrive\Desktop\vig-hackathon\supplychain\packages\qr-service'; npm start"

Write-Host ""
Write-Host "All services are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "   API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "   Web Dashboard: http://localhost:3001" -ForegroundColor White  
Write-Host "   QR Service: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "Open your browser and go to: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
Read-Host