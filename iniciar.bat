@echo off
title WaBot
color 0A
cd /d "%~dp0"
echo ========================================
echo         WaBot - WhatsApp Bot
echo ========================================
echo.
:loop
echo [%date% %time%] Servidor iniciando...
node app/server.js
echo [%date% %time%] Servidor reiniciando...
timeout /t 2 /nobreak >nul
goto loop
