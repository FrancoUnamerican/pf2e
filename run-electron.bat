@echo off
echo Installing dependencies...
call npm install --ignore-scripts
echo.
echo Starting Electron...
call npm run electron-dev
pause
