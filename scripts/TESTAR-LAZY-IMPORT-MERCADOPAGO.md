# 🔧 Testar Lazy Import do Mercadopago

## ✅ MUDANÇA FEITA:

O serviço `mercado-pago.service.ts` agora faz um **import lazy** do módulo `mercadopago`, carregando-o apenas quando necessário. Isso permite que o backend inicie mesmo se o pacote não estiver instalado (desde que o serviço não esteja habilitado).

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild do backend (agora deve iniciar sem erro de mercadopago)
docker compose -f docker-compose.prod.yml up -d --build backend

# Aguardar iniciar
sleep 25

# Verificar logs (deve mostrar "Servidor rodando" sem erro de Cannot find module)
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find module 'mercadopago'" | head -15

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
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error|Cannot find" | head -10
```

---

## ✅ RESULTADO ESPERADO:

- ✅ Logs devem mostrar: `🚀 Servidor rodando na porta 3001`
- ✅ Nenhum erro de `Cannot find module 'mercadopago'`
- ✅ Backend inicia corretamente
- ✅ Os dados devem aparecer no frontend (CORS corrigido)

**Nota:** Se o serviço do Mercado Pago estiver habilitado (via variável de ambiente), o módulo precisa estar instalado. Mas se estiver desabilitado (padrão), o backend deve iniciar normalmente mesmo sem o pacote.

