-- Script SQL para aplicar campos do Mercado Pago
-- Execute este script no PostgreSQL

-- PRIMEIRO: Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- As tabelas no Prisma são mapeadas assim:
-- installments (model Installment)
-- marina_payments (model MarinaPayment)  
-- ad_hoc_charges (model AdHocCharge)

-- Adicionar campos na tabela installments (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'installments') THEN
        ALTER TABLE installments 
        ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPaymentId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPreferenceId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerStatus" TEXT,
        ADD COLUMN IF NOT EXISTS "providerInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerSandboxInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerMetadata" JSONB;

        CREATE INDEX IF NOT EXISTS "installments_providerPaymentId_idx" ON installments("providerPaymentId");
        CREATE INDEX IF NOT EXISTS "installments_providerPreferenceId_idx" ON installments("providerPreferenceId");
        
        RAISE NOTICE 'Campos adicionados na tabela installments';
    ELSE
        RAISE NOTICE 'Tabela installments não existe';
    END IF;
END $$;

-- Adicionar campos na tabela marina_payments (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marina_payments') THEN
        ALTER TABLE marina_payments 
        ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPaymentId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPreferenceId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerStatus" TEXT,
        ADD COLUMN IF NOT EXISTS "providerInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerSandboxInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerMetadata" JSONB;

        CREATE INDEX IF NOT EXISTS "marina_payments_providerPaymentId_idx" ON marina_payments("providerPaymentId");
        CREATE INDEX IF NOT EXISTS "marina_payments_providerPreferenceId_idx" ON marina_payments("providerPreferenceId");
        
        RAISE NOTICE 'Campos adicionados na tabela marina_payments';
    ELSE
        RAISE NOTICE 'Tabela marina_payments não existe';
    END IF;
END $$;

-- Adicionar campos na tabela ad_hoc_charges (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ad_hoc_charges') THEN
        ALTER TABLE ad_hoc_charges 
        ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPaymentId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerPreferenceId" TEXT,
        ADD COLUMN IF NOT EXISTS "providerStatus" TEXT,
        ADD COLUMN IF NOT EXISTS "providerInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerSandboxInitPoint" TEXT,
        ADD COLUMN IF NOT EXISTS "providerMetadata" JSONB;

        CREATE INDEX IF NOT EXISTS "ad_hoc_charges_providerPaymentId_idx" ON ad_hoc_charges("providerPaymentId");
        CREATE INDEX IF NOT EXISTS "ad_hoc_charges_providerPreferenceId_idx" ON ad_hoc_charges("providerPreferenceId");
        
        RAISE NOTICE 'Campos adicionados na tabela ad_hoc_charges';
    ELSE
        RAISE NOTICE 'Tabela ad_hoc_charges não existe';
    END IF;
END $$;

