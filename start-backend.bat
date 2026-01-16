@echo off
echo Starting Prune Juice Backend Services...
echo.

echo [1/2] Starting Python AI Server on port 8000...
start "Prune Juice - Python Server" cmd /k "python bridge/python_server.py"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Node Bridge API on port 8080...
start "Prune Juice - Bridge API" cmd /k "node bridge/api-server.js"

echo.
echo ✅ Backend services started!
echo    - Python Server: http://localhost:8000
echo    - Bridge API: http://localhost:8080
echo.
echo Press any key to stop all services...
pause >nul

taskkill /FI "WINDOWTITLE eq Prune Juice*" /F
