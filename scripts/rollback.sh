#!/usr/bin/env bash
# WaBot — Rollback rápido
# Uso: bash scripts/rollback.sh [<commit-sha>]
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GREEN='\033[92m'; RED='\033[91m'; YELLOW='\033[93m'; CYAN='\033[96m'; RESET='\033[0m'

echo ""
echo "============================================"
echo "  WaBot — Rollback"
echo "============================================"
echo ""

# 1. Listar backups disponíveis
BACKUP_DIR="$WABOT_DIR/backups"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
  echo -e "${CYAN}Backups disponíveis:${RESET}"
  ls -1t "$BACKUP_DIR" | head -5
  echo ""
fi

# 2. Verificar argumento de commit
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo -e "${YELLOW}Últimos 5 commits:${RESET}"
  git -C "$WABOT_DIR" log --oneline -5
  echo ""
  echo "Uso: bash scripts/rollback.sh <commit-sha>"
  echo "  bash scripts/rollback.sh HEAD~1    # voltar 1 commit"
  echo "  bash scripts/rollback.sh <sha>     # voltar para SHA específico"
  exit 0
fi

# 3. Fazer backup de segurança antes do rollback
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
PRE_BACKUP="$BACKUP_DIR/pre-rollback-$TIMESTAMP"
mkdir -p "$PRE_BACKUP"
cp "$WABOT_DIR/app/data/"*.json "$PRE_BACKUP/" 2>/dev/null || true
echo -e " ${GREEN}Backup pré-rollback: $PRE_BACKUP${RESET}"

# 4. Voltar código
echo -e "${CYAN}Voltando para $TARGET...${RESET}"
cd "$WABOT_DIR"
git checkout "$TARGET" -- app/server.js app/test_regressao.js 2>&1
echo -e "  ${GREEN}OK${RESET}"

# 5. Restaurar dados do backup mais recente
LATEST_BACKUP=$(ls -1t "$BACKUP_DIR" 2>/dev/null | grep -v "pre-rollback" | head -1)
if [ -n "$LATEST_BACKUP" ] && [ -d "$BACKUP_DIR/$LATEST_BACKUP" ]; then
  echo -e "${CYAN}Restaurando dados de backups/$LATEST_BACKUP...${RESET}"
  cp "$BACKUP_DIR/$LATEST_BACKUP/"*.json "$WABOT_DIR/app/data/" 2>/dev/null || true
  echo -e "  ${GREEN}OK${RESET}"
fi

# 6. Validar JSON
echo -e "${CYAN}Validando dados...${RESET}"
for f in "$WABOT_DIR/app/data/"*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null || {
    echo -e "  ${RED}X${RESET} $(basename "$f") — JSON inválido"
    echo "  Restaure manualmente com: cp backups/.../*.json app/data/"
    exit 1
  }
done
echo -e "  ${GREEN}OK${RESET}"

# 7. Rodar testes
echo -e "${CYAN}Testes de regressão...${RESET}"
cd "$WABOT_DIR"
if ! node app/test_regressao.js; then
  echo -e "\n${RED}Testes falharam após rollback. Execute 'git checkout main' para voltar.${RESET}"
  exit 1
fi
echo -e "  ${GREEN}OK${RESET}"

# 8. Reiniciar
echo -e "${CYAN}Reiniciando servidor...${RESET}"
pkill -f "node app/server.js" 2>/dev/null || true
sleep 1
nohup node app/server.js > wabot.log 2>&1 &
echo -e "  ${GREEN}OK${RESET} Servidor reiniciado (PID: $!)"

echo ""
echo "============================================"
echo -e "  ${GREEN}Rollback concluído!${RESET}"
echo "============================================"
echo ""
echo "  Commit atual: $(git -C "$WABOT_DIR" rev-parse HEAD | cut -c1-7)"
echo "  Para voltar ao main: git checkout main && bash scripts/update.sh"
echo ""
