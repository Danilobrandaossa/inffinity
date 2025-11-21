# 🎯 PASSO A PASSO SIMPLES - Faça na Ordem

## ✅ Execute estes comandos NO SERVIDOR (onde você está agora), UM POR VEZ:

### **PASSO 1: Ver o que está acontecendo**

```bash
cd /opt/embarcacoes
git log -1 --oneline
```

**Resultado esperado:**
- Se mostrar `1d068cb` = ✅ JÁ ESTÁ ATUALIZADO!
- Se mostrar `d7e7ef0` = ❌ PRECISA ATUALIZAR

---

### **PASSO 2: Se mostrar `d7e7ef0`, atualizar código**

```bash
cd /opt/embarcacoes
git fetch origin
git reset --hard origin/main
git log -1 --oneline
```

**Deve mostrar:** `1d068cb feat: adiciona campos...`

---

### **PASSO 3: Corrigir problema do JWT_SECRET**

```bash
cd /opt/embarcacoes

# Ver como está o JWT_SECRET
cat .env | grep JWT_SECRET
```

**Depois, editar o arquivo:**

```bash
nano .env
```

**No editor nano:**
1. Use as setas para encontrar a linha que começa com `JWT_SECRET=`
2. Se a linha estiver assim:
   ```
   JWT_SECRET=JWT_Secret_Super_Seguro_2024_Embarcacoes!@#$%^&*()
   ```
3. Mude para (adicione aspas simples no começo e fim):
   ```
   JWT_SECRET='JWT_Secret_Super_Seguro_2024_Embarcacoes!@#$%^&*()'
   ```
4. Salvar: Pressione `Ctrl + X`, depois `Y`, depois `Enter`

---

### **PASSO 4: Testar se docker-compose está OK**

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml config
```

**Resultado esperado:**
- Se **NÃO mostrar erro** = ✅ OK! Continue para o PASSO 5
- Se **mostrar erro** = ❌ Volte ao PASSO 3 e verifique o .env novamente

---

### **PASSO 5: Aplicar migrations no banco**

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields
```

**Resultado esperado:**
- Deve mostrar: `Migration applied successfully` ou similar
- Se mostrar erro, copie a mensagem e me mostre

---

### **PASSO 6: Reiniciar backend**

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml restart backend
```

**Resultado esperado:**
- Deve mostrar: `Restarting embarcacoes_backend_prod ... done`

---

### **PASSO 7: Verificar se está tudo OK**

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml ps
```

**Resultado esperado:**
- Todos os containers devem mostrar `Up` ou `Up (healthy)`

---

## 📝 RESUMO - Copie e Cole na Ordem:

```bash
# PASSO 1
cd /opt/embarcacoes && git log -1 --oneline

# PASSO 2 (só se o PASSO 1 mostrar d7e7ef0)
cd /opt/embarcacoes && git fetch origin && git reset --hard origin/main && git log -1 --oneline

# PASSO 3
cd /opt/embarcacoes && cat .env | grep JWT_SECRET
# Depois editar: nano .env

# PASSO 4
cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml config

# PASSO 5
cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields

# PASSO 6
cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml restart backend

# PASSO 7
cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml ps
```

---

## ❓ O QUE FAZER SE DER ERRO?

**Se der erro em algum passo:**

1. **Copie a mensagem de erro completa**
2. **Me mostre aqui**
3. **Eu ajudo a resolver**

---

## ✅ CHECKLIST:

Execute os passos na ordem:

- [ ] PASSO 1: Ver commit atual
- [ ] PASSO 2: Atualizar (se necessário)
- [ ] PASSO 3: Corrigir JWT_SECRET no .env
- [ ] PASSO 4: Testar docker-compose
- [ ] PASSO 5: Aplicar migrations
- [ ] PASSO 6: Reiniciar backend
- [ ] PASSO 7: Verificar containers

---

**Comece pelo PASSO 1 e vá passo a passo!** 🚀

