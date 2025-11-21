#!/bin/bash

# Script rápido para overview do servidor
# Uso: ./scripts/overview-server.sh

SERVER_IP="145.223.93.235"
SERVER_USER="root"
SERVER_PATH="/opt/embarcacoes"

echo "═══════════════════════════════════════════════════════"
echo "  📊 OVERVIEW DO SERVIDOR"
echo "═══════════════════════════════════════════════════════"
echo ""

ssh ${SERVER_USER}@${SERVER_IP} << EOF
cd ${SERVER_PATH}
echo "📍 Localização: \$(pwd)"
echo ""
echo "🌿 Git:"
git log -1 --oneline 2>/dev/null || echo "  Não é repositório git"
echo "Branch: \$(git branch --show-current 2>/dev/null)"
echo ""
echo "📦 Versões:"
echo "  Backend: \$(grep '"version"' backend/package.json | head -1 | cut -d'"' -f4)"
echo "  Frontend: \$(grep '"version"' frontend/package.json | head -1 | cut -d'"' -f4)"
echo ""
echo "🔄 Migrations:"
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status 2>/dev/null | head -10 || echo "  Erro ao verificar"
echo ""
echo "🐳 Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "NAME|embarcacoes"
echo ""
echo "📁 Estrutura:"
echo "  Rotas backend: \$(find backend/src/routes -name '*.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "  Controllers: \$(find backend/src/controllers -name '*.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "  Páginas frontend: \$(find frontend/src/pages -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "💾 Schema Prisma:"
echo "  Hash: \$(md5sum backend/prisma/schema.prisma 2>/dev/null | cut -d' ' -f1 | head -c 16)..."
echo "  Modelos: \$(grep -c '^model ' backend/prisma/schema.prisma 2>/dev/null)"
EOF

echo ""

