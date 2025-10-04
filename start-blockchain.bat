@echo off
echo Starting AgriChain Blockchain Integration...
echo.

echo Step 1: Starting Hardhat local blockchain...
start "Hardhat Network" cmd /k "cd packages\contracts && npx hardhat node"

timeout /t 5 /nobreak > nul

echo Step 2: Deploying smart contracts...
cd packages\contracts
npx hardhat run scripts/deploy.js --network localhost

timeout /t 3 /nobreak > nul

echo Step 3: Starting API Gateway with blockchain integration...
cd ..\api-gateway
start "API Gateway" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo Step 4: Starting Web Dashboard...
cd ..\web-dashboard
start "Web Dashboard" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo Step 5: Starting QR Service...
cd ..\qr-service
start "QR Service" cmd /k "npm start"

echo.
echo ✅ All services started with blockchain integration!
echo.
echo Service URLs:
echo   Hardhat Network: http://localhost:8545
echo   API Gateway: http://localhost:3000
echo   Web Dashboard: http://localhost:3001
echo   QR Service: http://localhost:3002
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /f /im node.exe
echo All services stopped.
