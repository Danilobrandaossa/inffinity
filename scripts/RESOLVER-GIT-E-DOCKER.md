# 🔧 Resolver Git e Docker

## ⚠️ PROBLEMAS:

1. Git tem branches divergentes
2. `docker-compose` não encontrado (pode ser `docker compose`)

---

## ✅ RESOLVER GIT:

```bash
cd /opt/embarcacoes

# Forçar reset para o repositório remoto (descartar mudanças locais)
git fetch origin
git reset --hard origin/main

# OU fazer merge forçado
git pull origin main --no-rebase
```

---

## ✅ VERIFICAR DOCKER:

```bash
# Ver qual comando Docker está disponível
which docker-compose
which docker
docker compose version
docker-compose --version
```

---

## ✅ ATUALIZAR E REBUILD:

```bash
cd /opt/embarcacoes

# Forçar atualização do Git
git fetch origin
git reset --hard origin/main

# Verificar se atualizou
git log -1 --oneline

# Rebuild do frontend (tentar ambos os comandos)
docker compose -f docker-compose.prod.yml up -d --build frontend
# OU
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
git fetch origin
git reset --hard origin/main
git log -1 --oneline
docker compose version
```

