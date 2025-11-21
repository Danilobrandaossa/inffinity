# 🔧 Remover Container Frontend Antigo

## ✅ BUILD FUNCIONOU!

A imagem do frontend foi buildada com sucesso, mas o docker-compose não consegue recriar o container antigo.

---

## ✅ SOLUÇÃO: Remover Container Antigo

```bash
cd /opt/embarcacoes

# Ver ID do container antigo
docker ps -a | grep embarcacoes_frontend_prod

# Remover container antigo
docker rm -f embarcacoes_frontend_prod

# Criar novo container (agora vai funcionar)
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker ps -a | grep embarcacoes_frontend_prod
docker rm -f embarcacoes_frontend_prod
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
sleep 10
docker logs embarcacoes_frontend_prod --tail=30
```

