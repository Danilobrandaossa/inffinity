#!/bin/bash

# Script para comparar versões local vs servidor
# Uso:
#   Local: ./scripts/compare-versions.sh
#   Servidor: ./scripts/compare-versions.sh --server

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar se está no servidor (usando Docker)
IS_SERVER=${1:-""}
USE_DOCKER=false

if [ "$IS_SERVER" = "--server" ] || [ -n "$IS_DOCKER" ] || docker ps &>/dev/null; then
    USE_DOCKER=true
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📊 OVERVIEW DO PROJETO - COMPARAÇÃO DE VERSÕES${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Função para executar comando no container do backend (se Docker)
run_in_backend() {
    if [ "$USE_DOCKER" = true ]; then
        docker-compose -f docker-compose.prod.yml exec -T backend $@ 2>/dev/null || \
        docker-compose exec -T backend $@ 2>/dev/null || echo "❌ Container não encontrado"
    else
        $@
    fi
}

# 1. INFORMAÇÕES DO SISTEMA
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  1. INFORMAÇÕES DO SISTEMA                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📍 Localização:${NC}"
if [ "$USE_DOCKER" = true ]; then
    echo "   Ambiente: SERVIDOR (Docker)"
    HOSTNAME=$(hostname)
    echo "   Hostname: $HOSTNAME"
else
    echo "   Ambiente: LOCAL"
    HOSTNAME=$(hostname)
    echo "   Hostname: $HOSTNAME"
fi
echo "   Diretório: $(pwd)"
echo ""

echo -e "${GREEN}📦 Versões do Sistema:${NC}"
if command -v node &> /dev/null; then
    echo "   Node.js: $(node --version)"
fi
if command -v npm &> /dev/null; then
    echo "   npm: $(npm --version)"
fi
if command -v docker &> /dev/null; then
    echo "   Docker: $(docker --version 2>/dev/null || echo 'não disponível')"
fi
if command -v docker-compose &> /dev/null; then
    echo "   Docker Compose: $(docker-compose --version 2>/dev/null || echo 'não disponível')"
fi
echo ""

# 2. GIT (se disponível)
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  2. INFORMAÇÕES DO GIT                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -d .git ]; then
    echo -e "${GREEN}🌿 Branch atual:${NC}"
    echo "   $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo ""
    
    echo -e "${GREEN}📝 Último commit:${NC}"
    COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo 'N/A')
    COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null | head -n 1 || echo 'N/A')
    COMMIT_DATE=$(git log -1 --format=%cd --date=short 2>/dev/null || echo 'N/A')
    echo "   Hash: ${COMMIT_HASH:0:8}"
    echo "   Data: $COMMIT_DATE"
    echo "   Mensagem: ${COMMIT_MSG:0:60}..."
    echo ""
    
    echo -e "${GREEN}📊 Status:${NC}"
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo "   ⚠️  Há alterações não commitadas"
        git status --short 2>/dev/null | head -5
    else
        echo "   ✅ Working directory limpo"
    fi
else
    echo "   ❌ Não é um repositório git ou .git não encontrado"
fi
echo ""

# 3. VERSÕES DOS PACOTES
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  3. VERSÕES DOS PACOTES                              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -f backend/package.json ]; then
    echo -e "${GREEN}📦 Backend:${NC}"
    BACKEND_VERSION=$(grep -o '"version": "[^"]*"' backend/package.json | cut -d'"' -f4 || echo 'N/A')
    echo "   Versão: $BACKEND_VERSION"
    
    if [ "$USE_DOCKER" = false ] && [ -d backend/node_modules ]; then
        echo -e "${YELLOW}   Principais dependências instaladas:${NC}"
        echo "   - Express: $(cd backend && npm list express 2>/dev/null | grep express@ | cut -d'@' -f2 || echo 'N/A')"
        echo "   - Prisma: $(cd backend && npm list prisma 2>/dev/null | grep prisma@ | cut -d'@' -f2 || echo 'N/A')"
        echo "   - TypeScript: $(cd backend && npm list typescript 2>/dev/null | grep typescript@ | cut -d'@' -f2 || echo 'N/A')"
    fi
fi
echo ""

if [ -f frontend/package.json ]; then
    echo -e "${GREEN}📦 Frontend:${NC}"
    FRONTEND_VERSION=$(grep -o '"version": "[^"]*"' frontend/package.json | cut -d'"' -f4 || echo 'N/A')
    echo "   Versão: $FRONTEND_VERSION"
    
    if [ "$USE_DOCKER" = false ] && [ -d frontend/node_modules ]; then
        echo -e "${YELLOW}   Principais dependências instaladas:${NC}"
        echo "   - React: $(cd frontend && npm list react 2>/dev/null | grep react@ | cut -d'@' -f2 || echo 'N/A')"
        echo "   - Vite: $(cd frontend && npm list vite 2>/dev/null | grep vite@ | cut -d'@' -f2 || echo 'N/A')"
    fi
fi
echo ""

# 4. PRISMA E BANCO DE DADOS
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  4. PRISMA & BANCO DE DADOS                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -f backend/prisma/schema.prisma ]; then
    echo -e "${GREEN}📋 Schema do Prisma:${NC}"
    SCHEMA_HASH=$(md5sum backend/prisma/schema.prisma 2>/dev/null | cut -d' ' -f1 || \
                  shasum backend/prisma/schema.prisma 2>/dev/null | cut -d' ' -f1 || echo 'N/A')
    echo "   Hash: ${SCHEMA_HASH:0:16}..."
    MODEL_COUNT=$(grep -c "^model " backend/prisma/schema.prisma 2>/dev/null || echo '0')
    echo "   Modelos: $MODEL_COUNT"
    echo ""
    
    echo -e "${GREEN}🔄 Migrations:${NC}"
    if [ -d backend/prisma/migrations ]; then
        MIGRATION_COUNT=$(find backend/prisma/migrations -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
        echo "   Total de migrations: $MIGRATION_COUNT"
        
        if [ "$MIGRATION_COUNT" -gt 0 ]; then
            LAST_MIGRATION=$(ls -t backend/prisma/migrations 2>/dev/null | head -1 || echo 'N/A')
            echo "   Última migration: $LAST_MIGRATION"
        fi
    else
        echo "   ⚠️  Diretório de migrations não encontrado"
    fi
    echo ""
    
    # Tentar conectar ao banco e verificar migrations aplicadas
    echo -e "${GREEN}💾 Status do Banco:${NC}"
    if [ "$USE_DOCKER" = true ]; then
        echo "   Verificando migrations aplicadas no banco..."
        APPLIED_MIGRATIONS=$(run_in_backend npx prisma migrate status 2>/dev/null | grep -c "applied" || echo "0")
        echo "   ⚠️  Execute manualmente: docker-compose exec backend npx prisma migrate status"
    else
        if [ -f backend/.env ] || [ -n "$DATABASE_URL" ]; then
            echo "   Verificando conexão..."
            cd backend
            if npx prisma db pull --schema=prisma/schema.prisma &>/dev/null; then
                echo "   ✅ Conectado ao banco"
                npx prisma migrate status 2>/dev/null | head -5 || echo "   ⚠️  Não foi possível verificar migrations"
            else
                echo "   ❌ Não foi possível conectar ao banco"
            fi
            cd ..
        else
            echo "   ⚠️  DATABASE_URL não configurado"
        fi
    fi
fi
echo ""

# 5. DOCKER (se disponível)
if [ "$USE_DOCKER" = true ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  5. STATUS DOS CONTAINERS DOCKER                    ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if docker ps &>/dev/null; then
        echo -e "${GREEN}🐳 Containers em execução:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" | grep -E "NAME|embarcacoes|backend|frontend|postgres|nginx|n8n" || echo "   Nenhum container relacionado encontrado"
        echo ""
        
        echo -e "${GREEN}📊 Uso de recursos:${NC}"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -6 || echo "   Não foi possível obter estatísticas"
    else
        echo "   ❌ Docker não está rodando ou não está acessível"
    fi
    echo ""
fi

# 6. ARQUIVOS IMPORTANTES
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  6. ARQUIVOS IMPORTANTES                             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📄 Arquivos de configuração:${NC}"
[ -f backend/.env ] && echo "   ✅ backend/.env existe" || echo "   ❌ backend/.env não encontrado"
[ -f frontend/.env ] && echo "   ✅ frontend/.env existe" || echo "   ❌ frontend/.env não encontrado"
[ -f docker-compose.yml ] && echo "   ✅ docker-compose.yml existe" || echo "   ❌ docker-compose.yml não encontrado"
[ -f docker-compose.prod.yml ] && echo "   ✅ docker-compose.prod.yml existe" || echo "   ❌ docker-compose.prod.yml não encontrado"
[ -f backend/prisma/schema.prisma ] && echo "   ✅ schema.prisma existe" || echo "   ❌ schema.prisma não encontrado"
echo ""

echo -e "${GREEN}📁 Estrutura de pastas:${NC}"
[ -d backend/src ] && echo "   ✅ backend/src/" || echo "   ❌ backend/src/ não encontrado"
[ -d frontend/src ] && echo "   ✅ frontend/src/" || echo "   ❌ frontend/src/ não encontrado"
[ -d backend/src/routes ] && ROUTE_COUNT=$(ls -1 backend/src/routes/*.ts 2>/dev/null | wc -l | tr -d ' ') && echo "   ✅ backend/src/routes/ ($ROUTE_COUNT arquivos)" || echo "   ❌ backend/src/routes/ não encontrado"
[ -d backend/src/controllers ] && CTRL_COUNT=$(ls -1 backend/src/controllers/*.ts 2>/dev/null | wc -l | tr -d ' ') && echo "   ✅ backend/src/controllers/ ($CTRL_COUNT arquivos)" || echo "   ❌ backend/src/controllers/ não encontrado"
[ -d frontend/src/pages ] && PAGE_COUNT=$(ls -1 frontend/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ') && echo "   ✅ frontend/src/pages/ ($PAGE_COUNT arquivos)" || echo "   ❌ frontend/src/pages/ não encontrado"
echo ""

# 7. HEALTH CHECK (se API estiver rodando)
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  7. HEALTH CHECK                                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$USE_DOCKER" = true ]; then
    echo -e "${GREEN}🏥 Verificando serviços:${NC}"
    
    # Verificar backend
    if curl -s http://localhost:3001/health &>/dev/null; then
        HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "OK")
        echo "   ✅ Backend API: Online"
        echo "   $HEALTH" | head -3 | sed 's/^/      /'
    else
        echo "   ❌ Backend API: Offline ou não acessível na porta 3001"
    fi
    echo ""
    
    # Verificar frontend
    if curl -s http://localhost:3000 &>/dev/null || curl -s http://localhost:80 &>/dev/null; then
        echo "   ✅ Frontend: Online"
    else
        echo "   ⚠️  Frontend: Não verificado (pode estar no nginx na porta 80)"
    fi
else
    echo -e "${YELLOW}   Execute com --server para verificar serviços${NC}"
fi
echo ""

# Resumo
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📋 RESUMO${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Para comparar com servidor:${NC}"
echo "   1. Execute este script localmente: ./scripts/compare-versions.sh"
echo "   2. Execute no servidor: ssh user@server './scripts/compare-versions.sh --server'"
echo "   3. Compare os outputs, especialmente:"
echo "      - Hash do commit Git"
echo "      - Versões dos pacotes"
echo "      - Hash do schema Prisma"
echo "      - Migrations aplicadas"
echo ""
echo -e "${GREEN}📊 Para exportar para arquivo:${NC}"
echo "   ./scripts/compare-versions.sh > overview-$(date +%Y%m%d-%H%M%S).txt"
echo ""

