# 📚 **API DOCUMENTATION - MASTER PANEL**

## 🔗 **Base URL**
```
http://localhost:3002/api
```

## 🔐 **Autenticação**

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

---

## 🔑 **AUTH ENDPOINTS**

### **POST /auth/login**
Faz login no sistema Master.

**Request:**
```json
{
  "email": "master@reservapro.com",
  "password": "Master123!@#",
  "twoFactorCode": "123456" // Opcional, se 2FA estiver habilitado
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "master@reservapro.com",
      "name": "Master Owner",
      "role": "MASTER_OWNER",
      "twoFactorEnabled": true
    }
  }
}
```

### **POST /auth/setup-2fa**
Configura autenticação 2FA para o usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

### **POST /auth/verify-2fa**
Verifica e habilita 2FA.

**Request:**
```json
{
  "token": "123456"
}
```

### **GET /auth/profile**
Retorna informações do perfil do usuário logado.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "master@reservapro.com",
    "name": "Master Owner",
    "role": "MASTER_OWNER",
    "isActive": true,
    "twoFactorEnabled": true,
    "allowedIPs": ["127.0.0.1"],
    "lastLoginAt": "2024-01-01T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### **POST /auth/logout**
Faz logout do sistema.

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 🏢 **TENANTS ENDPOINTS**

### **GET /tenants**
Lista todas as empresas cadastradas.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `status` (string): Filtrar por status (ACTIVE, SUSPENDED, PENDING, TRIAL)
- `search` (string): Buscar por nome, email ou slug
- `planId` (string): Filtrar por plano

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Demo Empresa",
      "slug": "demo-empresa",
      "email": "contato@demo-empresa.com",
      "status": "ACTIVE",
      "plan": {
        "id": "uuid",
        "name": "Pro",
        "type": "PRO",
        "price": 199.00
      },
      "users": [
        {
          "id": "uuid",
          "email": "admin@demo-empresa.com",
          "name": "Admin Demo",
          "role": "TENANT_OWNER",
          "isActive": true
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### **GET /tenants/:id**
Retorna detalhes de uma empresa específica.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Demo Empresa",
    "slug": "demo-empresa",
    "email": "contato@demo-empresa.com",
    "status": "ACTIVE",
    "plan": {
      "id": "uuid",
      "name": "Pro",
      "type": "PRO"
    },
    "users": [...],
    "metrics": [...],
    "auditLogs": [...]
  }
}
```

### **POST /tenants**
Cria uma nova empresa.

**Request:**
```json
{
  "name": "Nova Empresa",
  "slug": "nova-empresa",
  "email": "contato@nova-empresa.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "country": "BR",
  "website": "https://nova-empresa.com",
  "description": "Descrição da empresa"
}
```

### **PUT /tenants/:id**
Atualiza informações de uma empresa.

### **DELETE /tenants/:id**
Exclui uma empresa (apenas MASTER_OWNER).

### **POST /tenants/:id/suspend**
Suspende uma empresa.

**Request:**
```json
{
  "reason": "Violação dos termos de uso"
}
```

### **POST /tenants/:id/activate**
Ativa uma empresa suspensa.

### **POST /tenants/:tenantId/impersonate**
Inicia impersonate de uma empresa.

**Request:**
```json
{
  "targetUserId": "uuid" // Opcional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "impersonateToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenant": {
      "id": "uuid",
      "name": "Demo Empresa",
      "slug": "demo-empresa",
      "domain": "demo.reservapro.com"
    }
  }
}
```

### **POST /tenants/impersonate/:impersonationId/stop**
Finaliza uma sessão de impersonate.

---

## 📊 **DASHBOARD ENDPOINTS**

### **GET /dashboard/stats**
Retorna estatísticas do dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTenants": 25,
    "activeTenants": 20,
    "suspendedTenants": 3,
    "totalUsers": 150,
    "totalBookings": 1250,
    "totalRevenue": 45000.00,
    "recentActivity": [
      {
        "id": "uuid",
        "action": "TENANT_CREATED",
        "tenantName": "Nova Empresa",
        "timestamp": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 🔍 **AUDIT ENDPOINTS**

### **GET /audit**
Lista logs de auditoria.

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `search` (string): Buscar por ação
- `dateFrom` (string): Data inicial (ISO)
- `dateTo` (string): Data final (ISO)
- `masterUserId` (string): Filtrar por usuário master
- `tenantId` (string): Filtrar por tenant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "masterUser": {
        "id": "uuid",
        "name": "Master Owner",
        "email": "master@reservapro.com"
      },
      "tenant": {
        "id": "uuid",
        "name": "Demo Empresa"
      },
      "action": "TENANT_CREATED",
      "entityType": "Tenant",
      "entityId": "uuid",
      "details": {
        "tenantName": "Nova Empresa",
        "plan": "Pro"
      },
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## ⚠️ **ERROR RESPONSES**

### **400 Bad Request**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": "Email é obrigatório"
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "error": "Token de acesso necessário"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "error": "Sem permissão para acessar este recurso"
}
```

### **404 Not Found**
```json
{
  "success": false,
  "error": "Recurso não encontrado"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "error": "Erro interno do servidor"
}
```

---

## 🔧 **RATE LIMITING**

- **Limite**: 100 requests por 15 minutos por IP
- **Header de resposta**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 📝 **EXAMPLES**

### **Login e Acesso a API**
```bash
# 1. Fazer login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@reservapro.com","password":"Master123!@#"}'

# 2. Usar token para acessar API
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/tenants
```

### **Criar Nova Empresa**
```bash
curl -X POST http://localhost:3002/api/tenants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Empresa",
    "slug": "minha-empresa",
    "email": "contato@minha-empresa.com"
  }'
```

---

## 🚀 **TESTING**

### **Health Check**
```bash
curl http://localhost:3002/health
```

### **Test Suite**
```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

---

**ReservaPro Master Panel API** - Documentação completa! 📚








