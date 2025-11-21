# ✅ Atualizar Servidor Sem Mercado Pago

## ✅ O QUE FOI REMOVIDO:

- ❌ `backend/src/routes/mercado-pago.routes.ts` - DELETADO
- ❌ `backend/src/controllers/mercado-pago.controller.ts` - DELETADO  
- ❌ `backend/src/services/mercado-pago.service.ts` - DELETADO
- ❌ `backend/package.json` - removido pacote `mercadopago`
- ❌ `backend/src/server.ts` - removida rota `/api/mercado-pago`
- ❌ `backend/src/config/index.ts` - removida config `mercadoPago`
- ❌ `backend/src/services/subscription.service.ts` - desabilitadas funcionalidades
- ❌ `backend/src/jobs/subscription-billing.job.ts` - removida verificação

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild do backend (sem Mercado Pago agora)
docker compose -f docker-compose.prod.yml up -d --build backend

# Aguardar iniciar
sleep 25

# Verificar logs (deve mostrar "Servidor rodando" sem erros)
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15

# Verificar status
docker ps | grep embarcacoes_backend
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build backend
sleep 25
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error" | head -10
```

---

## ✅ RESULTADO ESPERADO:

- ✅ Logs devem mostrar: `🚀 Servidor rodando na porta 3001`
- ✅ **Nenhum erro** de `Cannot find module 'mercadopago'`
- ✅ Backend inicia corretamente
- ✅ Os dados devem aparecer no frontend (CORS corrigido)

