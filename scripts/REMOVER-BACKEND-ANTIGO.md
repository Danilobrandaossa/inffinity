# 🔧 Remover Container Backend Antigo

## ✅ BUILD FUNCIONOU!

A imagem foi buildada com sucesso, mas o docker-compose não consegue recriar o container antigo.

---

## ✅ SOLUÇÃO: Remover Container Antigo

```bash
cd /opt/embarcacoes

# Ver ID do container antigo
docker ps -a | grep embarcacoes_backend_prod

# Remover container antigo
docker rm -f embarcacoes_backend_prod

# Criar novo container (agora vai funcionar)
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker rm -f embarcacoes_backend_prod
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 30
docker logs embarcacoes_backend_prod --tail=30
```

