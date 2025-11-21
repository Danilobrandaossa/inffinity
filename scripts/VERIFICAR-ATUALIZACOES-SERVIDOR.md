# ✅ Verificar se Atualizações Estão no Servidor

## ⚠️ OBSERVAÇÃO:

O servidor atual tem Git remoto apontando para `pj-nautica` ao invés de `inffinity`.

---

## 🔍 VERIFICAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Ver repositório Git
git remote -v

# Ver último commit
git log -1 --oneline

# Verificar se arquivo do Dashboard tem os filtros
grep -A 5 "useState" frontend/src/pages/DashboardPage.tsx

# Verificar se usePWA foi corrigido
grep -A 2 "import.meta.env" frontend/src/hooks/usePWA.ts

# Verificar porta do frontend no nginx
grep -A 2 "upstream frontend" nginx/nginx.conf
```

---

## ✅ SE NÃO ESTIVER ATUALIZADO:

```bash
cd /opt/embarcacoes

# Mudar repositório remoto para o correto
git remote set-url origin https://github.com/Danilobrandaossa/inffinity.git

# OU se usar SSH:
# git remote set-url origin git@github.com:Danilobrandaossa/inffinity.git

# Atualizar código
git pull origin main

# Rebuild do frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend

# Reiniciar nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

