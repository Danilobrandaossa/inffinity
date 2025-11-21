# 🔧 Atualizar package-lock.json no Servidor

## ✅ PROBLEMA RESOLVIDO:

O `package-lock.json` foi atualizado para incluir corretamente o pacote `mercadopago`.

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Atualizar código (agora vai ter o package-lock.json atualizado)
git pull origin main

# Rebuild do backend (instalar mercadopago corretamente)
docker compose -f docker-compose.prod.yml up -d --build backend

# Aguardar iniciar completamente
sleep 25

# Verificar se iniciou sem erros
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15

# Verificar se não há mais erro de "Cannot find module 'mercadopago'"
docker logs embarcacoes_backend_prod --tail=50 | grep -i "cannot find module 'mercadopago'" || echo "✅ Nenhum erro de mercadopago encontrado!"
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

