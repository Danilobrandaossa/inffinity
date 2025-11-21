# 🔍 Verificar e Aplicar Migrations no Servidor

## ⚠️ PROBLEMA IDENTIFICADO:

O banco de dados está **VAZIO** - nenhuma tabela existe!

Isso significa que as migrations do Prisma **nunca foram aplicadas**.

---

## 🔍 VERIFICAR MIGRATIONS:

Execute no servidor:

```bash
cd /opt/embarcacoes

# Ver se há migrations
ls -la backend/prisma/migrations/ 2>/dev/null || echo "Diretório não existe ou não tem migrations"

# Ver o schema atual
cat backend/prisma/schema.prisma | grep -A 2 "^model"
```

---

## ✅ SOLUÇÕES:

### **Opção 1: Aplicar todas as migrations via Prisma (se funcionar)**

Depois de corrigir o problema do OpenSSL no Dockerfile, aplicar:

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

### **Opção 2: Criar banco do zero via Prisma db push**

```bash
cd /opt/embarcacoes
# Rebuild do backend com OpenSSL correto primeiro
docker-compose -f docker-compose.prod.yml up -d --build backend

# Depois aplicar schema
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

---

### **Opção 3: Aplicar manualmente via SQL (última opção)**

Se nada funcionar, podemos criar as tabelas manualmente via SQL.

---

## 🚀 PRÓXIMO PASSO:

1. **Corrigir Dockerfile.prod** (adicionar OpenSSL) ✅ JÁ FEITO LOCALMENTE
2. **Commitar e enviar para servidor**
3. **Rebuild do container backend**
4. **Aplicar migrations ou db push**

---

## 📋 VERIFICAR AGORA:

Execute:

```bash
cd /opt/embarcacoes
ls -la backend/prisma/migrations/
cat backend/prisma/schema.prisma | head -50
```

Isso mostra se há migrations e o schema atual.

