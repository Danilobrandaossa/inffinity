# 📝 Passo a Passo: Commitar Schema Prisma e Atualizar Servidor

## ⚠️ IMPORTANTE

Você precisa fazer o commit **LOCALMENTE** (no seu PC Windows), não no servidor!

No servidor, o schema está igual ao commit (sem modificações).

---

## ✅ PASSO A PASSO CORRETO

### **1. LOCAL (Windows PowerShell) - Ver alterações**

```powershell
# Ver todas as alterações no schema
git diff backend/prisma/schema.prisma

# Ver resumo
git diff --stat backend/prisma/schema.prisma
```

---

### **2. LOCAL - Commitar as alterações**

```powershell
# Adicionar o arquivo
git add backend/prisma/schema.prisma

# Verificar que foi adicionado
git status

# Commitar
git commit -m "feat: adiciona campos de integração Mercado Pago nos models de pagamento"

# Ver o commit criado
git log -1
```

---

### **3. LOCAL - Enviar para GitHub**

**⚠️ Problema:** GitHub não aceita senha, precisa de **Personal Access Token (PAT)**

#### **Opção A: Usar SSH (recomendado)**

```powershell
# Verificar se já usa SSH
git remote -v

# Se estiver usando HTTPS, trocar para SSH
git remote set-url origin git@github.com:Danilobrandaossa/inffinity.git

# Tentar push novamente
git push origin main
```

#### **Opção B: Usar Personal Access Token**

1. **Criar token no GitHub:**
   - Vá em: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Dê um nome: "Inffinity-Project"
   - Selecione escopos: `repo` (acesso completo ao repositório)
   - Copie o token (só aparece uma vez!)

2. **Usar token no push:**

```powershell
# Quando pedir senha, use o TOKEN ao invés da senha
git push origin main

# Username: Danilobrandaossa
# Password: [COLE O TOKEN AQUI]
```

#### **Opção C: Configurar credenciais do Git**

```powershell
# Configurar para usar credenciais salvas
git config --global credential.helper manager-core

# Depois fazer push (vai salvar as credenciais)
git push origin main
```

---

### **4. SERVIDOR - Atualizar código**

Depois que o push funcionar, atualizar o servidor:

```bash
# Conectar ao servidor
ssh root@145.223.93.235

# Ir para o diretório do projeto
cd /opt/embarcacoes

# Atualizar código
git pull origin main
```

---

### **5. SERVIDOR - Aplicar migrations**

```bash
# Verificar migrations pendentes
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Se houver migrations pendentes, aplicar
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# OU criar nova migration (se necessário)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name add_mercado_pago_fields
```

---

## 🔍 VERIFICAR OUTROS ARQUIVOS MODIFICADOS NO SERVIDOR

Você viu que há outros arquivos modificados no servidor:

```
modified:   backend/Dockerfile.prod
modified:   docker-compose.prod.yml
modified:   frontend/Dockerfile.prod
modified:   frontend/package.json
modified:   nginx/nginx.conf
```

### **Opção 1: Ver o que foi modificado**

```bash
# No servidor
cd /opt/embarcacoes
git status
git diff backend/Dockerfile.prod
git diff docker-compose.prod.yml
git diff frontend/package.json
```

### **Opção 2: Descartar alterações (se não forem necessárias)**

```bash
# No servidor
cd /opt/embarcacoes
git restore backend/Dockerfile.prod
git restore docker-compose.prod.yml
git restore frontend/Dockerfile.prod
git restore frontend/package.json
git restore nginx/nginx.conf
```

### **Opção 3: Commitar também (se forem importantes)**

```bash
# No servidor
cd /opt/embarcacoes
git add .
git commit -m "feat: atualiza configurações Docker e nginx"
git push origin main
```

---

## 🚨 RESOLVER PROBLEMA DE AUTENTICAÇÃO GITHUB

### **Criar Personal Access Token:**

1. Acesse: https://github.com/settings/tokens/new
2. Nome: `Inffinity-Local-Machine`
3. Expiração: `90 days` (ou o que preferir)
4. Permissões: Marque `repo` (tudo)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (só aparece uma vez!)

### **Usar o token:**

No PowerShell, quando pedir senha no `git push`:
- Username: `Danilobrandaossa`
- Password: `[COLE O TOKEN AQUI]`

---

## ✅ CHECKLIST

- [ ] Ver alterações localmente: `git diff backend/prisma/schema.prisma`
- [ ] Commitar localmente: `git add` e `git commit`
- [ ] Resolver autenticação GitHub (SSH ou Token)
- [ ] Fazer push: `git push origin main`
- [ ] Conectar ao servidor: `ssh root@145.223.93.235`
- [ ] Atualizar código: `git pull origin main`
- [ ] Aplicar migrations: `npx prisma migrate deploy`
- [ ] Verificar outros arquivos modificados no servidor

---

**Próximo passo:** Execute o passo 1 e 2 LOCALMENTE (no Windows).

