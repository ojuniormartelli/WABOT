#!/usr/bin/env bash
# WaBot — Atualização segura com backup + testes + rollback rápido
# Uso: bash scripts/update.sh
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GREEN='\033[92m'; RED='\033[91m'; YELLOW='\033[93m'; CYAN='\033[96m'; RESET='\033[0m'

echo ""
echo "============================================"
echo "  WaBot — Atualização Segura"
echo "============================================"
echo ""

# ─── 1. Verificar git ──────────────────────────
echo -e "${CYAN}1${RESET} Verificando repositório..."
if ! git -C "$WABOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  echo -e "  ${RED}X${RESET} Repositório git não encontrado."
  echo "  Use 'git clone https://github.com/ojuniormartelli/WABOT.git' primeiro."
  exit 1
fi

# Salvar commit atual para rollback
CURRENT_SHA=$(git -C "$WABOT_DIR" rev-parse HEAD)
echo "  Commit atual: $(echo "$CURRENT_SHA" | cut -c1-7)"
echo -e "  ${GREEN}OK${RESET}"

# ─── 2. Backup dos dados antes de atualizar ────
echo -e "${CYAN}2${RESET} Fazendo backup dos arquivos de dados..."
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$WABOT_DIR/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp "$WABOT_DIR/app/data/config.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/dados_negocio.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/credentials.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/conversas.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/aprendizados.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/regras.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/ignorados.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$WABOT_DIR/app/data/nao_sei.json" "$BACKUP_DIR/" 2>/dev/null || true
echo -e "  ${GREEN}OK${RESET} Backup em: backups/$TIMESTAMP/"

# ─── 3. Atualizar código ───────────────────────
echo -e "${CYAN}3${RESET} Atualizando código do repositório..."
cd "$WABOT_DIR"
git fetch origin main 2>&1 | tail -1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  echo -e "  ${YELLOW}Já está na versão mais recente.${RESET}"
  echo "  Para forçar: git pull origin main"
  echo "  Depois reinicie: pkill -f 'node app/server.js' && nohup node app/server.js > wabot.log 2>&1 &"
  exit 0
fi
git pull origin main 2>&1 | tail -5
NEW_SHA=$(git rev-parse HEAD)
echo -e "  ${GREEN}OK${RESET} Atualizado: $(echo "$CURRENT_SHA" | cut -c1-7) → $(echo "$NEW_SHA" | cut -c1-7)"

# ─── 4. npm install se package.json mudou ──────
echo -e "${CYAN}4${RESET} Verificando dependências..."
cd "$WABOT_DIR"
npm install 2>&1 | tail -3
echo -e "  ${GREEN}OK${RESET}"

# ─── 5. Validar JSON dos dados ──────────────────
echo -e "${CYAN}5${RESET} Validando arquivos de dados..."
HAS_ERROR=0
for f in "$WABOT_DIR/app/data/"*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null || {
    echo -e "  ${RED}X${RESET} $(basename "$f") — JSON inválido"
    HAS_ERROR=1
  }
done
if [ "$HAS_ERROR" -eq 1 ]; then
  echo -e "\n${RED}Arquivo de dados corrompido! Restaurando backup...${RESET}"
  cp "$BACKUP_DIR/"*.json "$WABOT_DIR/app/data/" 2>/dev/null || true
  echo -e "  ${GREEN}Backup restaurado de backups/$TIMESTAMP/${RESET}"
  echo "  Execute 'node app/test_regressao.js' para verificar."
  exit 1
fi
echo -e "  ${GREEN}OK${RESET}"

# ─── 6. Rodar testes de regressão ──────────────
echo -e "${CYAN}6${RESET} Rodando testes de regressão..."
cd "$WABOT_DIR"
if node app/test_regressao.js; then
  echo -e "  ${GREEN}OK${RESET} Testes passaram"
else
  echo -e "\n${RED}Testes falharam! Restaurando backup...${RESET}"
  cp "$BACKUP_DIR/"*.json "$WABOT_DIR/app/data/" 2>/dev/null || true
  git checkout HEAD -- app/server.js 2>/dev/null || true
  echo -e "  ${GREEN}Backup restaurado de backups/$TIMESTAMP/${RESET}"
  echo "  Execute 'git log --oneline -5' para ver os commits disponíveis."
  echo "  Rollback manual: bash scripts/rollback.sh"
  exit 1
fi

# ─── 7. Reiniciar servidor ─────────────────────
echo -e "${CYAN}7${RESET} Reiniciando servidor..."
pkill -f "node app/server.js" 2>/dev/null || true
sleep 1
cd "$WABOT_DIR"
nohup node app/server.js > wabot.log 2>&1 &
echo -e "  ${GREEN}OK${RESET} Servidor reiniciado (PID: $!)"

# ─── 8. Verificar se subiu ─────────────────────
echo -e "${CYAN}8${RESET} Aguardando servidor ficar online..."
for i in $(seq 1 10); do
  if curl -sf http://localhost:3001/ >/dev/null 2>&1; then
    echo -e "  ${GREEN}OK${RESET} WaBot online em http://localhost:3001"
    break
  fi
  sleep 2
done

echo ""
echo "============================================"
echo -e "  ${GREEN}Atualização concluída!${RESET}"
echo "============================================"
echo ""
echo "  Logs: tail -f wabot.log"
echo "  Rollback: bash scripts/rollback.sh"
echo ""
