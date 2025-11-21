# 🔧 Atualizar Servidor com Repositório Correto

## ⚠️ PROBLEMA:

Repositório Git está apontando para `pj-nautica` ao invés de `inffinity`.

---

## ✅ CORRIGIR E ATUALIZAR:

```bash
cd /opt/embarcacoes

# Verificar repositório atual
git remote -v

# Mudar para o repositório correto
git remote set-url origin https://github.com/Danilobrandaossa/inffinity.git

# Verificar se mudou
git remote -v

# Atualizar código do repositório correto
git pull origin main

# Rebuild do frontend (aplicar mudanças)
docker-compose -f docker-compose.prod.yml up -d --build frontend

# Reiniciar nginx (aplicar mudanças)
docker-compose -f docker-compose.prod.yml restart nginx

# Verificar se atualizou
git log -1 --oneline
grep -c "useState.*filters" frontend/src/pages/DashboardPage.tsx
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
git remote set-url origin https://github.com/Danilobrandaossa/inffinity.git
git remote -v
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build frontend
docker-compose -f docker-compose.prod.yml restart nginx
git log -1 --oneline
```

