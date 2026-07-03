@echo off
title WaBot - Atualizar
color 0E
cd /d "%~dp0"
echo ========================================
echo    WaBot - Atualizacao Manual
echo ========================================
echo.
echo Parando servidor...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Baixando atualizacoes do GitHub...
git pull origin main
echo.
echo Instalando dependencias...
call npm install
echo.
echo Iniciando servidor...
start /B "" node app/server.js
echo.
echo ========================================
echo  Servidor atualizado e reiniciado!
echo  Acesse: http://localhost:3001
echo ========================================
echo.
pause
