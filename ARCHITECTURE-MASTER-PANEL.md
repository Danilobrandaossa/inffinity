# 🏗️ **ARQUITETURA PAINEL MASTER - RESERVAPRO**

## 📊 **STACK TÉCNICA**

### **Backend:**
- **Runtime:** Node.js + Express + TypeScript
- **ORM:** Prisma + PostgreSQL
- **Auth:** JWT + bcryptjs + speakeasy (2FA)
- **Security:** Helmet + CORS + Rate Limiting
- **Logging:** Winston
- **Validation:** Zod

### **Frontend:**
- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios + React Query
- **UI Components:** Lucide React Icons
- **Charts:** Recharts

### **Database:**
- **Primary:** PostgreSQL (Schema-per-Tenant)
- **Isolation:** RLS (Row Level Security) + Schema separation
- **Migrations:** Prisma Migrate

---

## 🏢 **MULTI-TENANCY STRATEGY**

### **Schema-per-Tenant Architecture:**
```
postgresql://localhost:5432/reservapro
├── public (Master tables)
│   ├── tenants
│   ├── plans
│   ├── master_users
│   ├── audit_logs
│   └── metrics_rollup
├── tenant_001 (Empresa A)
│   ├── users
│   ├── vessels
│   ├── bookings
│   └── ...
└── tenant_002 (Empresa B)
    ├── users
    ├── vessels
    ├── bookings
    └── ...
```

### **Vantagens:**
- ✅ **Isolamento Total:** Dados completamente separados
- ✅ **Segurança:** Impossível vazar dados entre tenants
- ✅ **Backup:** Backup individual por tenant
- ✅ **Escalabilidade:** Migração de tenant para servidor dedicado
- ✅ **Compliance:** LGPD/GDPR compliance nativo

### **Desvantagens:**
- ❌ **Complexidade:** Migrações em múltiplos schemas
- ❌ **Custo:** Mais schemas = mais overhead
- ❌ **Manutenção:** Backup/restore mais complexo

---

## 🔐 **RBAC (Role-Based Access Control)**

### **Perfis Master:**
- **master_owner:** Controle total do sistema
- **master_support:** Suporte e monitoramento
- **master_auditor:** Apenas auditoria e logs

### **Perfis Tenant:**
- **tenant_owner:** Proprietário da empresa
- **tenant_admin:** Administrador da empresa
- **tenant_editor:** Editor de conteúdo
- **tenant_readonly:** Apenas leitura

### **Matriz de Permissões:**
```
                    | master_owner | master_support | master_auditor | tenant_owner | tenant_admin | tenant_editor | tenant_readonly
--------------------|--------------|----------------|----------------|--------------|--------------|---------------|----------------
Criar Tenant        | ✅           | ❌             | ❌             | ❌           | ❌           | ❌            | ❌
Suspender Tenant    | ✅           | ✅             | ❌             | ❌           | ❌           | ❌            | ❌
Impersonate         | ✅           | ✅             | ❌             | ❌           | ❌           | ❌            | ❌
Ver Métricas        | ✅           | ✅             | ✅             | ❌           | ❌           | ❌            | ❌
Editar Config       | ✅           | ❌             | ❌             | ✅           | ✅           | ❌            | ❌
Gerenciar Usuários  | ✅           | ❌             | ❌             | ✅           | ✅           | ❌            | ❌
```

---

## 📋 **PLANOS E RECURSOS**

### **Plano Básico (R$ 99/mês):**
- 5 usuários
- 3 embarcações
- 50 agendamentos/mês
- Suporte por email
- Relatórios básicos

### **Plano Pro (R$ 199/mês):**
- 15 usuários
- 10 embarcações
- 200 agendamentos/mês
- Suporte prioritário
- Relatórios avançados
- Integrações API

### **Plano Premium (R$ 399/mês):**
- Usuários ilimitados
- Embarcações ilimitadas
- Agendamentos ilimitados
- Suporte 24/7
- Relatórios customizados
- White-label completo
- SSO/SAML

---

## 🔒 **SEGURANÇA**

### **Autenticação Master:**
- 2FA TOTP obrigatório
- IP Allowlist
- Rate limiting (5 tentativas/min)
- Lockout progressivo
- Sessões com expiração

### **Impersonate Seguro:**
- Apenas perfis Master
- Auditoria completa
- Reversível a qualquer momento
- Notificação ao usuário impersonado

### **Headers de Segurança:**
- HSTS
- CSP
- X-Frame-Options
- X-Content-Type-Options

---

## 📊 **OBSERVABILIDADE**

### **Métricas por Tenant:**
- CPU/Memória
- Acessos simultâneos
- Agendamentos/dia
- Erros 4xx/5xx
- Tempo de resposta

### **Logs Estruturados:**
- JSON format
- Contexto por tenant
- IP/User-Agent
- Timestamp UTC
- Severity levels

### **Health Checks:**
- Database connectivity
- Tenant schema status
- API response times
- Queue processing

---

## 🚀 **DEPLOYMENT**

### **Ambiente de Desenvolvimento:**
```bash
docker-compose up -d
npm run dev
```

### **Ambiente de Produção:**
```bash
docker-compose -f docker-compose.prod.yml up -d
npm run build
npm run start
```

### **Migrações:**
```bash
npm run prisma:migrate
npm run prisma:seed
```

---

## 📁 **ESTRUTURA DE PASTAS**

```
backend/
├── src/
│   ├── controllers/
│   │   ├── master/
│   │   │   ├── auth.controller.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── plans.controller.ts
│   │   │   ├── metrics.controller.ts
│   │   │   └── audit.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── master/
│   │   │   ├── tenant.service.ts
│   │   │   ├── impersonate.service.ts
│   │   │   └── metrics.service.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── master-auth.ts
│   │   ├── tenant-context.ts
│   │   └── impersonate.ts
│   └── routes/
│       ├── master/
│       │   ├── auth.routes.ts
│       │   ├── tenants.routes.ts
│       │   └── ...
│       └── ...
└── prisma/
    ├── migrations/
    ├── seeds/
    │   ├── master.seed.ts
    │   └── tenants.seed.ts
    └── schema.prisma

frontend/
├── src/
│   ├── pages/
│   │   ├── master/
│   │   │   ├── MasterLogin.tsx
│   │   │   ├── MasterDashboard.tsx
│   │   │   ├── TenantsList.tsx
│   │   │   ├── TenantDetail.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── components/
│   │   ├── master/
│   │   │   ├── MasterLayout.tsx
│   │   │   ├── TenantCard.tsx
│   │   │   ├── MetricsChart.tsx
│   │   │   └── ...
│   │   └── ...
│   └── stores/
│       ├── masterAuthStore.ts
│       └── tenantStore.ts
└── ...
```

---

## 🎯 **CRITÉRIOS DE ACEITAÇÃO**

### **Funcionalidades:**
- ✅ Suspensão bloqueia login/API imediatamente
- ✅ Impersonate apenas para Master, auditado
- ✅ Upgrade/downgrade aplica limites na hora
- ✅ 2FA funcional com códigos de recuperação
- ✅ IP allowlist efetivo

### **Performance:**
- ✅ Métricas com atraso ≤ 60s
- ✅ API response time < 200ms
- ✅ Suporte a 1000+ tenants
- ✅ 99.9% uptime

### **Segurança:**
- ✅ Zero vazamento de dados entre tenants
- ✅ Auditoria completa de ações
- ✅ Compliance LGPD/GDPR
- ✅ Backup/restore por tenant

---

## 📈 **ROADMAP**

### **v1.0 (Atual):**
- Gestão básica de tenants
- Planos e permissões
- 2FA e segurança
- Métricas básicas

### **v1.1:**
- SSO/SAML
- White-label avançado
- API webhooks
- Relatórios customizados

### **v1.2:**
- Multi-região
- Auto-scaling
- Machine Learning
- Mobile app

---

**Arquitetura projetada para escalar de 10 a 10.000+ tenants com performance e segurança enterprise-grade.**








