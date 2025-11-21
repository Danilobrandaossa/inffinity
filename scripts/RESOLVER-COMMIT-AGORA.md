# 🚀 Resolver Commit - Passo a Passo AGORA

## ⚠️ SITUAÇÃO ATUAL

**Local (Windows):**
- ✅ Muitos arquivos modificados (incluindo `schema.prisma`)
- ✅ Remote usando HTTPS (precisa de token)
- ⚠️ Precisa commitar e fazer push

**Servidor:**
- ✅ Schema está igual ao commit (sem modificações)
- ⚠️ Não precisa commitar lá, só atualizar depois

---

## 🎯 SOLUÇÃO RÁPIDA

### **OPÇÃO 1: Usar SSH (Recomendado - Mais Seguro)**

#### **1. Gerar chave SSH (se ainda não tiver):**

```powershell
# Verificar se já tem chave SSH
ls ~/.ssh/id_*.pub

# Se não tiver, gerar nova
ssh-keygen -t ed25519 -C "danilobrandaossa@github.com"
# Pressione Enter para aceitar local padrão
# Pressione Enter para não usar senha (ou defina uma se quiser)
```

#### **2. Adicionar chave ao GitHub:**

```powershell
# Ver a chave pública
cat ~/.ssh/id_ed25519.pub
# Ou no Windows:
Get-Content ~/.ssh/id_ed25519.pub
```

**Copie o conteúdo e:**
1. Vá em: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Dê um título: "Windows - Inffinity"
4. Cole a chave pública
5. Clique em "Add SSH key"

#### **3. Trocar remote para SSH:**

```powershell
# Trocar de HTTPS para SSH
git remote set-url origin git@github.com:Danilobrandaossa/inffinity.git

# Verificar
git remote -v
```

#### **4. Testar conexão:**

```powershell
ssh -T git@github.com
# Deve retornar: "Hi Danilobrandaossa! You've successfully authenticated..."
```

---

### **OPÇÃO 2: Usar Personal Access Token (Mais Rápido)**

#### **1. Criar Token no GitHub:**

1. Acesse: https://github.com/settings/tokens/new
2. **Nome:** `Inffinity-Windows-Token`
3. **Expiração:** `90 days` (ou mais)
4. **Permissões:** Marque `repo` (tudo)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

#### **2. Usar Token no Push:**

Quando fizer `git push`, vai pedir:
- **Username:** `Danilobrandaossa`
- **Password:** `[COLE O TOKEN AQUI]`

---

## ✅ COMANDOS PARA EXECUTAR AGORA

### **1. LOCAL - Ver o que será commitado (escolha):**

#### **Opção A: Commitar apenas o schema.prisma:**
```powershell
# Adicionar apenas o schema
git add backend/prisma/schema.prisma

# Ver o que vai ser commitado
git status
```

#### **Opção B: Commitar tudo:**
```powershell
# Ver todas as alterações primeiro
git status

# Adicionar tudo
git add .

# Ou adicionar arquivo por arquivo se quiser
```

---

### **2. LOCAL - Commitar:**

```powershell
# Commitar apenas o schema
git commit -m "feat: adiciona campos de integração Mercado Pago nos models de pagamento"

# OU commitar tudo (se escolheu opção B)
git commit -m "feat: atualiza schema prisma e outras melhorias"
```

---

### **3. LOCAL - Configurar autenticação:**

#### **Se escolheu SSH:**
```powershell
# Já deve ter trocado o remote acima, agora só fazer push
git push origin main
```

#### **Se escolheu Token:**
```powershell
# Fazer push (vai pedir username e password - use o TOKEN)
git push origin main
# Username: Danilobrandaossa
# Password: [TOKEN COPIADO DO GITHUB]
```

---

### **4. SALVAR CREDENCIAIS (Opcional - para não digitar sempre):**

```powershell
# Configurar para salvar credenciais
git config --global credential.helper manager-core

# Agora quando fizer push, vai salvar e não pedir mais
git push origin main
```

---

## 🚨 RESOLVER PROBLEMA NO SERVIDOR

No servidor há arquivos modificados também:

```
modified:   backend/Dockerfile.prod
modified:   docker-compose.prod.yml
modified:   frontend/Dockerfile.prod
modified:   frontend/package.json
modified:   nginx/nginx.conf
```

### **Escolha uma opção:**

#### **A. Descartar alterações no servidor (manter igual ao repositório):**
```bash
# No servidor
cd /opt/embarcacoes
git restore backend/Dockerfile.prod docker-compose.prod.yml frontend/Dockerfile.prod frontend/package.json nginx/nginx.conf
```

#### **B. Commitar alterações do servidor também:**
```bash
# No servidor (precisa configurar Git lá também)
cd /opt/embarcacoes
git add .
git commit -m "feat: atualiza configurações Docker e nginx no servidor"
git push origin main
```

---

## 📋 CHECKLIST RÁPIDA

- [ ] Escolher: SSH ou Token?
- [ ] Configurar autenticação GitHub
- [ ] Escolher: commitar apenas schema ou tudo?
- [ ] Fazer commit localmente
- [ ] Fazer push
- [ ] Depois: atualizar servidor com `git pull`
- [ ] Depois: aplicar migrations no servidor

---

## 🎯 RECOMENDAÇÃO

**Para resolver AGORA e rápido:**

1. **Usar Token** (mais rápido que SSH)
2. **Commitar apenas o schema.prisma** primeiro
3. **Fazer push**
4. **Depois atualizar servidor**

**Comandos rápidos:**

```powershell
# 1. Adicionar apenas schema
git add backend/prisma/schema.prisma

# 2. Commitar
git commit -m "feat: adiciona campos de integração Mercado Pago nos models de pagamento"

# 3. Push (vai pedir token)
git push origin main
# Username: Danilobrandaossa
# Password: [SEU TOKEN DO GITHUB]
```

---

**Próximo passo:** Crie o token no GitHub e execute os comandos acima!

