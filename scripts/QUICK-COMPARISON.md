# 🔍 Guia Rápido: Comparar Versões Local vs Servidor

## 📋 Comandos Rápidos para Comparar

### **Localmente (Windows PowerShell)**
```powershell
# Executar overview local
.\scripts\compare-versions.ps1

# Exportar para arquivo
.\scripts\compare-versions.ps1 | Out-File overview-local.txt
```

### **No Servidor (Linux/Bash)**
```bash
# Executar overview no servidor
./scripts/compare-versions.sh --server

# Ou exportar para arquivo
./scripts/compare-versions.sh --server > overview-server.txt
```

### **Via SSH (do seu PC)**
```bash
# Executar direto no servidor e ver resultado
ssh user@server './scripts/compare-versions.sh --server'

# Salvar resultado em arquivo local
ssh user@server './scripts/compare-versions.sh --server' > overview-server.txt
```

---

## 🎯 Comandos Específicos para Comparar

### **1. Comparar Git (Local vs Servidor)**

**Local:**
```bash
# Ver último commit local
git log -1 --oneline
git rev-parse HEAD
git branch --show-current
```

**Servidor:**
```bash
# Via SSH
ssh user@server 'cd /opt/embarcacoes && git log -1 --oneline'
ssh user@server 'cd /opt/embarcacoes && git rev-parse HEAD'
ssh user@server 'cd /opt/embarcacoes && git branch --show-current'
```

---

### **2. Comparar Versões de Pacotes**

**Local:**
```bash
# Backend
cat backend/package.json | grep '"version"'

# Frontend
cat frontend/package.json | grep '"version"'

# Verificar dependências instaladas
cd backend && npm list --depth=0 | head -20
```

**Servidor:**
```bash
# Via SSH ou dentro do container
ssh user@server 'cd /opt/embarcacoes/backend && cat package.json | grep version'

# Se usando Docker
docker-compose -f docker-compose.prod.yml exec backend cat package.json | grep version
```

---

### **3. Comparar Schema do Prisma**

**Local:**
```bash
# Hash do schema (para comparar)
md5sum backend/prisma/schema.prisma
# ou no Windows
certutil -hashfile backend\prisma\schema.prisma MD5

# Contar modelos
grep -c "^model " backend/prisma/schema.prisma
```

**Servidor:**
```bash
# Via SSH
ssh user@server 'md5sum /opt/embarcacoes/backend/prisma/schema.prisma'
ssh user@server 'grep -c "^model " /opt/embarcacoes/backend/prisma/schema.prisma'

# Se usando Docker
docker-compose -f docker-compose.prod.yml exec backend md5sum prisma/schema.prisma
```

---

### **4. Comparar Migrations Aplicadas**

**Local:**
```bash
# Ver migrations disponíveis
ls -la backend/prisma/migrations/

# Verificar status no banco local
cd backend
npx prisma migrate status
```

**Servidor:**
```bash
# Via SSH
ssh user@server 'ls -la /opt/embarcacoes/backend/prisma/migrations/'

# Verificar migrations aplicadas (Docker)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Ou via SSH
ssh user@server 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status'
```

---

### **5. Comparar Containers Docker**

**Servidor:**
```bash
# Ver containers rodando
docker-compose -f docker-compose.prod.yml ps

# Ver versões das imagens
docker-compose -f docker-compose.prod.yml images

# Ver logs recentes
docker-compose -f docker-compose.prod.yml logs --tail=50

# Verificar health
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health
```

---

### **6. Comparar Arquivos Importantes**

**Local:**
```bash
# Listar arquivos .env
ls -la backend/.env frontend/.env 2>/dev/null

# Verificar estrutura
tree -L 2 backend/src routes/
tree -L 2 frontend/src pages/
```

**Servidor:**
```bash
# Via SSH
ssh user@server 'ls -la /opt/embarcacoes/backend/.env /opt/embarcacoes/frontend/.env 2>/dev/null'
ssh user@server 'find /opt/embarcacoes/backend/src/routes -name "*.ts" | wc -l'
ssh user@server 'find /opt/embarcacoes/frontend/src/pages -name "*.tsx" | wc -l'
```

---

## 🔄 Script Automático de Comparação

Crie um script para comparar automaticamente:

**`scripts/diff-local-server.sh`:**
```bash
#!/bin/bash

# Executa overview local e no servidor e compara

echo "🔍 Comparando versões..."
echo ""

echo "📋 LOCAL:"
./scripts/compare-versions.sh > /tmp/local-overview.txt
cat /tmp/local-overview.txt

echo ""
echo "📋 SERVIDOR:"
ssh user@server './scripts/compare-versions.sh --server' > /tmp/server-overview.txt
cat /tmp/server-overview.txt

echo ""
echo "📊 Diferenças principais:"
echo ""
echo "Git Hash:"
echo "  Local:   $(git rev-parse HEAD | head -c 8)"
echo "  Servidor: $(ssh user@server 'cd /opt/embarcacoes && git rev-parse HEAD' | head -c 8)"
```

---

## 📊 Exportar e Comparar

### **Gerar Relatórios:**
```bash
# Local
./scripts/compare-versions.sh > overview-local-$(date +%Y%m%d).txt

# Servidor
ssh user@server './scripts/compare-versions.sh --server' > overview-server-$(date +%Y%m%d).txt

# Comparar arquivos
diff overview-local-*.txt overview-server-*.txt
```

---

## ✅ Checklist de Comparação

- [ ] **Git Commit Hash** - Mesmo commit?
- [ ] **Branch** - Mesma branch?
- [ ] **Versões dos pacotes** - Mesmas versões no package.json?
- [ ] **Schema Prisma** - Hash do schema é igual?
- [ ] **Migrations** - Todas as migrations do servidor estão no local?
- [ ] **Migrations aplicadas** - Servidor tem todas aplicadas?
- [ ] **Arquivos .env** - Configurações diferentes?
- [ ] **Estrutura de pastas** - Todos os arquivos presentes?
- [ ] **Containers Docker** - Servidor rodando versões corretas?

---

## 🚨 Problemas Comuns

### **Migrations desatualizadas no servidor:**
```bash
# No servidor
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### **Schema diferente:**
```bash
# Verificar diferenças
diff backend/prisma/schema.prisma <(ssh user@server 'cat /opt/embarcacoes/backend/prisma/schema.prisma')
```

### **Pacotes desatualizados:**
```bash
# Atualizar no servidor
docker-compose -f docker-compose.prod.yml exec backend npm install
docker-compose -f docker-compose.prod.yml restart backend
```

