#!/bin/bash

# Script para descobrir onde está o projeto no servidor
# Uso: ./scripts/find-server-path.sh

# Configurações do servidor
SERVER_IP="145.223.93.235"
SERVER_USER="root"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔍 PROCURANDO PROJETO NO SERVIDOR${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Servidor: ${SERVER_USER}@${SERVER_IP}${NC}"
echo ""

# Verificar conectividade
echo -e "${YELLOW}1. Verificando conectividade...${NC}"
if ! ping -c 1 -W 2 $SERVER_IP &>/dev/null; then
    echo -e "${RED}❌ Não foi possível conectar ao servidor${NC}"
    echo "   Verifique se o IP está correto: $SERVER_IP"
    exit 1
fi
echo -e "${GREEN}✅ Servidor alcançável${NC}"
echo ""

# Procurar em locais comuns
echo -e "${YELLOW}2. Procurando projeto em locais comuns...${NC}"
echo ""

PATHS_TO_CHECK=(
    "/opt/embarcacoes"
    "/home/root/embarcacoes"
    "/home/root/Inffinity"
    "/var/www/embarcacoes"
    "/var/www/html"
    "/root/embarcacoes"
    "/root/Inffinity"
    "/opt/inffinity"
)

FOUND_PATHS=()

for path in "${PATHS_TO_CHECK[@]}"; do
    echo -n "   Verificando $path... "
    if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "test -d $path 2>/dev/null && test -f $path/backend/package.json" 2>/dev/null; then
        echo -e "${GREEN}✅ ENCONTRADO!${NC}"
        FOUND_PATHS+=("$path")
    else
        echo -e "${RED}❌${NC}"
    fi
done

echo ""

# Se não encontrou, procurar por arquivos específicos
if [ ${#FOUND_PATHS[@]} -eq 0 ]; then
    echo -e "${YELLOW}3. Procurando em outros locais...${NC}"
    echo "   (Pode levar alguns segundos...)"
    echo ""
    
    # Procurar por package.json do backend
    SEARCH_RESULT=$(ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "find /opt /home /var/www /root -name 'package.json' -path '*/backend/*' 2>/dev/null | head -5" 2>/dev/null)
    
    if [ -n "$SEARCH_RESULT" ]; then
        echo -e "${GREEN}Possíveis localizações encontradas:${NC}"
        echo "$SEARCH_RESULT" | while read -r file; do
            dir=$(dirname "$(dirname "$file")")
            echo -e "   ${BLUE}→ $dir${NC}"
            FOUND_PATHS+=("$dir")
        done
    else
        echo -e "${YELLOW}⚠️  Não encontrado nos locais padrão${NC}"
    fi
    echo ""
fi

# Mostrar resultados
if [ ${#FOUND_PATHS[@]} -gt 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ PROJETO ENCONTRADO!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Usar o primeiro caminho encontrado
    PROJECT_PATH="${FOUND_PATHS[0]}"
    echo -e "${BLUE}Caminho principal: ${PROJECT_PATH}${NC}"
    echo ""
    
    # Verificar estrutura
    echo -e "${YELLOW}Verificando estrutura do projeto...${NC}"
    echo ""
    
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_PATH} && echo '📁 Estrutura:' && ls -la | grep -E 'backend|frontend|docker-compose' && echo '' && echo '📦 Backend:' && [ -d backend ] && echo '  ✅ backend/' && [ -f backend/package.json ] && echo '  ✅ backend/package.json' || echo '  ❌ backend/ não encontrado' && echo '' && echo '📦 Frontend:' && [ -d frontend ] && echo '  ✅ frontend/' && [ -f frontend/package.json ] && echo '  ✅ frontend/package.json' || echo '  ❌ frontend/ não encontrado'"
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  📋 COMANDOS PRONTOS PARA USAR${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Overview do servidor:${NC}"
    echo "ssh ${SERVER_USER}@${SERVER_IP} 'cd ${PROJECT_PATH} && [ -f ./scripts/compare-versions.sh ] && ./scripts/compare-versions.sh --server || echo \"Script não encontrado\"'"
    echo ""
    echo -e "${BLUE}Ver Git:${NC}"
    echo "ssh ${SERVER_USER}@${SERVER_IP} 'cd ${PROJECT_PATH} && git log -1 --oneline'"
    echo ""
    echo -e "${BLUE}Ver containers Docker:${NC}"
    echo "ssh ${SERVER_USER}@${SERVER_IP} 'cd ${PROJECT_PATH} && docker-compose -f docker-compose.prod.yml ps 2>/dev/null || docker-compose ps'"
    echo ""
    
    # Salvar o caminho encontrado
    echo "${PROJECT_PATH}" > .server-path.txt
    echo -e "${GREEN}✅ Caminho salvo em .server-path.txt${NC}"
    echo ""
    
else
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ❌ PROJETO NÃO ENCONTRADO${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis soluções:${NC}"
    echo "1. Verificar se o projeto está no servidor"
    echo "2. Verificar permissões de acesso SSH"
    echo "3. Procurar manualmente:"
    echo "   ssh ${SERVER_USER}@${SERVER_IP}"
    echo "   find / -name 'package.json' -path '*/backend/*' 2>/dev/null"
    echo ""
fi

