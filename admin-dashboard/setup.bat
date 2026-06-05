@echo off
REM Diet System Admin Dashboard - Setup Script for Windows
REM This script automates the setup process

echo.
echo 🚀 Diet System Admin Dashboard Setup
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ %NODE_VERSION% detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start dev server: npm run dev
echo 2. Open browser: http://localhost:5173
echo 3. Configure API endpoint in vite.config.js
echo.
echo 📚 Documentation:
echo - Quick Start: QUICKSTART.md
echo - Full Docs: README.md
echo - Project Structure: PROJECT_STRUCTURE.md
echo.
echo Happy coding! 🚀
pause
