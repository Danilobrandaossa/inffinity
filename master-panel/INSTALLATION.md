# 🚀 **INSTALAÇÃO - PAINEL MASTER RESERVAPRO**

## 📋 **PRÉ-REQUISITOS**

- **Node.js**: 18+ 
- **Docker**: 20+ e Docker Compose
- **PostgreSQL**: 14+ (ou usar Docker)
- **Git**: Para clonar o repositório

## 🏗️ **INSTALAÇÃO RÁPIDA**

### **1. Clonar e Configurar**
```bash
# Clonar o repositório
git clone <repo-url>
cd master-panel

# Copiar arquivo de ambiente
cp backend/env.example backend/.env

# Editar configurações
nano backend/.env
```

### **2. Configurar Variáveis de Ambiente**
```bash
# backend/.env
DATABASE_URL="postgresql://master_user:master_password_123@localhost:5433/master_panel_db"
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
PORT=3002
CORS_ORIGIN="http://localhost:3001"
```

### **3. Instalar e Executar**
```bash
# Instalar dependências
npm install

# Subir banco de dados
docker-compose up -d postgres

# Executar migrações
npm run db:migrate

# Executar seed
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## 🔧 **INSTALAÇÃO MANUAL (SEM DOCKER)**

### **1. Banco de Dados**
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE master_panel_db;
CREATE USER master_user WITH PASSWORD 'master_password_123';
GRANT ALL PRIVILEGES ON DATABASE master_panel_db TO master_user;
\q
```

### **2. Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### **3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🐳 **INSTALAÇÃO COM DOCKER**

### **1. Desenvolvimento**
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### **2. Produção**
```bash
# Build e deploy
docker-compose -f docker-compose.prod.yml up -d

# Com nginx
docker-compose --profile production up -d
```

## 🔐 **CONFIGURAÇÃO INICIAL**

### **1. Primeiro Acesso**
```
URL: http://localhost:3001
Email: master@reservapro.com
Senha: Master123!@#
```

### **2. Configurar 2FA**
1. Fazer login
2. Ir em "Configurações" > "Segurança"
3. Configurar 2FA com app autenticador
4. Salvar códigos de recuperação

### **3. Configurar IP Allowlist**
1. Ir em "Perfil" > "Segurança"
2. Adicionar IPs permitidos
3. Salvar configurações

## 📊 **VERIFICAÇÃO DA INSTALAÇÃO**

### **1. Health Check**
```bash
curl http://localhost:3002/health
```

### **2. Teste de Login**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@reservapro.com","password":"Master123!@#"}'
```

### **3. Teste de API**
```bash
# Obter token
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@reservapro.com","password":"Master123!@#"}' \
  | jq -r '.data.accessToken')

# Testar endpoint protegido
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/tenants
```

## 🛠️ **COMANDOS ÚTEIS**

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar testes
npm run test

# Lint e format
npm run lint
npm run format
```

### **Banco de Dados**
```bash
# Gerar Prisma Client
npm run prisma:generate

# Aplicar migrações
npm run prisma:migrate

# Reset do banco
npm run db:reset

# Seed de dados
npm run db:seed

# Prisma Studio
npm run prisma:studio
```

### **Docker**
```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Rebuild
docker-compose up --build

# Parar tudo
docker-compose down -v
```

## 🔧 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U master_user -d master_panel_db
```

#### **2. Erro de Porta em Uso**
```bash
# Verificar portas em uso
netstat -tulpn | grep :3002
netstat -tulpn | grep :3001

# Matar processo
sudo kill -9 <PID>
```

#### **3. Erro de Permissões**
```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod -R 755 .
```

#### **4. Erro de Dependências**
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Logs e Debug**
```bash
# Logs do backend
docker-compose logs -f backend

# Logs do frontend
docker-compose logs -f frontend

# Logs do banco
docker-compose logs -f postgres

# Logs de todos os serviços
docker-compose logs -f
```

## 📚 **PRÓXIMOS PASSOS**

### **1. Configuração de Produção**
- [ ] Configurar SSL/TLS
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Configurar logs centralizados

### **2. Segurança**
- [ ] Alterar senhas padrão
- [ ] Configurar firewall
- [ ] Configurar rate limiting
- [ ] Configurar CORS

### **3. Monitoramento**
- [ ] Configurar métricas
- [ ] Configurar alertas
- [ ] Configurar dashboards
- [ ] Configurar logs estruturados

## 🆘 **SUPORTE**

### **Documentação**
- [API Documentation](./docs/api/README.md)
- [Architecture Guide](./docs/architecture/README.md)
- [Security Guide](./docs/security/README.md)

### **Contato**
- **Email**: suporte@reservapro.com
- **GitHub**: [Issues](https://github.com/reservapro/master-panel/issues)
- **Discord**: [Comunidade](https://discord.gg/reservapro)

---

**ReservaPro Master Panel** - Instalação completa em 5 minutos! 🚀








