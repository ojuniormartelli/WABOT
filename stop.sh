#!/usr/bin/env bash
set -euo pipefail

WABOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Parando Evolution API (Docker)..."
docker compose -f "$WABOT_DIR/app/docker/docker-compose.yml" down 2>/dev/null || echo "Docker não disponível, pulando"

echo "Parando WaBot (Node.js)..."
pkill -f "node app/server.js" 2>/dev/null || true

echo ""
echo "Serviços parados."
