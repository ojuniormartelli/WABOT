@echo off
title WaBot - Atualizar
color 0E
cd /d "%~dp0"
echo ========================================
echo    WaBot - Atualizacao Automatica
echo ========================================
echo.
echo 1. Parando servidor atual...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo 2. Baixando atualizacoes do GitHub...
git pull origin main
if errorlevel 1 (
  echo   Erro ao baixar atualizacoes.
  pause
  exit /b 1
)
echo.
echo 3. Instalando dependencias...
call npm install
echo.
echo 4. Iniciando servidor em segundo plano...
powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'app/server.js'"
echo.
echo ========================================
echo   Servidor atualizado e reiniciado!
echo   Acesse: http://localhost:3001
echo ========================================
timeout /t 3 /nobreak >nul
