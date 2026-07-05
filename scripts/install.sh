#!/usr/bin/env bash
# WaBot — Instalação limpa do zero
# Uso: bash scripts/install.sh
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GREEN='\033[92m'; RED='\033[91m'; YELLOW='\033[93m'; CYAN='\033[96m'; RESET='\033[0m'

echo ""
echo "============================================"
echo "  WaBot — Instalação"
echo "============================================"
echo ""

# 1. Verificar Node.js
echo -e "${CYAN}1${RESET} Verificando Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "  ${RED}X${RESET} Node.js não encontrado. Instale Node.js 18+ em: https://nodejs.org"
  exit 1
fi
echo -e "  ${GREEN}OK${RESET} $(node --version)"

# 2. Verificar arquivos do projeto
echo -e "${CYAN}2${RESET} Verificando arquivos..."
MISSING=0
for f in "app/server.js" "app/test_regressao.js"; do
  if [ ! -f "$WABOT_DIR/$f" ]; then
    echo -e "  ${RED}X${RESET} $f não encontrado"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 1 ]; then
  echo -e "\n${RED}Extraia o ZIP ou clone o repositório novamente.${RESET}"
  exit 1
fi
echo -e "  ${GREEN}OK${RESET}"

# 3. Criar diretório de dados e arquivos padrão
echo -e "${CYAN}3${RESET} Criando arquivos de dados..."
mkdir -p "$WABOT_DIR/app/data"

# Template de config.json
if [ ! -f "$WABOT_DIR/app/data/config.json" ]; then
  if [ -f "$WABOT_DIR/app/data/config.example.json" ]; then
    cp "$WABOT_DIR/app/data/config.example.json" "$WABOT_DIR/app/data/config.json"
  else
    echo '{ "nome_negocio": "Meu Negocio", "endereco": "", "telefone": "", "horarios": {}, "tipos_atendimento": [], "mensagem_saudacao": "Olá!", "mensagem_nao_entendi": "Desculpe, não entendi.", "deteccao": { "saudacao": ["oi","olá","ola","bom dia","boa tarde","boa noite","eae","iae","hello","hi","hey","opa","fala"] } }' > "$WABOT_DIR/app/data/$f"
  fi
fi

for f in regras.json ignorados.json conversas.json; do
  if [ ! -f "$WABOT_DIR/app/data/$f" ]; then
    echo '[]' > "$WABOT_DIR/app/data/$f"
  fi
done

# Template de dados_negocio.json
if [ ! -f "$WABOT_DIR/app/data/dados_negocio.json" ]; then
  if [ -f "$WABOT_DIR/app/data/dados_negocio.example.json" ]; then
    cp "$WABOT_DIR/app/data/dados_negocio.example.json" "$WABOT_DIR/app/data/dados_negocio.json"
  else
    echo '{ "nome": "Meu Negocio", "endereco": "", "telefone": "", "delivery_ativo": false, "retirada_ativa": true, "politicas": {}, "palavras_chave": { "atendente": { "prioridade": 100, "frase_exata": [], "expressao": [], "palavra": ["atendente"] }, "horario": { "prioridade": 90, "frase_exata": [], "expressao": [], "palavra": ["horario","funcionamento"] }, "delivery": { "prioridade": 85, "frase_exata": [], "expressao": [], "palavra": ["delivery","entrega"] }, "retirada": { "prioridade": 70, "frase_exata": [], "expressao": [], "palavra": ["retirada"] }, "pedido": { "prioridade": 75, "frase_exata": [], "expressao": [], "palavra": ["pedido"] }, "reserva": { "prioridade": 50, "frase_exata": [], "expressao": [], "palavra": ["reserva"] }, "endereco": { "prioridade": 40, "frase_exata": [], "expressao": [], "palavra": ["endereco"] }, "telefone": { "prioridade": 30, "frase_exata": [], "expressao": [], "palavra": ["telefone"] } } }' > "$WABOT_DIR/app/data/dados_negocio.json"
  fi
fi
cp -n "$WABOT_DIR/app/data/credentials.example.json" "$WABOT_DIR/app/data/credentials.json" 2>/dev/null || true
echo -e "  ${GREEN}OK${RESET}"

# 4. Instalar dependências
echo -e "${CYAN}4${RESET} Instalando dependências..."
cd "$WABOT_DIR"
# Pula se já estamos rodando dentro do npm install (CI/Vercel/lifecycle)
if [ -z "$npm_execpath" ]; then
  npm install 2>&1 | tail -3
else
  echo "  (ignorado — já estamos dentro do npm install)"
fi
echo -e "  ${GREEN}OK${RESET}"

# 5. Validar arquivos JSON
echo -e "${CYAN}5${RESET} Validando arquivos de dados..."
for f in "$WABOT_DIR/app/data/"*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null || {
    echo -e "  ${RED}X${RESET} $(basename "$f") — JSON inválido"
    exit 1
  }
done
echo -e "  ${GREEN}OK${RESET}"

# 6. Rodar testes de regressão
echo -e "${CYAN}6${RESET} Rodando testes de regressão..."
if node "$WABOT_DIR/app/test_regressao.js"; then
  echo -e "  ${GREEN}OK${RESET} Testes passaram"
else
  echo -e "  ${RED}X${RESET} Testes falharam. Reveja os arquivos de dados."
  exit 1
fi

echo ""
echo "============================================"
echo -e "  ${GREEN}Instalação concluída!${RESET}"
echo "============================================"
echo ""
echo "  Iniciar:  bash start.sh"
echo "  Parar:    bash stop.sh"
echo "  Atualizar: bash scripts/update.sh"
echo "  Painel:   http://localhost:3001"
echo ""
