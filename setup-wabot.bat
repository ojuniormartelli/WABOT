@echo off
setlocal enabledelayedexpansion
title WaBot - Configurador Automatico

echo.
echo ============================================
echo   WaBot - Configurador Automatico
echo ============================================
echo.

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

set WABOT_DIR=%~dp0

set S1=0
set S2=0
set S3=0
set S4=0
set S5=0
set S6=0

REM =============================================
REM  1 - Verificar arquivos necessarios
REM =============================================
echo [%CYAN%1[%RESET] Verificando arquivos necessarios...

set MISSING=0
if not exist "%WABOT_DIR%app\server.js" (
  echo   %RED%X[%RESET] server.js nao encontrado
  set MISSING=1
)
if not exist "%WABOT_DIR%app\docker\docker-compose.yml" (
  echo   %RED%X[%RESET] docker-compose.yml nao encontrado
  set MISSING=1
)
if not exist "%WABOT_DIR%app\renderer\index.html" (
  echo   %RED%X[%RESET] index.html nao encontrado
  set MISSING=1
)

REM Criar data/ com defaults se nao existir (preserva dados existentes)
if not exist "%WABOT_DIR%app\data\" mkdir "%WABOT_DIR%app\data\"
if not exist "%WABOT_DIR%app\data\config.json" (
  echo   Criando config.json padrao...
  echo { "nome_negocio": "Meu Negocio", "endereco": "", "telefone": "", "horarios": {}, "tipos_atendimento": [] } > "%WABOT_DIR%app\data\config.json"
)
if not exist "%WABOT_DIR%app\data\credentials.json" (
  echo   Criando credentials.json padrao...
  echo { "evolution": {}, "gemini": {}, "llm": { "provider": "groq", "api_key": "", "model": "llama-3.3-70b-versatile" } } > "%WABOT_DIR%app\data\credentials.json"
)
if not exist "%WABOT_DIR%app\data\regras.json" echo [] > "%WABOT_DIR%app\data\regras.json"
if not exist "%WABOT_DIR%app\data\ignorados.json" echo [] > "%WABOT_DIR%app\data\ignorados.json"
if not exist "%WABOT_DIR%app\data\conversas.json" echo [] > "%WABOT_DIR%app\data\conversas.json"

if %MISSING%==0 (
  echo   %GREEN%OK%RESET] Todos os arquivos encontrados
  set S1=1
)
if %MISSING%==1 (
  echo.
  echo %RED%Erro: Extraia o ZIP novamente e tente outra vez.%RESET
  pause
  exit /b 1
)

echo.

REM =============================================
REM  2 - Verificar Docker
REM =============================================
echo [%CYAN%2[%RESET] Verificando Docker...

set DOCKER_FOUND=0
docker --version >nul 2>&1
if not errorlevel 1 set DOCKER_FOUND=1

if !DOCKER_FOUND!==0 (
  if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" set DOCKER_FOUND=1
  if exist "C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe" set DOCKER_FOUND=1
  if exist "%LOCALAPPDATA%\Docker\Docker Desktop\Docker Desktop.exe" set DOCKER_FOUND=1
)

if !DOCKER_FOUND!==0 (
  echo   %YELLOW!%RESET] Docker nao encontrado.
  echo.
  echo Baixe o Docker Desktop em:
  echo   https://www.docker.com/products/docker-desktop/
  echo.
  pause
  exit /b 1
)

docker --version >nul 2>&1
if errorlevel 1 (
  echo   %YELLOW!%RESET] Docker CLI fora do PATH. Iniciando Docker Desktop...
  if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  ) else if exist "%LOCALAPPDATA%\Docker\Docker Desktop\Docker Desktop.exe" (
    start "" "%LOCALAPPDATA%\Docker\Docker Desktop\Docker Desktop.exe"
  )
  echo   Aguardando 20 segundos...
  timeout /t 20 >nul
  docker --version >nul 2>&1
  if errorlevel 1 (
    echo   %RED%Falha. Marque "Add to PATH" na instalacao do Docker.%RESET
    pause
    exit /b 1
  )
)

for /f "tokens=*" %%i in ('docker --version') do echo   %GREEN%OK%RESET] %%i

docker info >nul 2>&1
if errorlevel 1 (
  echo   %YELLOW!%RESET] Docker Daemon parado. Iniciando...
  if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  ) else if exist "%LOCALAPPDATA%\Docker\Docker Desktop\Docker Desktop.exe" (
    start "" "%LOCALAPPDATA%\Docker\Docker Desktop\Docker Desktop.exe"
  )
  timeout /t 20 >nul
  docker info >nul 2>&1
  if errorlevel 1 (
    echo   %RED%Falha. Inicie o Docker Desktop manualmente.%RESET
    pause
    exit /b 1
  )
)
echo   %GREEN%OK%RESET] Docker Daemon em execucao
set S2=1

echo.

REM =============================================
REM  3 - Verificar dependencias Node
REM =============================================
echo [%CYAN%3[%RESET] Verificando dependencias Node...

cd /d "%WABOT_DIR%"
if not exist "node_modules" (
  echo   Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo   %RED%Erro ao instalar dependencias.%RESET
    pause
    exit /b 1
  )
)
echo   %GREEN%OK%RESET] Dependencias instaladas
set S3=1

echo.

REM =============================================
REM  4 - Iniciar Evolution API (Docker)
REM =============================================
echo [%CYAN%4[%RESET] Iniciando servicos Docker...

docker compose -f app\docker\docker-compose.yml down >nul 2>&1
echo   Baixando imagens (Evolution API + PostgreSQL)...
docker compose -f app\docker\docker-compose.yml pull
docker compose -f app\docker\docker-compose.yml up -d --force-recreate

if errorlevel 1 (
  echo   %RED%Erro ao iniciar Evolution API.%RESET
  echo.
  echo   Execute manualmente para ver o erro completo:
  echo     docker compose -f app\docker\docker-compose.yml up -d evolution
  pause
  exit /b 1
)

REM Verify the container is actually running
docker ps --filter name=wabot-evolution --format "{{.Status}}" | findstr "Up" >nul 2>&1
if errorlevel 1 (
  echo   %YELLOW!%RESET] Container Evolution API nao esta "Up".
  echo   Verifique os logs:
  echo     docker logs wabot-evolution --tail 30
) else (
  echo   %GREEN%OK%RESET] Evolution API iniciada
  set S4=1
)

echo.

REM =============================================
REM  5 - Iniciar WaBot (Node.js direto)
REM =============================================
echo [%CYAN%5[%RESET] Iniciando WaBot...

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
  echo   %RED%Node.js nao encontrado. Baixe em: https://nodejs.org%RESET
  pause
  exit /b 1
)

taskkill /f /im node.exe >nul 2>&1
cd /d "%WABOT_DIR%"
if exist "npm-debug.log" del "npm-debug.log" 2>nul

REM Iniciar Node.js oculto (Start-Process direto, sem cmd nem redirecionamento)
powershell -Command "Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'app/server.js'"

REM Aguardar e verificar se subiu
timeout /t 2 >nul
tasklist /fi "imagename eq node.exe" 2>nul | findstr /i node.exe >nul
if errorlevel 1 (
  echo   %YELLOW!%RESET] WaBot pode nao ter iniciado. Verifique wabot.log
) else (
  echo   %GREEN%OK%RESET] WaBot iniciado (oculto)
  set S5=1
)

echo.

REM =============================================
REM  6 - Aguardar servicos
REM =============================================
echo [%CYAN%6[%RESET] Aguardando servicos ficarem prontos...
echo.

set EVO_OK=0
set WAIT=0
echo   Aguardando servicos (ate 75s)...
:wait_evo
if !WAIT! GTR 25 (
  echo   %YELLOW!%RESET] Evolution API nao respondeu apos 75s.
  echo   Verifique os logs do container:
  echo     docker logs wabot-evolution --tail 50
  goto after_evo
)
set /a WAIT+=1
curl -s http://localhost:8081/ >nul 2>&1
if not errorlevel 1 (
  echo   %GREEN%OK%RESET] Evolution API online
  set EVO_OK=1
  goto after_evo
)
timeout /t 3 >nul
goto wait_evo
:after_evo

if !EVO_OK!==1 (
  set BOT_OK=0
  set WAIT=0
  echo   Aguardando WaBot (ate 60s)...
  :wait_bot
  if !WAIT! GTR 20 (
    echo   %YELLOW!%RESET] WaBot nao respondeu a tempo.
    echo   Veja o log em: wabot.log
    goto after_bot
  )
  set /a WAIT+=1
  curl -s http://localhost:3001/ >nul 2>&1
  if not errorlevel 1 (
    echo   %GREEN%OK%RESET] WaBot online
    set BOT_OK=1
    set S6=1
    goto after_bot
  )
  timeout /t 3 >nul
  goto wait_bot
)
:after_bot

echo.

REM =============================================
REM  RESUMO FINAL
REM =============================================
cls
echo ============================================
echo          RESUMO - WaBot
echo ============================================
echo.
echo   Etapa                     Status
echo   ------------------------- --------
if !S1!==1 (echo   Arquivos          ... %GREEN%OK%RESET]) else (echo   Arquivos          ... %RED%X%RESET])
if !S2!==1 (echo   Docker            ... %GREEN%OK%RESET]) else (echo   Docker            ... %RED%X%RESET])
if !S3!==1 (echo   Dependencias      ... %GREEN%OK%RESET]) else (echo   Dependencias      ... %RED%X%RESET])
if !S4!==1 (echo   Evolution API     ... %GREEN%OK%RESET]) else (echo   Evolution API     ... %RED%X%RESET])
if !S5!==1 (echo   WaBot             ... %GREEN%OK%RESET]) else (echo   WaBot             ... %RED%X%RESET])
if !S6!==1 (echo   Servicos Online   ... %GREEN%OK%RESET]) else (echo   Servicos Online   ... %RED%X%RESET])
echo   ------------------------- --------
if !S1!!S2!!S3!!S4!!S5!!S6!==111111 (
  echo   %GREEN%  Tudo OK! Sistema pronto.%RESET
) else (
  echo   %YELLOW%  Alguns servicos podem nao ter iniciado.%RESET
)
echo.
echo   WaBot disponivel em: %CYAN%http://localhost:3001%RESET
echo.
echo ============================================
echo.
echo   Abrindo navegador...
start "" "http://localhost:3001"
timeout /t 2 >nul