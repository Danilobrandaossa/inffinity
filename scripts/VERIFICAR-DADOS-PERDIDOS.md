# 🔍 Verificar Dados Perdidos

## ⚠️ PROBLEMA:

Todos os dados cadastrados sumiram (embarcações, usuários, etc).

---

## ✅ VERIFICAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# Verificar se há dados no banco
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM users;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM vessels;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM bookings;"

# Ver todas as tabelas
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "\dt"

# Verificar volume do postgres
docker volume ls | grep postgres
docker volume inspect embarcacoes_postgres_data_prod

# Ver logs do postgres (pode mostrar se houve reset)
docker logs embarcacoes_db_prod --tail=50

# Verificar se houve migrations recentes
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

---

## 🎯 EXECUTAR:

```bash
cd /opt/embarcacoes
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM users;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM vessels;"
docker volume ls | grep postgres
```

