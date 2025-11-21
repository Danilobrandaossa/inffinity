# 🚀 GUIA DE CONFIGURAÇÃO E DEPLOY - RESERVAPRO

## 📋 **VISÃO GERAL**

Este guia detalha como configurar e fazer deploy do sistema ReservaPro com todas as melhorias de segurança implementadas, usando portas acima de 3010.

---

## 🔧 **CONFIGURAÇÃO DE PORTAS**

### **Sistema Principal**
- **Frontend**: `http://localhost:3010`
- **Backend**: `http://localhost:3011`
- **Database**: `localhost:5433`

### **Master Panel**
- **Frontend**: `http://localhost:3013`
- **Backend**: `http://localhost:3012`
- **Database**: `localhost:5434`

---

## 🛡️ **MELHORIAS DE SEGURANÇA IMPLEMENTADAS**

### **1. Rate Limiting Avançado**
- **Global**: 1000 requests/minuto por IP
- **Login**: 5 tentativas/15 minutos por IP
- **Usuário**: 100 requests/15 minutos por usuário
- **Sensível**: 20 requests/5 minutos para APIs críticas

### **2. Validação de IP**
- Whitelist de IPs permitidos
- Blacklist de países bloqueados
- Logs de tentativas de acesso

### **3. Sanitização de Entrada**
- Proteção contra XSS
- Remoção de scripts maliciosos
- Limpeza de HTML/JavaScript

### **4. Headers de Segurança**
- Content Security Policy (CSP)
- Helmet.js configurado
- CORS restritivo

### **5. Logging de Segurança**
- Logs estruturados
- Monitoramento de eventos
- Alertas de segurança

---

## 📁 **ESTRUTURA DE ARQUIVOS**

```
pj-nautica/
├── 📁 backend/                    # Sistema principal
│   ├── 📁 src/
│   │   ├── 📁 middleware/
│   │   │   └── security.ts        # ✅ NOVO - Middleware de segurança
│   │   └── server.ts              # ✅ ATUALIZADO - Segurança avançada
│   ├── docker-compose.yml         # ✅ ATUALIZADO - Portas 3010-3011
│   └── Dockerfile
├── 📁 master-panel/               # Master Panel separado
│   ├── 📁 backend/
│   ├── 📁 frontend/
│   └── docker-compose.yml         # ✅ ATUALIZADO - Portas 3012-3013
├── 📁 frontend/                   # Sistema principal
├── docker-compose.yml             # ✅ ATUALIZADO - Portas 3010-3011
├── env.production.secure          # ✅ NOVO - Configurações seguras
├── deploy-production.sh           # ✅ NOVO - Script de deploy
└── RELATORIO-CORRECOES.md         # ✅ NOVO - Relatório de correções
```

---

## 🚀 **COMO FAZER DEPLOY**

### **1. Preparação**
```bash
# Clonar repositório
git clone <seu-repositorio>
cd pj-nautica

# Dar permissão ao script de deploy
chmod +x deploy-production.sh
```

### **2. Configuração de Ambiente**
```bash
# Copiar arquivo de configuração
cp env.production.secure .env

# Editar configurações (IMPORTANTE!)
nano .env
```

### **3. Deploy Automático**
```bash
# Executar script de deploy
./deploy-production.sh
```

### **4. Deploy Manual**
```bash
# Sistema principal
docker-compose up -d --build

# Master panel
cd master-panel
docker-compose up -d --build
cd ..
```

---

## 🔐 **CONFIGURAÇÕES DE SEGURANÇA**

### **Variáveis de Ambiente Críticas**
```bash
# JWT Secrets (ALTERAR EM PRODUÇÃO!)
JWT_SECRET=ReservaPro-JWT-Super-Secure-Key-2024-Production-ChangeThisInProduction
JWT_REFRESH_SECRET=ReservaPro-Refresh-Super-Secure-Key-2024-Production-ChangeThisInProduction

# Senhas do Banco (ALTERAR EM PRODUÇÃO!)
DB_PASSWORD=ReservaPro2024!SuperSecurePassword123
MASTER_DB_PASSWORD=MasterPanel2024!SuperSecurePassword123

# API Keys (ALTERAR EM PRODUÇÃO!)
API_KEY=ReservaPro-API-Key-2024-Secure-ChangeThisInProduction
MAIN_SYSTEM_API_KEY=Master-Panel-API-Key-2024-Secure-ChangeThisInProduction
```

### **Configurações de Rate Limiting**
```bash
# Rate limiting global
GLOBAL_RATE_LIMIT_MAX_REQUESTS=1000
GLOBAL_RATE_LIMIT_WINDOW_MS=60000

# Rate limiting por usuário
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Rate limiting master panel
MASTER_RATE_LIMIT_MAX_REQUESTS=50
MASTER_RATE_LIMIT_WINDOW_MS=900000
```

---

## 📊 **MONITORAMENTO**

### **Health Checks**
- **Sistema Principal**: `http://localhost:3011/health`
- **Master Panel**: `http://localhost:3012/health`

### **Métricas**
- **Sistema Principal**: `http://localhost:3011/metrics`
- **Master Panel**: `http://localhost:3012/metrics`

### **Logs**
```bash
# Logs do sistema principal
docker-compose logs -f backend

# Logs do master panel
cd master-panel
docker-compose logs -f master-backend
cd ..
```

---

## 🔧 **MANUTENÇÃO**

### **Backup Automático**
```bash
# Backup do banco principal
docker exec reservapro_db pg_dump -U reservapro_user reservapro_db > backup_main.sql

# Backup do master panel
docker exec master-panel-postgres pg_dump -U master_user master_panel_db > backup_master.sql
```

### **Atualização de Segurança**
```bash
# Atualizar imagens
docker-compose pull
docker-compose up -d --build

# Verificar vulnerabilidades
docker scout cves reservapro_backend
```

### **Limpeza de Recursos**
```bash
# Limpar containers órfãos
docker container prune -f

# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes não utilizados
docker volume prune -f
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Porta já em uso**
```bash
# Verificar portas em uso
netstat -tuln | grep :3010
netstat -tuln | grep :3011
netstat -tuln | grep :3012
netstat -tuln | grep :3013

# Parar serviços conflitantes
sudo systemctl stop <servico>
```

#### **2. Erro de CORS**
```bash
# Verificar configuração CORS
grep CORS_ORIGIN .env

# Adicionar origem ao CORS
echo "CORS_ORIGIN=http://localhost:3010,http://localhost:3013" >> .env
```

#### **3. Rate Limit atingido**
```bash
# Verificar logs de rate limit
docker-compose logs backend | grep "rate limit"

# Ajustar configurações
nano .env
```

#### **4. Banco de dados não conecta**
```bash
# Verificar status do banco
docker-compose ps postgres

# Verificar logs do banco
docker-compose logs postgres

# Testar conexão
docker exec reservapro_backend npm run db:migrate
```

---

## 📞 **SUPORTE**

### **Logs de Erro**
```bash
# Coletar logs completos
docker-compose logs > logs_sistema_principal.txt
cd master-panel
docker-compose logs > logs_master_panel.txt
cd ..
```

### **Informações do Sistema**
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Informações do sistema
docker system df
```

---

## ✅ **CHECKLIST DE DEPLOY**

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` configurado
- [ ] Portas 3010-3013 disponíveis
- [ ] Script de deploy executado
- [ ] Health checks passando
- [ ] Logs sem erros críticos
- [ ] Backup dos dados existentes
- [ ] Configurações de segurança aplicadas
- [ ] Rate limiting funcionando
- [ ] CORS configurado corretamente

---

## 🎯 **RESULTADO FINAL**

Após seguir este guia, você terá:

✅ **Sistema Principal** rodando em `http://localhost:3010`  
✅ **Master Panel** rodando em `http://localhost:3013`  
✅ **Segurança avançada** implementada  
✅ **Rate limiting** configurado  
✅ **Monitoramento** ativo  
✅ **Backup automático** configurado  
✅ **Logs estruturados** funcionando  

**O sistema está pronto para produção!** 🚀





