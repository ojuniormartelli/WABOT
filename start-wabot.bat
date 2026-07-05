@echo off
title WaBot - Inicio Rapido

set WABOT_DIR=%~dp0

echo Iniciando Evolution API + PostgreSQL (Docker)...
docker compose -f "%WABOT_DIR%app\docker\docker-compose.yml" up -d
if errorlevel 1 (
  echo Erro ao iniciar Evolution API.
  pause
  exit /b 1
)

echo Iniciando WaBot (Node.js em segundo plano)...
taskkill /f /im node.exe >nul 2>&1
cd /d "%WABOT_DIR%"

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado. Baixe em: https://nodejs.org
  pause
  exit /b 1
)

REM Iniciar Node.js sem janela visivel (via PowerShell)
powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'app\server.js' -RedirectStandardOutput '%WABOT_DIR%wabot.log' -RedirectStandardError '%WABOT_DIR%wabot.log'"

echo.
echo WaBot iniciado em segundo plano!
echo.
echo   Pagina: http://localhost:3001
echo   Parar:  execute stop-wabot.bat
echo.
echo Esta janela sera fechada automaticamente.
echo O bot continua rodando em segundo plano.
echo.
start "" "http://localhost:3001"
exit