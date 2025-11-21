#!/bin/bash

# Script para obter overview do servidor
# Uso: ./scripts/get-server-overview.sh [--save]

# Configurações do servidor
SERVER_IP="145.223.93.235"
SERVER_USER="root"
SERVER_PATH="/opt/embarcacoes"  # ✅ Caminho confirmado

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📊 OBTENDO OVERVIEW DO SERVIDOR${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Servidor: ${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "${BLUE}Caminho: ${SERVER_PATH}${NC}"
echo ""

# Verificar se o script de comparação existe no servidor
echo -e "${YELLOW}Verificando se o script existe no servidor...${NC}"
if ssh ${SERVER_USER}@${SERVER_IP} "test -f ${SERVER_PATH}/scripts/compare-versions.sh"; then
    echo -e "${GREEN}✅ Script encontrado no servidor${NC}"
    echo ""
    echo -e "${GREEN}Executando overview...${NC}"
    echo ""
    
    # Executar o script no servidor
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && ./scripts/compare-versions.sh --server"
    
    # Se --save foi passado, salvar em arquivo
    if [ "$1" = "--save" ]; then
        TIMESTAMP=$(date +%Y%m%d-%H%M%S)
        FILENAME="overview-server-${TIMESTAMP}.txt"
        echo ""
        echo -e "${YELLOW}Salvando resultado em ${FILENAME}...${NC}"
        ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && ./scripts/compare-versions.sh --server" > ${FILENAME}
        echo -e "${GREEN}✅ Salvo em ${FILENAME}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Script não encontrado no servidor${NC}"
    echo ""
    echo -e "${BLUE}Opção 1: Enviar o script primeiro${NC}"
    echo "   scp scripts/compare-versions.sh ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/scripts/"
    echo "   ssh ${SERVER_USER}@${SERVER_IP} 'chmod +x ${SERVER_PATH}/scripts/compare-versions.sh'"
    echo ""
    echo -e "${BLUE}Opção 2: Executar comandos diretamente${NC}"
    echo ""
    echo "📋 Git:"
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && git log -1 --oneline && echo 'Branch: ' && git branch --show-current"
    echo ""
    echo "📦 Versões:"
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH}/backend && grep '\"version\"' package.json"
    echo ""
    echo "🐳 Docker:"
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo 'Docker não disponível'"
fi

echo ""

