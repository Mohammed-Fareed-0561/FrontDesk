@echo off
title FrontDesk Dev
echo Starting FrontDesk...

echo [1/3] Starting PostgreSQL...
docker compose up -d
timeout /t 3 /nobreak >nul

echo [2/3] Starting backend...
start "FrontDesk Backend" cmd /k "cd backend && npm run dev"

echo [3/3] Starting frontend...
start "FrontDesk Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo FrontDesk is running:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo.
pause
