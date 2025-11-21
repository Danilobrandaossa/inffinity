#!/bin/bash
# Script para remover constraint única de bookings

docker compose -f docker-compose.prod.yml exec -T postgres psql -U embarcacoes -d embarcacoes_db <<'SQL'
-- Remover constraint única que bloqueia reservas canceladas
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_vesselId_bookingDate_key";

-- Criar índice composto para busca eficiente
CREATE INDEX IF NOT EXISTS "bookings_vesselId_bookingDate_status_idx" ON "bookings"("vesselId", "bookingDate", "status");

-- Verificar se foi removida (deve retornar vazio ou só índices)
SELECT conname FROM pg_constraint WHERE conrelid = 'bookings'::regclass AND conname LIKE '%bookingDate%';
SQL

