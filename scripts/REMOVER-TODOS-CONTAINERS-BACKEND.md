# 🔧 Remover Todos Containers Antigos do Backend

## ⚠️ PROBLEMA:

O docker-compose está tentando recriar container antigo com ID diferente (`6330d79011df`).

---

## ✅ SOLUÇÃO: Remover todos os containers antigos

```bash
cd /opt/embarcacoes

# Ver todos os containers do backend (rodando e parados)
docker ps -a | grep backend

# Remover TODOS os containers antigos do backend
docker rm -f 6330d79011df 2>/dev/null || echo "Container já removido"

# OU remover qualquer container com embarcacoes_backend no nome
docker ps -a | grep embarcacoes_backend | awk '{print $1}' | xargs docker rm -f

# Agora criar novo container
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

---

## ✅ OU: Usar docker diretamente (contornar docker-compose)

```bash
cd /opt/embarcacoes

# Criar container usando docker diretamente
docker run -d \
  --name embarcacoes_backend_prod \
  --network embarcacoes_network_prod \
  --env-file .env \
  -e DATABASE_URL=postgresql://embarcacoes:Embarcacoes2024%21%40%23@postgres:5432/embarcacoes_db?schema=public \
  embarcacoes_backend \
  sh -c "npx prisma migrate deploy && npm run dev"
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker ps -a | grep backend
docker rm -f 6330d79011df 2>/dev/null
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

