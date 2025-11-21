# ✅ Comandos Confirmados - Servidor

## 📍 Informações do Servidor

- **IP:** `145.223.93.235`
- **Usuário:** `root`
- **Caminho do Projeto:** `/opt/embarcacoes` ✅
- **Containers Docker:** `embarcacoes_frontend_prod`, `embarcacoes_backend_prod`, `embarcacoes_db_prod`

---

## 🚀 Comandos Prontos para Usar

### **1. Obter Overview Completo do Servidor**

#### Do seu PC (Windows PowerShell):
```powershell
# Executar e ver resultado
ssh root@145.223.93.235 'cd /opt/embarcacoes && ls -la'

# Ver overview (se o script existir)
ssh root@145.223.93.235 'cd /opt/embarcacoes && ./scripts/compare-versions.sh --server'
```

#### Direto no servidor (já conectado via SSH):
```bash
cd /opt/embarcacoes
ls -la
```

---

### **2. Ver Informações do Git**

```bash
# Do seu PC
ssh root@145.223.93.235 'cd /opt/embarcacoes && git log -1 --oneline'
ssh root@145.223.93.235 'cd /opt/embarcacoes && git branch --show-current'
ssh root@145.223.93.235 'cd /opt/embarcacoes && git rev-parse HEAD'

# No servidor (já conectado)
cd /opt/embarcacoes
git log -1 --oneline
git branch --show-current
git rev-parse HEAD
```

---

### **3. Ver Versões dos Pacotes**

```bash
# Do seu PC
ssh root@145.223.93.235 'cd /opt/embarcacoes/backend && grep version package.json'
ssh root@145.223.93.235 'cd /opt/embarcacoes/frontend && grep version package.json'

# No servidor
cd /opt/embarcacoes
cat backend/package.json | grep '"version"'
cat frontend/package.json | grep '"version"'
```

---

### **4. Ver Status dos Containers Docker**

```bash
# Do seu PC
ssh root@145.223.93.235 'docker ps | grep embarcacoes'

# No servidor (mais detalhado)
docker ps | grep embarcacoes
docker-compose -f /opt/embarcacoes/docker-compose.prod.yml ps
```

---

### **5. Ver Migrations Aplicadas**

```bash
# Do seu PC
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status'

# No servidor
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

---

### **6. Ver Logs dos Containers**

```bash
# Ver logs do backend
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml logs --tail=50 backend'

# Ver logs do frontend
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml logs --tail=50 frontend'

# Ver todos os logs
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml logs --tail=50'
```

---

### **7. Verificar Health do Backend**

```bash
# Do seu PC
ssh root@145.223.93.235 'cd /opt/embarcacoes && docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3001/health'

# Ou via curl externo (se porta estiver aberta)
curl http://145.223.93.235:3001/health
```

---

### **8. Comparar Schema Prisma**

```bash
# Hash do schema no servidor
ssh root@145.223.93.235 'md5sum /opt/embarcacoes/backend/prisma/schema.prisma'

# Ver número de modelos
ssh root@145.223.93.235 'grep -c "^model " /opt/embarcacoes/backend/prisma/schema.prisma'
```

---

### **9. Ver Estrutura de Arquivos**

```bash
# Contar rotas
ssh root@145.223.93.235 'find /opt/embarcacoes/backend/src/routes -name "*.ts" | wc -l'

# Contar controllers
ssh root@145.223.93.235 'find /opt/embarcacoes/backend/src/controllers -name "*.ts" | wc -l'

# Contar páginas frontend
ssh root@145.223.93.235 'find /opt/embarcacoes/frontend/src/pages -name "*.tsx" | wc -l'

# Listar estrutura principal
ssh root@145.223.93.235 'cd /opt/embarcacoes && tree -L 2 -d backend/src frontend/src 2>/dev/null || ls -la backend/src/ frontend/src/'
```

---

## 📊 Script Rápido: Overview Completo

Execute este comando completo para obter um overview:

```bash
ssh root@145.223.93.235 << 'EOF'
cd /opt/embarcacoes
echo "═══════════════════════════════════════════════════════"
echo "  📊 OVERVIEW DO SERVIDOR"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📍 Localização: $(pwd)"
echo ""
echo "🌿 Git:"
git log -1 --oneline 2>/dev/null || echo "  Não é repositório git"
git branch --show-current 2>/dev/null || echo ""
echo ""
echo "📦 Versões:"
echo "  Backend: $(grep '"version"' backend/package.json | head -1)"
echo "  Frontend: $(grep '"version"' frontend/package.json | head -1)"
echo ""
echo "🔄 Migrations:"
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status 2>/dev/null | head -10 || echo "  Erro ao verificar migrations"
echo ""
echo "🐳 Containers:"
docker ps | grep embarcacoes
echo ""
echo "📁 Estrutura:"
echo "  Rotas: $(find backend/src/routes -name "*.ts" 2>/dev/null | wc -l)"
echo "  Controllers: $(find backend/src/controllers -name "*.ts" 2>/dev/null | wc -l)"
echo "  Páginas: $(find frontend/src/pages -name "*.tsx" 2>/dev/null | wc -l)"
EOF
```

---

## 💾 Salvar Overview em Arquivo

```bash
# Salvar overview em arquivo local
ssh root@145.223.93.235 'cd /opt/embarcacoes && echo "Git: $(git log -1 --oneline)" && echo "Backend: $(grep version backend/package.json)" && echo "Frontend: $(grep version frontend/package.json)" && docker ps | grep embarcacoes' > overview-server-$(date +%Y%m%d).txt
```

---

## ✅ Checklist Rápido

Para comparar local vs servidor, verifique:

- [ ] Git commit hash
- [ ] Versão do backend no package.json
- [ ] Versão do frontend no package.json
- [ ] Hash do schema Prisma
- [ ] Migrations aplicadas
- [ ] Containers rodando

