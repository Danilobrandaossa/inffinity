# 🎯 **PAINEL MASTER - RESERVAPRO**

## 📋 **VISÃO GERAL**

Sistema de administração Master para controle global de todos os tenants da plataforma ReservaPro. Permite gestão centralizada, monitoramento, auditoria e suporte multi-tenant.

## 🏗️ **ARQUITETURA**

### **Estrutura do Projeto:**
```
master-panel/
├── backend/                 # API Master
│   ├── src/
│   │   ├── controllers/     # Controllers Master
│   │   ├── services/        # Services Master
│   │   ├── middleware/      # Middleware Master
│   │   ├── routes/          # Rotas Master
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilitários
│   ├── prisma/              # Schema e migrações
│   ├── tests/               # Testes backend
│   └── package.json
├── frontend/                # Interface Master
│   ├── src/
│   │   ├── pages/           # Páginas Master
│   │   ├── components/      # Componentes Master
│   │   ├── stores/          # Stores Zustand
│   │   ├── hooks/           # Hooks customizados
│   │   └── lib/             # Bibliotecas
│   ├── tests/               # Testes frontend
│   └── package.json
├── docs/                    # Documentação
│   ├── api/                 # Documentação da API
│   ├── deployment/          # Guias de deploy
│   └── architecture/        # Arquitetura
├── tests/                   # Testes E2E
└── docker-compose.yml       # Orquestração
```

## 🚀 **FUNCIONALIDADES**

### **1. Gestão de Tenants**
- ✅ CRUD completo de empresas
- ✅ Ativação/Suspensão de tenants
- ✅ Gestão de planos e limites
- ✅ Configurações centralizadas

### **2. Segurança e Acesso**
- ✅ Autenticação 2FA obrigatória
- ✅ IP Allowlist
- ✅ Sistema de impersonate
- ✅ Auditoria completa

### **3. Monitoramento**
- ✅ Métricas em tempo real
- ✅ Logs estruturados
- ✅ Health checks
- ✅ Alertas automáticos

### **4. RBAC (Role-Based Access Control)**
- ✅ **MASTER_OWNER**: Controle total
- ✅ **MASTER_SUPPORT**: Suporte e monitoramento
- ✅ **MASTER_AUDITOR**: Apenas auditoria

## 🔧 **TECNOLOGIAS**

### **Backend:**
- **Runtime**: Node.js + Express + TypeScript
- **ORM**: Prisma + PostgreSQL
- **Auth**: JWT + bcryptjs + speakeasy (2FA)
- **Security**: Helmet + CORS + Rate Limiting
- **Logging**: Winston

### **Frontend:**
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios + React Query
- **UI**: Lucide React Icons
- **Charts**: Recharts

## 📦 **INSTALAÇÃO**

### **1. Pré-requisitos:**
```bash
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
```

### **2. Instalação:**
```bash
# Clone o repositório
git clone <repo-url>
cd master-panel

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Subir banco de dados
docker-compose up -d postgres

# Executar migrações
npm run db:migrate

# Executar seeds
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## 🔐 **ACESSO**

### **URLs:**
- **Master Panel**: `https://master.reservapro.com`
- **API Master**: `https://api-master.reservapro.com`

### **Credenciais Padrão:**
```
Email: master@reservapro.com
Senha: Master123!@#
2FA: Configurar no primeiro acesso
```

## 📊 **MONITORAMENTO**

### **Métricas Disponíveis:**
- Total de tenants ativos/suspensos
- Usuários por tenant
- Agendamentos por período
- Receita por tenant
- Erros 4xx/5xx
- Tempo de resposta

### **Logs de Auditoria:**
- Todas as ações Master
- Logins e logouts
- Impersonates
- Alterações de configuração
- Suspensões/Ativações

## 🧪 **TESTES**

### **Executar Testes:**
```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 **DEPLOY**

### **Ambiente de Produção:**
```bash
# Build
npm run build

# Deploy
npm run deploy:prod

# Health Check
curl https://api-master.reservapro.com/health
```

## 📚 **DOCUMENTAÇÃO**

- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Architecture](./docs/architecture/README.md)
- [Security](./docs/security/README.md)

## 🤝 **CONTRIBUIÇÃO**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **LICENÇA**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 **SUPORTE**

- **Email**: suporte@reservapro.com
- **Documentação**: [docs.reservapro.com](https://docs.reservapro.com)
- **Issues**: [GitHub Issues](https://github.com/reservapro/master-panel/issues)

---

**ReservaPro Master Panel** - Controle total da sua plataforma multi-tenant 🚀








