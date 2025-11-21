# 🔧 Criar Frontend Diretamente (Contornar Bug Docker Compose)

## ⚠️ PROBLEMA:

O docker-compose está tentando recriar container antigo com ID `4ea72f23b60a`.

---

## ✅ SOLUÇÃO: Remover Container Antigo e Criar Novo

```bash
cd /opt/embarcacoes

# Remover container antigo específico
docker rm -f 4ea72f23b60a

# OU remover qualquer container do frontend
docker ps -a | grep embarcacoes_frontend | awk '{print $1}' | xargs docker rm -f

# Criar usando docker diretamente
docker run -d \
  --name embarcacoes_frontend_prod \
  --network embarcacoes_network_prod \
  -p 80:80 \
  embarcacoes_frontend
```

---

## ✅ OU: Parar e Recriar Todos os Serviços

```bash
cd /opt/embarcacoes

# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Subir novamente
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker rm -f 4ea72f23b60a
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

OU

```bash
cd /opt/embarcacoes
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

