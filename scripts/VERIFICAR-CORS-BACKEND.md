# 🔧 Verificar CORS no Backend

## ✅ STATUS:

- ✅ FRONTEND_URL configurado: `https://app.infinitynautica.com.br`
- ⚠️ Backend pode não estar lendo a variável

---

## ✅ VERIFICAR E CORRIGIR:

```bash
cd /opt/embarcacoes

# Ver variável dentro do container backend
docker exec embarcacoes_backend_prod env | grep FRONTEND_URL
docker exec embarcacoes_backend_prod env | grep CORS_ORIGIN

# Ver logs do backend (pode mostrar qual origin está sendo bloqueado)
docker logs embarcacoes_backend_prod --tail=50 | grep -i "CORS blocked\|allowedOrigins"

# Reiniciar backend para garantir que leu as variáveis
docker compose -f docker-compose.prod.yml restart backend

# Aguardar iniciar
sleep 10

# Verificar logs novamente
docker logs embarcacoes_backend_prod --tail=30
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker exec embarcacoes_backend_prod env | grep FRONTEND_URL
docker compose -f docker-compose.prod.yml restart backend
sleep 10
docker logs embarcacoes_backend_prod --tail=30
```

