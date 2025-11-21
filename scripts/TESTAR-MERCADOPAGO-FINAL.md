# 🔧 Testar Instalação do Mercadopago (SOLUÇÃO FINAL)

## ✅ MUDANÇA FEITA:

O Dockerfile agora copia os `node_modules` do builder stage para o production stage, garantindo que o `mercadopago` (e todas as outras dependências) estejam disponíveis.

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild completo sem cache (forçar reconstrução de tudo)
docker compose -f docker-compose.prod.yml build --no-cache backend

# Recriar container
docker compose -f docker-compose.prod.yml up -d backend

# Aguardar iniciar completamente
sleep 30

# Verificar se mercadopago foi instalado (deve mostrar a versão)
docker exec embarcacoes_backend_prod npm list mercadopago 2>&1 | head -5

# Verificar logs (deve mostrar "Servidor rodando" e nenhum erro)
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find module 'mercadopago'" | head -15

# Verificar status
docker ps | grep embarcacoes_backend
```

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
sleep 30
docker exec embarcacoes_backend_prod npm list mercadopago 2>&1 | head -5
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error" | head -10
```

---

## ✅ RESULTADO ESPERADO:

- ✅ `npm list mercadopago` deve mostrar: `└── mercadopago@2.x.x`
- ✅ Logs devem mostrar: `🚀 Servidor rodando na porta 3001`
- ✅ Nenhum erro de `Cannot find module 'mercadopago'`
- ✅ Os dados devem aparecer no frontend (CORS corrigido)

