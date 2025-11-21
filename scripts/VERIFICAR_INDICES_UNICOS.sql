-- Verificar TODOS os índices únicos na tabela bookings
-- Incluindo índices únicos que funcionam como constraints

-- 1. Verificar constraints únicas
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND contype IN ('u', 'p'); -- u = unique, p = primary key

-- 2. Verificar índices únicos (que também funcionam como constraints)
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'bookings'
  AND indexdef LIKE '%UNIQUE%';

-- 3. Verificar índices diretamente na tabela
SELECT
    i.relname AS index_name,
    a.attname AS column_name,
    am.amname AS index_type
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_am am ON i.relam = am.oid
LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'bookings'
  AND ix.indisunique = true
ORDER BY i.relname;

