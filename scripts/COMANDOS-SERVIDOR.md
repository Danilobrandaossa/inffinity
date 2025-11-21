# 🚀 Comandos Prontos para o Servidor

## 📋 Configurações do Servidor

- **IP:** `145.223.93.235`
- **Usuário:** `root`
- **Caminho:** `/opt/embarcacoes`

---

## 🎯 Comandos Rápidos

### **1. Obter Overview Completo do Servidor**

#### Windows PowerShell:
```powershell
# Executar e ver resultado
.\scripts\get-server-overview.ps1

# Executar e salvar em arquivo
.\scripts\get-server-overview.ps1 -Save
```

#### Linux/Mac:
```bash
# Executar e ver resultado
./scripts/get-server-overview.sh

# Executar e salvar em arquivo
./scripts/get-server-overview.sh --save
```

#### SSH Direto:
```bash
# Executar overview no servidor
ssh root@145.223.93.235 'cd /opt/embarcacoes && ./scripts/compare-versions.sh --server'

# Salvar resultado em arquivo local
ssh root@145.223.93.235 'cd /opt/embarcacoes && ./scripts/compare-versions.sh --server' > overview-server.txt
```

---

## 📊 Comandos Específicos

### **2. Comparar Git (Local vs Servidor)**

#### Local:
```bash
git log -1 --oneline
git rev-parse HEAD
git branch --show-current
```

#### Servidor:
```bash
ssh root@145.223.93.235 'cd /opt/embarcacoes && git log -1 --oneline'
ssh root@145.223.93.235 'cd /opt/embarcacoes && git rev-parse HEAD'
ssh root@145.223.93.235 'cd /opt/embarcacoes && git branch --show-current'
```

---

### **3. Comparar Versões dos Pacotes**

#### Local:
```bash
cat backend/package.json | grep '"version"'
cat frontend/package.json | grep '"version"'
```

#### Servidor:
```bash
ssh root@145.223.93.235 'cd /opt/embarcacoes/backend && grep version package.json'
ssh root@145.223.93.235 'cd /opt/embarcacoes/frontend && grep version package.json'
```

---

### **4. Ver Migrations Aplicadas no Servidor**

```bash
# Ver status das migrations
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status'

# Listar migrations disponíveis
ssh root@145.223.93.235 'ls -la /opt/embarcacoes/backend/prisma/migrations/'
```

---

### **5. Comparar Schema Prisma**

#### Local (Windows):
```powershell
certutil -hashfile backend\prisma\schema.prisma MD5
```

#### Servidor:
```bash
ssh root@145.223.93.235 'md5sum /opt/embarcacoes/backend/prisma/schema.prisma'
```

---

### **6. Ver Status dos Containers**

```bash
# Ver containers rodando
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml ps'

# Ver logs recentes
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml logs --tail=50'

# Verificar health do backend
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health'
```

---

### **7. Ver Estrutura de Arquivos no Servidor**

```bash
# Contar rotas
ssh root@145.223.93.235 'find /opt/embarcacoes/backend/src/routes -name "*.ts" | wc -l'

# Contar controllers
ssh root@145.223.93.235 'find /opt/embarcacoes/backend/src/controllers -name "*.ts" | wc -l'

# Contar páginas frontend
ssh root@145.223.93.235 'find /opt/embarcacoes/frontend/src/pages -name "*.tsx" | wc -l'
```

---

## 🔄 Enviar Script para o Servidor

Se o script `compare-versions.sh` não estiver no servidor:

```bash
# Enviar o script
scp scripts/compare-versions.sh root@145.223.93.235:/opt/embarcacoes/scripts/

# Dar permissão de execução
ssh root@145.223.93.235 'chmod +x /opt/embarcacoes/scripts/compare-versions.sh'
```

---

## 📝 Scripts Úteis

### **Comparar Tudo de Uma Vez**

Crie um arquivo `compare-all.sh`:

```bash
#!/bin/bash

echo "🔍 Comparando Local vs Servidor"
echo "================================"
echo ""

echo "📋 GIT:"
echo "Local:"
git log -1 --oneline
echo "Servidor:"
ssh root@145.223.93.235 'cd /opt/embarcacoes && git log -1 --oneline'
echo ""

echo "📦 VERSÕES:"
echo "Local Backend:"
cat backend/package.json | grep '"version"'
echo "Servidor Backend:"
ssh root@145.223.93.235 'cd /opt/embarcacoes/backend && grep version package.json'
echo ""

echo "💾 SCHEMA PRISMA:"
echo "Local:"
certutil -hashfile backend\prisma\schema.prisma MD5 2>/dev/null || md5sum backend/prisma/schema.prisma
echo "Servidor:"
ssh root@145.223.93.235 'md5sum /opt/embarcacoes/backend/prisma/schema.prisma'
echo ""

echo "🔄 MIGRATIONS:"
echo "Servidor:"
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status'
```

---

## ✅ Checklist de Comparação

Antes de fazer ajustes, compare:

- [ ] **Git Commit Hash** - Mesmo commit?
- [ ] **Git Branch** - Mesma branch?
- [ ] **Versões dos pacotes** - package.json igual?
- [ ] **Schema Prisma** - Hash MD5 igual?
- [ ] **Migrations** - Todas aplicadas no servidor?
- [ ] **Containers Docker** - Todos rodando?
- [ ] **Estrutura de pastas** - Arquivos presentes?

---

## 🚨 Comandos de Troubleshooting

### **Se não conseguir conectar via SSH:**
```bash
# Testar conexão
ssh -v root@145.223.93.235

# Verificar se a porta SSH está aberta
telnet 145.223.93.235 22
```

### **Se o script não existir no servidor:**
```bash
# Criar diretório de scripts
ssh root@145.223.93.235 'mkdir -p /opt/embarcacoes/scripts'

# Enviar script
scp scripts/compare-versions.sh root@145.223.93.235:/opt/embarcacoes/scripts/

# Dar permissão
ssh root@145.223.93.235 'chmod +x /opt/embarcacoes/scripts/compare-versions.sh'
```

### **Se Docker não estiver rodando:**
```bash
# Verificar status do Docker no servidor
ssh root@145.223.93.235 'systemctl status docker'

# Iniciar containers
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml up -d'
```

