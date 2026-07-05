@echo off
title WaBot - Inicio Rapido

set WABOT_DIR=%~dp0
cd /d "%WABOT_DIR%"

echo Iniciando Evolution API + PostgreSQL (Docker)...
docker compose -f "app\docker\docker-compose.yml" up -d
if errorlevel 1 (
  echo Erro ao iniciar Evolution API.
  pause
  exit /b 1
)

echo Iniciando WaBot (Node.js em segundo plano)...
taskkill /f /im node.exe >nul 2>&1

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Baixe em: https://nodejs.org
  pause
  exit /b 1
)

REM Iniciar Node.js em segundo plano (start /b = sem janela nova)
start /b node app/server.js > wabot.log 2>&1

echo.
echo WaBot iniciado em segundo plano!
echo.
echo   Pagina: http://localhost:3001
echo   Parar:  execute stop-wabot.bat
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
exit