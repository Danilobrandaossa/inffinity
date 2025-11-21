# ✅ Corrigir Referência ao Mercado Pago

## ✅ PROBLEMA RESOLVIDO:

Removida referência ao `mercado-pago.service` no `subscription-plan.service.ts`.

---

## ✅ EXECUTAR NO SERVIDOR:

```bash
cd /opt/embarcacoes

# 1. Atualizar código
git pull origin main

# 2. Rebuild do backend
docker compose -f docker-compose.prod.yml up -d --build backend

# 3. Aguardar iniciar
sleep 25

# 4. Verificar logs (deve mostrar "Servidor rodando" sem erros)
docker logs embarcacoes_backend_prod --tail=30 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15

# 5. Verificar dados no banco (usar nomes corretos das tabelas - minúsculas)
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"user\";"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"vessel\";"
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "SELECT COUNT(*) FROM \"booking\";"

# 6. Ver todas as tabelas existentes
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "\dt"
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

---

## 📋 VERIFICAR DADOS NO BANCO:

Se as tabelas não existirem, pode ser que o schema não tenha sido aplicado. Verifique:

```bash
# Ver todas as tabelas
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "\dt"

# Se não houver tabelas, aplicar schema
docker compose -f docker-compose.prod.yml exec backend npx prisma db push
```

