# 🎯 O QUE FAZER AGORA - Passo a Passo Simples

## ✅ JÁ FOI FEITO:

1. ✅ Commit das alterações do schema Prisma (feito localmente)
2. ✅ Push para GitHub (feito localmente)
3. ✅ SSH configurado e funcionando

---

## 📋 PRÓXIMO PASSO: Atualizar o Servidor

Você precisa executar **NO SERVIDOR** (via SSH ou direto se já estiver conectado).

### **Opção 1: Se você está no servidor AGORA**

Execute estes comandos **UM POR VEZ** e veja o resultado:

```bash
# 1. Ir para o diretório
cd /opt/embarcacoes

# 2. Atualizar código do GitHub
git pull origin main

# 3. Verificar que atualizou (deve mostrar commit 1d068cb)
git log -1 --oneline

# 4. Aplicar migrations no banco de dados
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields

# 5. Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend

# 6. Verificar se está tudo OK
docker-compose -f docker-compose.prod.yml ps
```

---

### **Opção 2: Se você está no seu PC (Windows)**

**Passo 1:** Conectar ao servidor via SSH

```powershell
ssh root@145.223.93.235
```

**Passo 2:** Depois de conectar, execute os comandos acima (Opção 1)

---

### **Opção 3: Executar tudo de uma vez (do seu PC)**

```powershell
# Copie e cole este comando completo:
ssh root@145.223.93.235 'cd /opt/embarcacoes && git pull origin main && echo "✅ Atualizado!" && git log -1 --oneline && echo "" && echo "🔄 Aplicando migrations..." && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields && echo "" && echo "🔄 Reiniciando backend..." && docker-compose -f docker-compose.prod.yml restart backend && echo "" && echo "✅ Pronto!" && docker-compose -f docker-compose.prod.yml ps'
```

---

## 🎯 RESUMO ULTRA SIMPLES:

### **O que precisa acontecer:**

1. ✅ **Local (Windows):** ✅ JÁ FEITO
   - Commit do schema.prisma
   - Push para GitHub

2. ⏳ **Servidor (Linux):** ❌ PRECISA FAZER AGORA
   - Atualizar código: `git pull origin main`
   - Aplicar migrations: `npx prisma migrate dev`
   - Reiniciar backend: `docker-compose restart backend`

---

## 📝 PASSO A PASSO MAIS DETALHADO:

### **1. Conectar ao servidor (se não estiver conectado):**

```bash
ssh root@145.223.93.235
# Digite a senha quando pedir
```

### **2. Ir para o diretório do projeto:**

```bash
cd /opt/embarcacoes
```

### **3. Ver o que tem lá agora:**

```bash
git log -1 --oneline
# Deve mostrar: d7e7ef0 Deploy do SAAS de embarcações
```

### **4. Atualizar código do GitHub:**

```bash
git pull origin main
# Deve mostrar atualização para commit 1d068cb
```

### **5. Verificar que atualizou:**

```bash
git log -1 --oneline
# Deve mostrar: 1d068cb feat: adiciona campos de integração Mercado Pago...
```

### **6. Aplicar migrations no banco:**

```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields
# Isso vai criar e aplicar as migrations
```

### **7. Reiniciar o backend:**

```bash
docker-compose -f docker-compose.prod.yml restart backend
# Isso reinicia o container do backend
```

### **8. Ver se está tudo OK:**

```bash
docker-compose -f docker-compose.prod.yml ps
# Verifica se todos os containers estão rodando
```

---

## ❓ DÚVIDAS FREQUENTES:

### **P: Estou no Windows, como faço?**

**R:** Abra PowerShell e execute:
```powershell
ssh root@145.223.93.235
```
Depois execute os comandos do servidor.

---

### **P: Não sei se estou no servidor ou no meu PC?**

**R:** Se você ver `root@srv1071525` ou `root@145.223.93.235`, você está **NO SERVIDOR**.  
Se você ver `PS C:\Users\ueles`, você está **NO SEU PC**.

---

### **P: Posso executar tudo de uma vez?**

**R:** Sim! Use a **Opção 3** acima (um comando só).

---

### **P: E se der erro?**

**R:** Copie a mensagem de erro e me mostre. Vou ajudar a resolver!

---

## ✅ CHECKLIST FINAL:

Depois de executar, você deve ver:

- [ ] `git log -1` mostra commit `1d068cb`
- [ ] `git pull` mostra "Updating d7e7ef0..1d068cb"
- [ ] Migration aplicada com sucesso
- [ ] Backend reiniciado
- [ ] Todos containers mostram "Up" ou "Up (healthy)"

---

## 🚀 PRONTO! Execute agora e me mostre o resultado!

Se tiver algum problema, copie a mensagem de erro e me envie. 😊

