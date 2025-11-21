# Verificar se a constraint única foi removida

Execute no servidor para verificar:

```bash
# Conectar ao banco PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U embarcacoes -d embarcacoes_db

# Verificar constraints da tabela bookings
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
    AND conname LIKE '%bookingDate%';

# Sair
\q
```

Se mostrar uma constraint `bookings_vesselId_bookingDate_key`, ela precisa ser removida manualmente.

