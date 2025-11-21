# 🔧 Rebuild Frontend Sem Cache

## ✅ STATUS:

- ✅ Código completo no servidor
- ⚠️ Frontend unhealthy (pode precisar rebuild sem cache)

---

## ✅ REBUILD SEM CACHE:

```bash
cd /opt/embarcacoes

# Rebuild completo do frontend (sem cache)
docker compose -f docker-compose.prod.yml build --no-cache frontend

# Recriar container frontend
docker compose -f docker-compose.prod.yml up -d frontend

# Aguardar iniciar
sleep 10

# Verificar logs
docker logs embarcacoes_frontend_prod --tail=30

# Verificar status
docker ps | grep embarcacoes_frontend
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
sleep 10
docker ps | grep embarcacoes_frontend
```

