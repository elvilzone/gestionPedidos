@echo off
echo Iniciando TortasBO - App de Gestion de Pedidos...

echo.
echo Iniciando el Servidor Backend...
start "TortasBO - Backend" cmd /c "cd server && npm run dev"

echo.
echo Iniciando el Cliente Frontend...
start "TortasBO - Frontend" cmd /c "npm run dev"

echo.
echo Servicios iniciados en ventanas separadas.
