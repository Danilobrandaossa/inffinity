# 🔧 Testar Instalação do Mercadopago

## ✅ MUDANÇA FEITA:

Adicionado `--legacy-peer-deps` ao `npm ci` no Dockerfile para forçar instalação correta de todas as dependências.

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código
git pull origin main

# Rebuild completo sem cache (forçar reinstalação de tudo)
docker compose -f docker-compose.prod.yml build --no-cache backend

# Recriar container
docker compose -f docker-compose.prod.yml up -d backend

# Aguardar iniciar
sleep 30

# Verificar se mercadopago foi instalado (deve listar o pacote)
docker exec embarcacoes_backend_prod npm list mercadopago 2>&1 | head -5

# Verificar logs (deve mostrar "Servidor rodando" e nenhum erro de mercadopago)
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find module 'mercadopago'" | head -15
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

