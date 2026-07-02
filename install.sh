#!/usr/bin/env bash
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")" && pwd)"
S1=0 S2=0 S3=0 S4=0 S5=0 S6=0

GREEN='\033[92m'
RED='\033[91m'
YELLOW='\033[93m'
CYAN='\033[96m'
RESET='\033[0m'

echo ""
echo "============================================"
echo "  WaBot - Configurador Automático (macOS)"
echo "============================================"
echo ""

# ─── 1. Verificar arquivos ──────────────────────
echo -e "${CYAN}1${RESET} Verificando arquivos necessários..."
MISSING=0
for f in "app/server.js" "app/docker/docker-compose.yml" "app/renderer/index.html"; do
  if [ ! -f "$WABOT_DIR/$f" ]; then
    echo -e "  ${RED}X${RESET} $f não encontrado"
    MISSING=1
  fi
done

mkdir -p "$WABOT_DIR/app/data"
for f in config.json regras.json ignorados.json conversas.json; do
  if [ ! -f "$WABOT_DIR/app/data/$f" ]; then
    case "$f" in
      config.json) echo '{ "nome_negocio": "Meu Negocio", "endereco": "", "telefone": "", "horarios": {}, "tipos_atendimento": [] }' > "$WABOT_DIR/app/data/$f" ;;
      regras.json|ignorados.json|conversas.json) echo '[]' > "$WABOT_DIR/app/data/$f" ;;
    esac
  fi
done
if [ ! -f "$WABOT_DIR/app/data/credentials.json" ]; then
  echo "Criando credentials.json (configure suas chaves depois)"
  cat > "$WABOT_DIR/app/data/credentials.json" << 'CREDEOF'
{
  "evolution": { "api_key": "wabot_evokey_2026", "base_url": "http://localhost:8081", "instance_name": "" },
  "gemini": { "api_key": "", "model": "gemini-2.0-flash" },
  "n8n": { "url": "http://localhost:5678", "api_key": "" },
  "llm": { "provider": "groq", "api_key": "", "model": "llama-3.3-70b-versatile" },
  "setup_completo": false
}
CREDEOF
fi

if [ $MISSING -eq 0 ]; then
  echo -e "  ${GREEN}OK${RESET} Todos os arquivos encontrados"
  S1=1
else
  echo -e "\n${RED}Erro: Extraia o ZIP novamente.${RESET}"
  exit 1
fi
echo ""

# ─── 2. Verificar Docker ────────────────────────
echo -e "${CYAN}2${RESET} Verificando Docker..."
if command -v docker &>/dev/null; then
  echo -e "  ${GREEN}OK${RESET} $(docker --version)"
  S2=1
else
  echo -e "  ${YELLOW}!${RESET} Docker não encontrado."
  echo "  Baixe em: https://www.docker.com/products/docker-desktop/"
  echo "  (O WaBot funciona sem Docker, mas sem Evolution API)"
fi
echo ""

# ─── 3. Instalar dependências Node ──────────────
echo -e "${CYAN}3${RESET} Verificando dependências Node..."
cd "$WABOT_DIR"
if [ ! -d "node_modules" ]; then
  echo "  Instalando dependências..."
  npm install
fi
echo -e "  ${GREEN}OK${RESET} Dependências instaladas"
S3=1
echo ""

# ─── 4. Iniciar Evolution API (Docker) ──────────
echo -e "${CYAN}4${RESET} Iniciando serviços Docker..."
if command -v docker &>/dev/null; then
  docker compose -f app/docker/docker-compose.yml down 2>/dev/null || true
  docker compose -f app/docker/docker-compose.yml pull
  docker compose -f app/docker/docker-compose.yml up -d --force-recreate && S4=1 || echo -e "  ${YELLOW}!${RESET} Falha ao iniciar Evolution API"
else
  echo -e "  ${YELLOW}!${RESET} Docker não disponível, pulando"
fi
echo ""

# ─── 5. Iniciar WaBot ───────────────────────────
echo -e "${CYAN}5${RESET} Iniciando WaBot..."
pkill -f "node app/server.js" 2>/dev/null || true
cd "$WABOT_DIR"
nohup node app/server.js > wabot.log 2>&1 &
WABOT_PID=$!
echo "  PID: $WABOT_PID"
echo -e "  ${GREEN}OK${RESET} WaBot iniciado (oculto)"
S5=1
echo ""

# ─── 6. Aguardar serviços ──────────────────────
echo -e "${CYAN}6${RESET} Aguardando serviços ficarem prontos..."
WAIT=0
while [ $WAIT -lt 25 ]; do
  if curl -sf http://localhost:8081/ >/dev/null 2>&1; then
    echo -e "  ${GREEN}OK${RESET} Evolution API online"
    S4=1
    break
  fi
  sleep 3
  WAIT=$((WAIT + 1))
done

WAIT=0
while [ $WAIT -lt 20 ]; do
  if curl -sf http://localhost:3001/ >/dev/null 2>&1; then
    echo -e "  ${GREEN}OK${RESET} WaBot online"
    S6=1
    break
  fi
  sleep 3
  WAIT=$((WAIT + 1))
done
echo ""

# ─── RESUMO ─────────────────────────────────────
clear 2>/dev/null || true
echo "============================================"
echo "          RESUMO - WaBot"
echo "============================================"
echo ""
printf "  %-20s %s\n" "Arquivos" "$([ $S1 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${RED}X${RESET}")"
printf "  %-20s %s\n" "Docker" "$([ $S2 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${YELLOW}!${RESET}")"
printf "  %-20s %s\n" "Dependências" "$([ $S3 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${RED}X${RESET}")"
printf "  %-20s %s\n" "Evolution API" "$([ $S4 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${YELLOW}!${RESET}")"
printf "  %-20s %s\n" "WaBot" "$([ $S5 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${RED}X${RESET}")"
printf "  %-20s %s\n" "Serviços Online" "$([ $S6 -eq 1 ] && echo "${GREEN}OK${RESET}" || echo "${YELLOW}!${RESET}")"
echo "  ------------------------- --------"
if [ "$S1$S2$S3$S4$S5$S6" = "111111" ]; then
  echo -e "  ${GREEN}  Tudo OK! Sistema pronto.${RESET}"
else
  echo -e "  ${YELLOW}  Alguns serviços podem não ter iniciado.${RESET}"
fi
echo ""
echo -e "  WaBot disponível em: ${CYAN}http://localhost:3001${RESET}"
echo ""
echo "============================================"
echo ""
open "http://localhost:3001" 2>/dev/null || xdg-open "http://localhost:3001" 2>/dev/null || true
