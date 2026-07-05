@echo off
title WaBot
color 0A
cd /d "%~dp0"
echo ========================================
echo         WaBot - WhatsApp Bot
echo ========================================
echo.
echo Iniciando servidor em segundo plano...
start "" /min node app/server.js > wabot.log 2>&1
echo.
echo Servidor iniciado! Pagina: http://localhost:3001
echo Esta janela sera fechada automaticamente.
timeout /t 3 /nobreak >nul
exit
