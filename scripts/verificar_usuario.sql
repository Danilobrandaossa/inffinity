-- Script para verificar usuários no banco de dados

-- Ver todos os usuários e seus emails
SELECT 
    id, 
    email, 
    name, 
    "isActive", 
    CASE 
        WHEN password IS NULL THEN 'SEM SENHA'
        WHEN password = '' THEN 'SENHA VAZIA'
        ELSE 'TEM SENHA'
    END as senha_status,
    "createdAt",
    "lastLoginAt"
FROM users
ORDER BY "createdAt" DESC;

-- Verificar se há usuários com email específico (substituir o email)
-- SELECT * FROM users WHERE LOWER(email) = LOWER('seu-email@exemplo.com');

-- Verificar usuários inativos
-- SELECT id, email, name, "isActive" FROM users WHERE "isActive" = false;

-- Verificar usuários sem senha
-- SELECT id, email, name FROM users WHERE password IS NULL OR password = '';

