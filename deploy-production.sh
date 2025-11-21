#!/bin/bash
# ============================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO - RESERVAPRO
# ============================================
# Este script automatiza o deploy completo do sistema
# com todas as configurações de segurança implementadas

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
   exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
    exit 1
fi

log "Iniciando deploy do ReservaPro..."

# ============================================
# 1. BACKUP DOS DADOS EXISTENTES
# ============================================
log "Criando backup dos dados existentes..."

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do banco principal (se existir)
if docker ps | grep -q "reservapro_db"; then
    log "Fazendo backup do banco principal..."
    docker exec reservapro_db pg_dump -U reservapro_user reservapro_db > "$BACKUP_DIR/main_db_backup.sql"
    success "Backup do banco principal criado: $BACKUP_DIR/main_db_backup.sql"
fi

# Backup do banco master panel (se existir)
if docker ps | grep -q "master-panel-postgres"; then
    log "Fazendo backup do banco master panel..."
    docker exec master-panel-postgres pg_dump -U master_user master_panel_db > "$BACKUP_DIR/master_db_backup.sql"
    success "Backup do banco master panel criado: $BACKUP_DIR/master_db_backup.sql"
fi

# ============================================
# 2. PARAR SERVIÇOS EXISTENTES
# ============================================
log "Parando serviços existentes..."

# Parar sistema principal
if [ -f "docker-compose.yml" ]; then
    docker-compose down --remove-orphans
    success "Sistema principal parado"
fi

# Parar master panel
if [ -f "master-panel/docker-compose.yml" ]; then
    cd master-panel
    docker-compose down --remove-orphans
    cd ..
    success "Master panel parado"
fi

# ============================================
# 3. LIMPEZA DE RECURSOS
# ============================================
log "Limpando recursos Docker..."

# Remover containers órfãos
docker container prune -f

# Remover imagens não utilizadas
docker image prune -f

# Remover volumes não utilizados (cuidado!)
# docker volume prune -f

success "Limpeza concluída"

# ============================================
# 4. VERIFICAR ARQUIVOS DE CONFIGURAÇÃO
# ============================================
log "Verificando arquivos de configuração..."

# Verificar se existe arquivo de ambiente
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado, usando valores padrão"
    if [ -f "env.production.secure" ]; then
        cp env.production.secure .env
        success "Arquivo .env criado a partir do template"
    fi
fi

# Verificar se existe arquivo de ambiente do master panel
if [ ! -f "master-panel/.env" ]; then
    warning "Arquivo master-panel/.env não encontrado, usando valores padrão"
fi

# ============================================
# 5. BUILD DAS IMAGENS
# ============================================
log "Fazendo build das imagens..."

# Build sistema principal
if [ -f "docker-compose.yml" ]; then
    log "Building sistema principal..."
    docker-compose build --no-cache
    success "Build do sistema principal concluído"
fi

# Build master panel
if [ -f "master-panel/docker-compose.yml" ]; then
    log "Building master panel..."
    cd master-panel
    docker-compose build --no-cache
    cd ..
    success "Build do master panel concluído"
fi

# ============================================
# 6. INICIAR SERVIÇOS
# ============================================
log "Iniciando serviços..."

# Iniciar sistema principal
if [ -f "docker-compose.yml" ]; then
    log "Iniciando sistema principal..."
    docker-compose up -d
    
    # Aguardar saúde do sistema
    log "Aguardando sistema principal ficar saudável..."
    sleep 30
    
    # Verificar saúde
    if curl -f http://localhost:3011/health > /dev/null 2>&1; then
        success "Sistema principal está saudável"
    else
        error "Sistema principal não está respondendo"
        docker-compose logs backend
        exit 1
    fi
fi

# Iniciar master panel
if [ -f "master-panel/docker-compose.yml" ]; then
    log "Iniciando master panel..."
    cd master-panel
    docker-compose up -d
    cd ..
    
    # Aguardar saúde do master panel
    log "Aguardando master panel ficar saudável..."
    sleep 30
    
    # Verificar saúde
    if curl -f http://localhost:3012/health > /dev/null 2>&1; then
        success "Master panel está saudável"
    else
        error "Master panel não está respondendo"
        cd master-panel
        docker-compose logs master-backend
        cd ..
        exit 1
    fi
fi

# ============================================
# 7. EXECUTAR MIGRATIONS E SEEDS
# ============================================
log "Executando migrations e seeds..."

# Sistema principal
if docker ps | grep -q "reservapro_backend"; then
    log "Executando migrations do sistema principal..."
    docker exec reservapro_backend npm run db:migrate
    
    log "Executando seeds do sistema principal..."
    docker exec reservapro_backend npm run db:seed
    
    success "Migrations e seeds do sistema principal concluídos"
fi

# Master panel
if docker ps | grep -q "master-panel-backend"; then
    log "Executando migrations do master panel..."
    docker exec master-panel-backend npm run db:migrate
    
    log "Executando seeds do master panel..."
    docker exec master-panel-backend npm run db:seed
    
    success "Migrations e seeds do master panel concluídos"
fi

# ============================================
# 8. VERIFICAÇÕES FINAIS
# ============================================
log "Executando verificações finais..."

# Verificar portas
PORTS=(3010 3011 3012 3013)
for port in "${PORTS[@]}"; do
    if netstat -tuln | grep -q ":$port "; then
        success "Porta $port está ativa"
    else
        warning "Porta $port não está ativa"
    fi
done

# Verificar saúde dos serviços
log "Verificando saúde dos serviços..."

# Sistema principal
if curl -f http://localhost:3011/health > /dev/null 2>&1; then
    success "✅ Sistema principal: http://localhost:3011"
else
    error "❌ Sistema principal não está respondendo"
fi

# Frontend principal
if curl -f http://localhost:3010 > /dev/null 2>&1; then
    success "✅ Frontend principal: http://localhost:3010"
else
    error "❌ Frontend principal não está respondendo"
fi

# Master panel backend
if curl -f http://localhost:3012/health > /dev/null 2>&1; then
    success "✅ Master panel backend: http://localhost:3012"
else
    error "❌ Master panel backend não está respondendo"
fi

# Master panel frontend
if curl -f http://localhost:3013 > /dev/null 2>&1; then
    success "✅ Master panel frontend: http://localhost:3013"
else
    error "❌ Master panel frontend não está respondendo"
fi

# ============================================
# 9. INFORMAÇÕES DE ACESSO
# ============================================
log "Deploy concluído com sucesso!"
echo ""
echo "============================================"
echo "🚀 RESERVAPRO - SISTEMA DEPLOYADO"
echo "============================================"
echo ""
echo "📱 SISTEMA PRINCIPAL:"
echo "   Frontend: http://localhost:3010"
echo "   Backend:  http://localhost:3011"
echo "   Health:   http://localhost:3011/health"
echo "   Metrics:  http://localhost:3011/metrics"
echo ""
echo "🔧 MASTER PANEL:"
echo "   Frontend: http://localhost:3013"
echo "   Backend:  http://localhost:3012"
echo "   Health:   http://localhost:3012/health"
echo ""
echo "🔐 CREDENCIAIS PADRÃO:"
echo "   Sistema Principal:"
echo "     Email: contato@danilobrandao.com.br"
echo "     Senha: Zy598859D@n"
echo ""
echo "   Master Panel:"
echo "     Email: master@reservapro.com"
echo "     Senha: Master123!@#"
echo ""
echo "📊 MONITORAMENTO:"
echo "   Logs: docker-compose logs -f"
echo "   Status: docker-compose ps"
echo "   Backup: $BACKUP_DIR"
echo ""
echo "============================================"
echo "✅ Deploy concluído em $(date)"
echo "============================================"





