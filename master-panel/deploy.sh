#!/bin/bash

# 🚀 DEPLOY SCRIPT - RESERVAPRO MASTER PANEL
# Script automatizado para deploy em produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
fi

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git não está instalado"
    fi
    
    success "Dependências verificadas"
}

# Configurar ambiente
setup_environment() {
    log "Configurando ambiente..."
    
    # Criar diretório se não existir
    mkdir -p /opt/master-panel
    cd /opt/master-panel
    
    # Clonar repositório se não existir
    if [ ! -d ".git" ]; then
        log "Clonando repositório..."
        git clone <repository-url> .
    else
        log "Atualizando código..."
        git pull origin main
    fi
    
    # Configurar arquivo de ambiente
    if [ ! -f "backend/.env" ]; then
        log "Criando arquivo de ambiente..."
        cp backend/env.example backend/.env
        
        warning "Configure as variáveis de ambiente em backend/.env"
        warning "Especialmente: DATABASE_URL, JWT_SECRET, CORS_ORIGIN"
        
        read -p "Pressione Enter após configurar o arquivo .env..."
    fi
    
    success "Ambiente configurado"
}

# Deploy da aplicação
deploy_application() {
    log "Iniciando deploy da aplicação..."
    
    # Parar serviços existentes
    log "Parando serviços existentes..."
    docker-compose down || true
    
    # Build e subir serviços
    log "Construindo e subindo serviços..."
    docker-compose up -d --build
    
    # Aguardar serviços ficarem prontos
    log "Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Verificar se serviços estão rodando
    if ! docker-compose ps | grep -q "Up"; then
        error "Falha ao subir serviços"
    fi
    
    success "Aplicação deployada"
}

# Configurar banco de dados
setup_database() {
    log "Configurando banco de dados..."
    
    # Aguardar PostgreSQL ficar pronto
    log "Aguardando PostgreSQL..."
    timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U master_user; do sleep 2; done'
    
    # Executar migrações
    log "Executando migrações..."
    docker-compose exec backend npm run db:migrate
    
    # Executar seed
    log "Executando seed..."
    docker-compose exec backend npm run db:seed
    
    success "Banco de dados configurado"
}

# Configurar Nginx
setup_nginx() {
    log "Configurando Nginx..."
    
    # Instalar Nginx se não estiver instalado
    if ! command -v nginx &> /dev/null; then
        log "Instalando Nginx..."
        sudo apt update
        sudo apt install nginx -y
    fi
    
    # Criar configuração do site
    sudo tee /etc/nginx/sites-available/master-panel > /dev/null <<EOF
server {
    listen 80;
    server_name master.reservapro.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Ativar site
    sudo ln -sf /etc/nginx/sites-available/master-panel /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    sudo nginx -t
    
    # Recarregar Nginx
    sudo systemctl reload nginx
    
    success "Nginx configurado"
}

# Configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    # Instalar Certbot se não estiver instalado
    if ! command -v certbot &> /dev/null; then
        log "Instalando Certbot..."
        sudo apt install certbot python3-certbot-nginx -y
    fi
    
    # Obter certificado SSL
    log "Obtendo certificado SSL..."
    sudo certbot --nginx -d master.reservapro.com --non-interactive --agree-tos --email admin@reservapro.com
    
    success "SSL configurado"
}

# Configurar backup
setup_backup() {
    log "Configurando backup..."
    
    # Criar script de backup
    sudo tee /opt/backup-master-panel.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="master_panel_db_$DATE.sql"

mkdir -p $BACKUP_DIR

cd /opt/master-panel
docker-compose exec -T postgres pg_dump -U master_user -d master_panel_db > $BACKUP_DIR/$BACKUP_FILE

gzip $BACKUP_DIR/$BACKUP_FILE

find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup criado: $BACKUP_DIR/$BACKUP_FILE.gz"
EOF
    
    sudo chmod +x /opt/backup-master-panel.sh
    
    # Configurar cron para backup diário
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-master-panel.sh") | crontab -
    
    success "Backup configurado"
}

# Verificar saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar aplicação ficar pronta
    sleep 10
    
    # Verificar health check
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        success "Backend funcionando"
    else
        error "Backend não está respondendo"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        success "Frontend funcionando"
    else
        error "Frontend não está respondendo"
    fi
    
    success "Aplicação está funcionando"
}

# Mostrar informações de acesso
show_access_info() {
    log "Informações de acesso:"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:3002"
    echo "   Health:   http://localhost:3002/health"
    echo ""
    echo "🔑 Credenciais padrão:"
    echo "   Email: master@reservapro.com"
    echo "   Senha: Master123!@#"
    echo ""
    echo "📊 Comandos úteis:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Parar:    docker-compose down"
    echo "   Restart:  docker-compose restart"
    echo ""
    echo "📁 Localização: /opt/master-panel"
    echo ""
}

# Função principal
main() {
    echo "🚀 RESERVAPRO MASTER PANEL - DEPLOY SCRIPT"
    echo "=========================================="
    echo ""
    
    check_dependencies
    setup_environment
    deploy_application
    setup_database
    setup_nginx
    
    # Perguntar sobre SSL
    read -p "Configurar SSL com Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    setup_backup
    health_check
    show_access_info
    
    success "Deploy concluído com sucesso!"
    echo ""
    echo "🎉 O ReservaPro Master Panel está rodando!"
    echo "   Acesse: http://localhost:3001"
    echo ""
}

# Executar função principal
main "$@"








