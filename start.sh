#!/usr/bin/env bash
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Iniciando Evolution API + PostgreSQL (Docker)..."
docker compose -f "$WABOT_DIR/app/docker/docker-compose.yml" up -d || echo "Docker não disponível, pulando"

echo "Iniciando WaBot (Node.js)..."
pkill -f "node app/server.js" 2>/dev/null || true
cd "$WABOT_DIR"
nohup node app/server.js > wabot.log 2>&1 &
PID=$!

echo ""
echo "WaBot iniciado em segundo plano! (PID: $PID)"
echo ""
echo "  Página: http://localhost:3001"
echo "  Parar:  ./stop.sh"
echo ""
echo "Fechar este terminal não afeta o funcionamento do bot."
echo ""

open "http://localhost:3001" 2>/dev/null || xdg-open "http://localhost:3001" 2>/dev/null || true
