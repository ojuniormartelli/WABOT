@echo off
title WaBot - Parando servicos

echo Parando Evolution API (Docker)...
docker compose -f "%~dp0app\docker\docker-compose.yml" down

echo Parando WaBot (Node.js)...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Servicos parados.
pause