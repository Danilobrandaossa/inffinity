-- Script completo para remover TODOS os índices únicos relacionados a vesselId e bookingDate
-- Execute este script no banco PostgreSQL

-- 1. Listar TODOS os índices únicos da tabela bookings
SELECT
    i.relname AS index_name,
    string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns,
    ix.indisunique AS is_unique,
    pg_get_indexdef(ix.indexrelid) AS index_definition
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'bookings'
  AND ix.indisunique = true
GROUP BY i.relname, ix.indisunique, ix.indexrelid
ORDER BY i.relname;

-- 2. Remover TODOS os índices únicos que envolvem vesselId e bookingDate
-- (Execute cada um separadamente se necessário)

-- Remover por nome conhecido
DROP INDEX IF EXISTS "bookings_vesselId_bookingDate_key";
DROP INDEX IF EXISTS "bookings_vesselid_bookingdate_key";
DROP INDEX IF EXISTS bookings_vesselId_bookingDate_key;
DROP INDEX IF EXISTS bookings_vesselid_bookingdate_key;

-- 3. Verificar constraints únicas novamente
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND contype = 'u';

-- 4. Se ainda houver constraint única, remover pelo nome exato retornado acima
-- ALTER TABLE bookings DROP CONSTRAINT [NOME_EXATO];

-- 5. Criar índice composto (não único) para busca eficiente
CREATE INDEX IF NOT EXISTS "bookings_vesselId_bookingDate_status_idx" 
ON "bookings"("vesselId", "bookingDate", "status");

-- 6. Verificar resultado final (deve mostrar apenas índices não únicos)
SELECT
    i.relname AS index_name,
    string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns,
    ix.indisunique AS is_unique
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'bookings'
  AND (a.attname = 'vesselId' OR a.attname = 'bookingDate')
GROUP BY i.relname, ix.indisunique
ORDER BY i.relname;

