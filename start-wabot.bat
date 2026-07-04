@echo off
title WaBot - Inicio Rapido

set TZ=America/Sao_Paulo
set WABOT_DIR=%~dp0

echo Iniciando Evolution API + PostgreSQL (Docker)...
docker compose -f "%WABOT_DIR%app\docker\docker-compose.yml" up -d
if errorlevel 1 (
  echo Erro ao iniciar Evolution API.
  pause
  exit /b 1
)

echo Iniciando WaBot (Node.js oculto)...
taskkill /f /im node.exe >nul 2>&1
cd /d "%WABOT_DIR%"

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Baixe em: https://nodejs.org
  pause
  exit /b 1
)

REM Iniciar Node.js oculto (Start-Process direto, sem cmd)
powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'app/server.js'"

echo.
echo WaBot iniciado em segundo plano!
echo.
echo   Pagina: http://localhost:3001
echo   Parar:  execute stop-wabot.bat
echo.
echo Fechando esta janela nao afeta o funcionamento do bot.
echo.
start "" "http://localhost:3001"
timeout /t 3 >nul