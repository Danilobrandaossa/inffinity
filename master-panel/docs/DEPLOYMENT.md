# 🚀 **DEPLOYMENT GUIDE - MASTER PANEL**

## 📋 **PRÉ-REQUISITOS**

### **Servidor**
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Mínimo 4GB (Recomendado: 8GB+)
- **CPU**: Mínimo 2 cores (Recomendado: 4 cores+)
- **Storage**: Mínimo 50GB SSD
- **Network**: Portas 80, 443, 3002 abertas

### **Software**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **Nginx**: 1.18+ (opcional)

---

## 🐳 **DEPLOYMENT COM DOCKER**

### **1. Preparar Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout e login novamente
exit
```

### **2. Clonar Repositório**
```bash
# Clonar projeto
git clone <repository-url> /opt/master-panel
cd /opt/master-panel

# Configurar permissões
sudo chown -R $USER:$USER /opt/master-panel
```

### **3. Configurar Ambiente**
```bash
# Copiar arquivo de ambiente
cp backend/env.example backend/.env

# Editar configurações
nano backend/.env
```

**Configurações de Produção:**
```bash
# Database
DATABASE_URL="postgresql://master_user:SUA_SENHA_FORTE@postgres:5432/master_panel_db"

# JWT
JWT_SECRET="SUA_CHAVE_JWT_SUPER_SECRETA_AQUI"
JWT_EXPIRES_IN="8h"

# Server
PORT=3002
NODE_ENV="production"

# CORS
FRONTEND_URL="https://master.reservapro.com"
CORS_ORIGIN="https://master.reservapro.com"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/master-panel.log"
```

### **4. Deploy**
```bash
# Subir serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### **5. Configurar Banco de Dados**
```bash
# Executar migrações
docker-compose exec backend npm run db:migrate

# Executar seed
docker-compose exec backend npm run db:seed

# Verificar banco
docker-compose exec postgres psql -U master_user -d master_panel_db -c "\dt"
```

---

## 🌐 **CONFIGURAÇÃO NGINX**

### **1. Instalar Nginx**
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### **2. Configurar Site**
```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/master-panel
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name master.reservapro.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name master.reservapro.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/master.reservapro.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/master.reservapro.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### **3. Ativar Site**
```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/master-panel /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔒 **SSL/TLS COM LET'S ENCRYPT**

### **1. Instalar Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### **2. Obter Certificado**
```bash
# Obter certificado
sudo certbot --nginx -d master.reservapro.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### **3. Configurar Renovação Automática**
```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **MONITORAMENTO**

### **1. Health Checks**
```bash
# Verificar saúde da aplicação
curl -f http://localhost:3002/health || exit 1

# Verificar banco de dados
docker-compose exec postgres pg_isready -U master_user -d master_panel_db
```

### **2. Logs**
```bash
# Logs da aplicação
docker-compose logs -f backend

# Logs do banco
docker-compose logs -f postgres

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **3. Métricas**
```bash
# Uso de recursos
docker stats

# Espaço em disco
df -h

# Memória
free -h
```

---

## 🔄 **BACKUP E RESTORE**

### **1. Backup do Banco**
```bash
# Criar script de backup
sudo nano /opt/backup-db.sh
```

**Script de Backup:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="master_panel_db_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U master_user -d master_panel_db > $BACKUP_DIR/$BACKUP_FILE

# Comprimir backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remover backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup criado: $BACKUP_DIR/$BACKUP_FILE.gz"
```

```bash
# Tornar executável
sudo chmod +x /opt/backup-db.sh

# Executar backup
sudo /opt/backup-db.sh
```

### **2. Restore do Banco**
```bash
# Restaurar backup
gunzip -c /opt/backups/master_panel_db_20240101_120000.sql.gz | \
docker-compose exec -T postgres psql -U master_user -d master_panel_db
```

### **3. Backup Automático**
```bash
# Adicionar ao crontab
sudo crontab -e

# Backup diário às 2h da manhã
0 2 * * * /opt/backup-db.sh
```

---

## 🔧 **MANUTENÇÃO**

### **1. Atualizações**
```bash
# Parar serviços
docker-compose down

# Atualizar código
git pull origin main

# Rebuild containers
docker-compose up -d --build

# Executar migrações
docker-compose exec backend npm run db:migrate
```

### **2. Limpeza**
```bash
# Limpar containers não utilizados
docker system prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Limpar imagens não utilizadas
docker image prune -f
```

### **3. Logs**
```bash
# Rotacionar logs
sudo nano /etc/logrotate.d/master-panel
```

**Configuração Logrotate:**
```
/opt/master-panel/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Container não inicia**
```bash
# Verificar logs
docker-compose logs backend

# Verificar configuração
docker-compose config

# Rebuild
docker-compose up --build
```

#### **2. Banco de dados não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U master_user -d master_panel_db -c "SELECT 1;"
```

#### **3. Nginx não proxy**
```bash
# Verificar configuração
sudo nginx -t

# Verificar se serviços estão rodando
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :3002
```

#### **4. SSL não funciona**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew --force-renewal
```

---

## 📈 **SCALING**

### **1. Horizontal Scaling**
```bash
# Escalar backend
docker-compose up -d --scale backend=3

# Load balancer com Nginx
upstream backend {
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
}
```

### **2. Database Scaling**
```bash
# Configurar replica de leitura
# Implementar connection pooling
# Usar Redis para cache
```

---

## ✅ **CHECKLIST DE DEPLOY**

### **Pré-Deploy**
- [ ] Servidor configurado
- [ ] Docker instalado
- [ ] Domínio configurado
- [ ] SSL configurado
- [ ] Firewall configurado

### **Deploy**
- [ ] Código clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Containers subindo
- [ ] Banco de dados migrado
- [ ] Seed executado

### **Pós-Deploy**
- [ ] Health check funcionando
- [ ] Login funcionando
- [ ] API respondendo
- [ ] Logs sendo gerados
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

**ReservaPro Master Panel** - Deploy em produção! 🚀








