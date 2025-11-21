# ✅ Verificar Dados com Nomes Corretos das Tabelas

## ✅ TABELAS EXISTENTES:

As tabelas no banco são:
- `users` (não `user`)
- `vessels` (não `vessel`)
- `bookings` (não `booking`)

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# 1. Verificar logs do backend (deve mostrar "Servidor rodando")
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error" | head -15

# 2. Verificar dados usando nomes CORRETOS das tabelas
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM users;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM vessels;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM bookings;"

# 3. Ver alguns dados de exemplo
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT id, name, email FROM users LIMIT 5;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT id, name FROM vessels LIMIT 5;"
```

---

## ⚠️ IMPORTANTE:

**NÃO execute `npx prisma db push` agora!** Ele está avisando sobre perda de dados. As tabelas já existem e têm dados. O backend deve funcionar com as tabelas existentes.

---

## 🎯 EXECUTAR AGORA:

```bash
cd /opt/embarcacoes

# Verificar logs do backend
docker logs embarcacoes_backend_prod --tail=30

# Verificar dados com nomes corretos
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM users;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM vessels;"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM bookings;"
```

