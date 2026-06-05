@echo off
REM Personalized Diet Recommendation System - Database Setup Script (Windows)
REM This script automates the database setup process on Windows

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Diet Recommendation System - Setup Script
echo ==========================================
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL and add it to your PATH environment variable
    pause
    exit /b 1
)

echo Please enter your MySQL connection details:
echo.

set /p DB_HOST="MySQL Host [127.0.0.1]: "
if "%DB_HOST%"=="" set DB_HOST=127.0.0.1

set /p DB_PORT="MySQL Port [3306]: "
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_USER="MySQL Username [root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="MySQL Password (leave empty if none): "

set /p DB_NAME="Database Name [diet_system]: "
if "%DB_NAME%"=="" set DB_NAME=diet_system

echo.
echo Entered Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   User: %DB_USER%
echo   Database: %DB_NAME%
echo.

set /p CONTINUE="Continue with setup? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo Creating database...

REM Create database
if "%DB_PASS%"=="" (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
) else (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
)

if errorlevel 1 (
    echo ERROR: Failed to create database. Check your credentials.
    pause
    exit /b 1
)

echo Database created successfully
echo.
echo Importing schema...

REM Import schema
if not exist "database_schema.sql" (
    echo ERROR: database_schema.sql not found in current directory
    echo Please run this script from the Diet_System directory
    pause
    exit /b 1
)

if "%DB_PASS%"=="" (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %DB_NAME% < database_schema.sql >nul 2>&1
) else (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% < database_schema.sql >nul 2>&1
)

if errorlevel 1 (
    echo ERROR: Failed to import schema.
    pause
    exit /b 1
)

echo Schema imported successfully
echo.
echo Updating configuration...

REM Backup existing config
if exist "config\db.php" (
    copy "config\db.php" "config\db.php.backup" >nul
    echo Created backup: config\db.php.backup
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Update \config\db.php with your credentials if needed:
echo      DB_HOST = %DB_HOST%
echo      DB_PORT = %DB_PORT%
echo      DB_USER = %DB_USER%
echo      DB_NAME = %DB_NAME%
echo.
echo   2. Start the development server:
echo      php -S localhost:8000
echo.
echo   3. Test the API:
echo      curl -X POST http://localhost:8000/api/auth/register.php ^
echo        -H "Content-Type: application/json" ^
echo        -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"user\"}"
echo.
echo   4. Read the documentation:
echo      - API_DOCUMENTATION.md = Complete endpoint reference
echo      - BACKEND_SETUP_GUIDE.md = Detailed setup guide
echo.

pause
