# ✅ Atualizar Servidor - Referência Corrigida

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

# 3. Aguardar iniciar completamente
sleep 25

# 4. Verificar logs (deve mostrar "Servidor rodando" sem erros)
docker logs embarcacoes_backend_prod --tail=50 | grep -E "Servidor rodando|error|Error|Cannot find" | head -15

# 5. Verificar dados no banco (usar nomes corretos - minúsculas)
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

## 📋 IMPORTANTE - VERIFICAR BANCO DE DADOS:

Se as tabelas não existirem ou der erro, pode ser que o schema não tenha sido aplicado:

```bash
# Ver todas as tabelas existentes
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db -c "\dt"

# Se não houver tabelas, aplicar schema do Prisma
docker compose -f docker-compose.prod.yml exec backend npx prisma db push
```

---

## ✅ RESULTADO ESPERADO:

- ✅ Logs devem mostrar: `🚀 Servidor rodando na porta 3001`
- ✅ **Nenhum erro** de `Cannot find module './mercado-pago.service'`
- ✅ Backend inicia corretamente
- ✅ Dados aparecem no dashboard (se existirem no banco)

