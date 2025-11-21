-- Script para remover a constraint única que impede reservar datas de reservas canceladas
-- Execute este script diretamente no banco PostgreSQL

-- 1. Remover a constraint única se existir
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_vesselId_bookingDate_key";

-- 2. Criar índice composto para manter busca eficiente
CREATE INDEX IF NOT EXISTS "bookings_vesselId_bookingDate_status_idx" ON "bookings"("vesselId", "bookingDate", "status");

-- 3. Verificar se foi removida
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
    AND (conname LIKE '%bookingDate%' OR conname LIKE '%vesselId%');

