#!/bin/bash

# Script para atualizar servidor e aplicar migrations
# Execute direto no servidor (já conectado)

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 ATUALIZANDO SERVIDOR E APLICANDO MIGRATIONS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 1. Ir para o diretório
cd /opt/embarcacoes
echo -e "${GREEN}📍 Diretório: $(pwd)${NC}"
echo ""

# 2. Status atual
echo -e "${YELLOW}📊 Status atual:${NC}"
git log -1 --oneline
echo ""
git status --short
echo ""

# 3. Atualizar código
echo -e "${YELLOW}📥 Atualizando código do GitHub...${NC}"
git pull origin main
echo ""

# 4. Verificar atualização
echo -e "${YELLOW}✅ Verificando atualização:${NC}"
git log -1 --oneline
echo ""

# 5. Verificar migrations pendentes
echo -e "${YELLOW}🔄 Verificando migrations pendentes:${NC}"
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status || echo "Erro ao verificar migrations"
echo ""

# 6. Aplicar migrations
echo -e "${YELLOW}📦 Aplicando migrations...${NC}"
echo "Isso pode levar alguns segundos..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields || {
    echo -e "${RED}❌ Erro ao aplicar migrations${NC}"
    echo "Tentando apenas aplicar migrations existentes..."
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
}
echo ""

# 7. Verificar status final
echo -e "${YELLOW}✅ Verificando status final das migrations:${NC}"
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
echo ""

# 8. Reiniciar backend
echo -e "${YELLOW}🔄 Reiniciando backend...${NC}"
docker-compose -f docker-compose.prod.yml restart backend
echo ""

# 9. Aguardar backend ficar pronto
echo -e "${YELLOW}⏳ Aguardando backend ficar pronto...${NC}"
sleep 5
echo ""

# 10. Health check
echo -e "${YELLOW}🏥 Verificando health do backend...${NC}"
if docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está saudável!${NC}"
else
    echo -e "${RED}⚠️  Backend ainda não respondeu (pode levar alguns segundos)${NC}"
fi
echo ""

# 11. Status dos containers
echo -e "${YELLOW}🐳 Status dos containers:${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ATUALIZAÇÃO CONCLUÍDA!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

