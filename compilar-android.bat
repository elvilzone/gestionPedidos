@echo off
echo.
echo ============================================
echo   Pabel's Reposteria - Compilar para Android
echo ============================================
echo.
echo [1/2] Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR en la compilacion. Revisa los errores arriba.
    pause
    exit /b 1
)
echo.
echo [2/2] Sincronizando con Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR en la sincronizacion.
    pause
    exit /b 1
)
echo.
echo ============================================
echo  LISTO! Ahora en Android Studio:
echo  1. Build - Clean Project
echo  2. Build - Build APK
echo ============================================
echo.
pause
