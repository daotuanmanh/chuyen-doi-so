@echo off
title Sales Analytics Dashboard - Clean Cache

echo.
echo 🧹 Sales Analytics Dashboard
echo ================================
echo.
echo 🗑️  Cleaning cache and build files...
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ package.json not found. Make sure you're in the project directory.
    pause
    exit /b 1
)

echo 📁 Removing .next directory...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Removed .next directory
) else (
    echo ℹ️  .next directory not found
)

echo 📁 Removing node_modules/.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Removed node_modules/.cache
) else (
    echo ℹ️  node_modules/.cache not found
)

echo 📁 Removing .turbo directory...
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo ✅ Removed .turbo directory
) else (
    echo ℹ️  .turbo directory not found
)

echo 📁 Removing dist directory...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Removed dist directory
) else (
    echo ℹ️  dist directory not found
)

echo.
echo ✅ Cache cleaning completed!
echo.
echo 💡 Next steps:
echo   1. Run dev.bat to start development server
echo   2. Or run build.bat to build for production
echo.

pause
