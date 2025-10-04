@echo off
echo Starting Blockchain Supply Chain Application (Working Services)...
echo.

echo Starting API Gateway on port 3000...
start "API Gateway" cmd /k "cd packages\api-gateway && npm start"

timeout /t 3 /nobreak > nul

echo Starting Web Dashboard on port 3001...
start "Web Dashboard" cmd /k "cd packages\web-dashboard && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting QR Service on port 3002...
start "QR Service" cmd /k "cd packages\qr-service && npm start"

echo.
echo Services starting...
echo API Gateway: http://localhost:3000
echo Web Dashboard: http://localhost:3001
echo QR Service: http://localhost:3002
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /f /im node.exe
echo All services stopped.
