# 🔧 Atualizar Arquivos do Mercado Pago no Servidor

## ✅ PROBLEMA RESOLVIDO:

Os arquivos do Mercado Pago não estavam sendo commitados no Git:
- ✅ `backend/src/routes/mercado-pago.routes.ts` - ADICIONADO
- ✅ `backend/src/controllers/mercado-pago.controller.ts` - ADICIONADO  
- ✅ `backend/src/services/mercado-pago.service.ts` - ADICIONADO

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código (agora vai ter os arquivos do Mercado Pago)
git pull origin main

# Rebuild do backend (incluir os novos arquivos)
docker compose -f docker-compose.prod.yml up -d --build backend

# Aguardar iniciar completamente
sleep 20

# Verificar se iniciou sem erros
docker logs embarcacoes_backend_prod --tail=30 | grep -i "error\|rodando" | head -10

# Verificar se não há mais erro de "Cannot find module"
docker logs embarcacoes_backend_prod --tail=50 | grep -i "cannot find\|module not found" || echo "✅ Nenhum erro de módulo encontrado!"
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build backend
sleep 20
docker logs embarcacoes_backend_prod --tail=30 | grep -E "error|Servidor rodando|Cannot find" | head -10
```

