# 🔧 Resolver Problemas no Servidor

## ⚠️ PROBLEMAS ENCONTRADOS:

1. **Git Pull:** "Already up to date" - Mas deveria ter atualização
2. **Docker Compose:** Erro de interpolação no JWT_SECRET

---

## 🔍 PROBLEMA 1: Git Pull "Already up to date"

### **Possíveis causas:**

1. O commit ainda não está no GitHub (improvável, fizemos push)
2. O servidor já tem o commit (possível)
3. Há problema com o remote do servidor

### **Verificar:**

```bash
# No servidor
cd /opt/embarcacoes

# Ver commit atual
git log -1 --oneline

# Ver branch atual
git branch

# Ver remotes
git remote -v

# Verificar se há diferenças
git fetch origin
git log HEAD..origin/main --oneline

# Forçar atualização
git pull origin main --force
```

---

## 🔧 PROBLEMA 2: Docker Compose - JWT_SECRET com caracteres especiais

O erro:
```
ERROR: Invalid interpolation format for "environment" option in service "backend": "JWT_Secret_Super_Seguro_2024_Embarcacoes!@#$%^&*()"
```

**Causa:** Caracteres especiais `!@#$%^&*()` no JWT_SECRET estão causando erro de parsing no docker-compose.

### **Solução 1: Escapar caracteres no docker-compose.yml**

Editar o `docker-compose.prod.yml` e usar variáveis de ambiente ou escapar:

```yaml
# ❌ ERRADO (causa erro):
environment:
  JWT_SECRET: ${JWT_SECRET}

# ✅ CORRETO - Opção 1: Usar aspas
environment:
  JWT_SECRET: "${JWT_SECRET}"

# ✅ CORRETO - Opção 2: Escapar caracteres especiais
environment:
  JWT_SECRET: ${JWT_SECRET}  # Mas garantir que está no .env
```

### **Solução 2: Corrigir o .env**

O problema pode estar no arquivo `.env` no servidor:

```bash
# No servidor, editar .env
cd /opt/embarcacoes
nano .env

# OU verificar o conteúdo:
cat .env | grep JWT_SECRET

# O valor deve estar entre aspas ou sem caracteres especiais problemáticos
```

### **Solução 3: Usar docker-compose sem o arquivo .env problemático**

```bash
# Verificar variáveis de ambiente
cd /opt/embarcacoes
cat .env | grep JWT

# Editar e corrigir
nano .env

# Escapar o JWT_SECRET com aspas simples
JWT_SECRET='JWT_Secret_Super_Seguro_2024_Embarcacoes!@#$%^&*()'
```

---

## 🚀 SOLUÇÃO RÁPIDA:

### **1. Verificar se o commit está no servidor:**

```bash
cd /opt/embarcacoes
git log -1 --oneline
# Se mostrar 1d068cb, já está atualizado!
# Se mostrar d7e7ef0, precisa atualizar
```

### **2. Se não está atualizado, forçar pull:**

```bash
cd /opt/embarcacoes
git fetch origin
git reset --hard origin/main
# ⚠️ CUIDADO: Isso vai descartar alterações locais no servidor
```

### **3. Corrigir problema do JWT_SECRET:**

```bash
cd /opt/embarcacoes

# Ver o .env atual
cat .env | grep JWT_SECRET

# Editar o .env (usar aspas)
nano .env

# Colocar JWT_SECRET entre aspas simples:
JWT_SECRET='JWT_Secret_Super_Seguro_2024_Embarcacoes!@#$%^&*()'

# Salvar (Ctrl+X, Y, Enter)
```

### **4. Verificar docker-compose.prod.yml:**

```bash
cd /opt/embarcacoes
cat docker-compose.prod.yml | grep -A 5 JWT_SECRET

# Se estiver usando ${JWT_SECRET}, deve funcionar se o .env estiver correto
```

### **5. Tentar novamente:**

```bash
cd /opt/embarcacoes

# Testar se docker-compose está OK agora
docker-compose -f docker-compose.prod.yml config

# Se não der erro, aplicar migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 🔍 COMANDOS DE DIAGNÓSTICO:

### **Verificar status completo:**

```bash
cd /opt/embarcacoes

# 1. Ver commit atual
echo "=== COMMIT ATUAL ==="
git log -1 --oneline

# 2. Ver branch e remote
echo ""
echo "=== BRANCH E REMOTE ==="
git branch
git remote -v

# 3. Verificar diferenças
echo ""
echo "=== VERIFICANDO DIFERENÇAS ==="
git fetch origin
git log HEAD..origin/main --oneline

# 4. Ver JWT_SECRET no .env
echo ""
echo "=== JWT_SECRET NO .ENV ==="
cat .env | grep JWT_SECRET | head -1

# 5. Testar docker-compose
echo ""
echo "=== TESTANDO DOCKER-COMPOSE ==="
docker-compose -f docker-compose.prod.yml config 2>&1 | head -20
```

---

## ✅ SE O COMMIT JÁ ESTÁ NO SERVIDOR:

Se o `git log -1` mostrar commit `1d068cb`, então está atualizado!

Nesse caso, só precisa:
1. Corrigir o problema do JWT_SECRET
2. Aplicar as migrations
3. Reiniciar backend

---

## 🎯 PRÓXIMOS PASSOS:

1. **Verificar commit atual no servidor**
2. **Corrigir JWT_SECRET no .env**
3. **Aplicar migrations**
4. **Reiniciar backend**

Execute os comandos de diagnóstico primeiro para ver o que precisa ser corrigido!

