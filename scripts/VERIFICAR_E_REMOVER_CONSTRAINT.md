# Script para verificar e remover constraint única de bookings

Execute no servidor:

```bash
cd /opt/embarcacoes

# 1. Verificar todas as constraints da tabela bookings
docker compose -f docker-compose.prod.yml exec -T postgres psql -U embarcacoes -d embarcacoes_db -c "
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass;
"

# 2. Remover constraint única (pode ter nome diferente)
docker compose -f docker-compose.prod.yml exec -T postgres psql -U embarcacoes -d embarcacoes_db <<'SQL'
-- Tentar remover com diferentes nomes possíveis
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_vesselId_bookingDate_key;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_vesselid_bookingdate_key;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_vesselId_bookingDate_uk;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_vesselid_bookingdate_uk;

-- Listar todas as constraints únicas da tabela
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'bookings'::regclass 
  AND contype = 'u';
SQL

# 3. Se ainda existir, remover manualmente identificando pelo nome exato
# (Execute o SELECT acima primeiro para ver o nome exato da constraint)
# Depois execute:
# docker compose -f docker-compose.prod.yml exec -T postgres psql -U embarcacoes -d embarcacoes_db -c "ALTER TABLE bookings DROP CONSTRAINT [NOME_EXATO_AQUI];"
```

