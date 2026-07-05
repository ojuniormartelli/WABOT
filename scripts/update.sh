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

# ─── 3. Preservar dados locais antes do pull ─────
echo -e "${CYAN}3${RESET} Preservando configurações locais..."
TMP_CONFIG=$(mktemp)
TMP_DADOS=$(mktemp)
cp "$WABOT_DIR/app/data/config.json" "$TMP_CONFIG" 2>/dev/null || true
cp "$WABOT_DIR/app/data/dados_negocio.json" "$TMP_DADOS" 2>/dev/null || true
echo -e "  ${GREEN}OK${RESET}"

# ─── 4. Atualizar código ───────────────────────
echo -e "${CYAN}4${RESET} Atualizando código do repositório..."
cd "$WABOT_DIR"
git fetch origin main 2>&1 | tail -1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" = "$REMOTE" ]; then
  echo -e "  ${YELLOW}Já está na versão mais recente.${RESET}"
  echo "  Para forçar: git pull origin main"
  echo "  Depois reinicie: pkill -f 'node app/server.js' && nohup node app/server.js > wabot.log 2>&1 &"
  rm -f "$TMP_CONFIG" "$TMP_DADOS"
  exit 0
fi
git pull origin main 2>&1 | tail -5
NEW_SHA=$(git rev-parse HEAD)
echo -e "  ${GREEN}OK${RESET} Atualizado: $(echo "$CURRENT_SHA" | cut -c1-7) → $(echo "$NEW_SHA" | cut -c1-7)"

# ─── 5. Restaurar dados locais após pull ───────
echo -e "${CYAN}5${RESET} Restaurando configurações locais..."
cp "$TMP_CONFIG" "$WABOT_DIR/app/data/config.json" 2>/dev/null || true
cp "$TMP_DADOS" "$WABOT_DIR/app/data/dados_negocio.json" 2>/dev/null || true
rm -f "$TMP_CONFIG" "$TMP_DADOS"

# Mesclar campos novos dos templates nos arquivos locais
if [ -f "$WABOT_DIR/app/data/config.example.json" ] && [ -f "$WABOT_DIR/app/data/config.json" ]; then
  node -e "
    var templ = JSON.parse(require('fs').readFileSync('$WABOT_DIR/app/data/config.example.json','utf8'));
    var local = JSON.parse(require('fs').readFileSync('$WABOT_DIR/app/data/config.json','utf8'));
    function merge(t,l){if(!t||typeof t!='object'||!l||typeof l!='object'||Array.isArray(t)||Array.isArray(l))return l;for(var k in t){if(!(k in l))l[k]=t[k];else if(typeof t[k]=='object'&&t[k]!==null&&!Array.isArray(t[k]))l[k]=merge(t[k],l[k])}return l}
    require('fs').writeFileSync('$WABOT_DIR/app/data/config.json', JSON.stringify(merge(templ, local), null, 2));
  " 2>/dev/null && echo -e "  ${GREEN}config.json: campos novos mesclados${RESET}" || true
fi
if [ -f "$WABOT_DIR/app/data/dados_negocio.example.json" ] && [ -f "$WABOT_DIR/app/data/dados_negocio.json" ]; then
  node -e "
    var templ = JSON.parse(require('fs').readFileSync('$WABOT_DIR/app/data/dados_negocio.example.json','utf8'));
    var local = JSON.parse(require('fs').readFileSync('$WABOT_DIR/app/data/dados_negocio.json','utf8'));
    function merge(t,l){if(!t||typeof t!='object'||!l||typeof l!='object'||Array.isArray(t)||Array.isArray(l))return l;for(var k in t){if(!(k in l))l[k]=t[k];else if(typeof t[k]=='object'&&t[k]!==null&&!Array.isArray(t[k]))l[k]=merge(t[k],l[k])}return l}
    require('fs').writeFileSync('$WABOT_DIR/app/data/dados_negocio.json', JSON.stringify(merge(templ, local), null, 2));
  " 2>/dev/null && echo -e "  ${GREEN}dados_negocio.json: campos novos mesclados${RESET}" || true
fi
echo -e "  ${GREEN}OK${RESET}"

# ─── 6. npm install se package.json mudou ──────
echo -e "${CYAN}6${RESET} Verificando dependências..."
cd "$WABOT_DIR"
npm install 2>&1 | tail -3
echo -e "  ${GREEN}OK${RESET}"

# ─── 7. Validar JSON dos dados ──────────────────
echo -e "${CYAN}7${RESET} Validando arquivos de dados..."
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

# ─── 8. Rodar testes de regressão ──────────────
echo -e "${CYAN}8${RESET} Rodando testes de regressão..."
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

# ─── 9. Reiniciar servidor ─────────────────────
echo -e "${CYAN}9${RESET} Reiniciando servidor..."
pkill -f "node app/server.js" 2>/dev/null || true
sleep 1
cd "$WABOT_DIR"
nohup node app/server.js > wabot.log 2>&1 &
echo -e "  ${GREEN}OK${RESET} Servidor reiniciado (PID: $!)"

# ─── 10. Verificar se subiu ─────────────────────
echo -e "${CYAN}10${RESET} Aguardando servidor ficar online..."
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
