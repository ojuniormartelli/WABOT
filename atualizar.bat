@echo off
title WaBot - Atualizar
color 0E
cd /d "%~dp0"
echo ========================================
echo    WaBot - Atualizacao Automatica
echo ========================================
echo.
echo Parando servidor WaBot...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Baixando e instalando atualizacoes...
node atualizar.js
echo.
pause
