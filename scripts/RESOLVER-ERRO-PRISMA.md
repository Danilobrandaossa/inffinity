# 🔧 Resolver Erro do Prisma

## ⚠️ ERRO ENCONTRADO:

```
Error: Could not parse schema engine response: SyntaxError: Unexpected token E in JSON at position 0
```

**Possíveis causas:**
1. Prisma Client não está gerado/atualizado
2. Problema com conexão ao banco
3. Schema precisa ser regenerado

---

## ✅ SOLUÇÕES (tente nesta ordem):

### **SOLUÇÃO 1: Regenerar Prisma Client**

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
```

Se funcionar, tente a migration novamente.

---

### **SOLUÇÃO 2: Usar `prisma migrate deploy` (produção)**

Em produção, é melhor usar `migrate deploy` ao invés de `migrate dev`:

```bash
cd /opt/embarcacoes

# Primeiro, criar a migration manualmente (se necessário)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --create-only --name add_mercado_pago_fields

# Depois, aplicar com deploy
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

### **SOLUÇÃO 3: Usar `prisma db push` (alternativa)**

Se as migrations não funcionarem, pode usar `db push` que aplica direto no banco:

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

⚠️ **Nota:** `db push` não cria arquivos de migration, apenas aplica o schema diretamente no banco.

---

### **SOLUÇÃO 4: Verificar conexão com banco**

```bash
cd /opt/embarcacoes

# Testar conexão
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Verificar variável de ambiente
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL
```

---

### **SOLUÇÃO 5: Rebuild do container backend**

Se nada funcionar, pode precisar rebuild:

```bash
cd /opt/embarcacoes

# Rebuild do backend
docker-compose -f docker-compose.prod.yml up -d --build backend

# Depois tentar novamente
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## 🎯 RECOMENDAÇÃO PARA PRODUÇÃO:

Em produção, o melhor é:

1. **Criar migration localmente**
2. **Commitar a migration**
3. **Aplicar no servidor com `migrate deploy`**

Mas como já está no servidor, vamos tentar:

```bash
# Opção 1: db push (mais rápido)
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push

# OU

# Opção 2: Criar migration manualmente e aplicar
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --create-only --name add_mercado_pago_fields
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## ✅ TENTAR AGORA:

Execute esta sequência:

```bash
cd /opt/embarcacoes

# 1. Regenerar Prisma Client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# 2. Tentar db push (aplicar schema diretamente)
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

Se funcionar, as alterações do schema serão aplicadas no banco!

