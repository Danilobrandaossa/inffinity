-- Script para normalizar todos os emails no banco de dados para lowercase
-- Execute este script se os emails foram criados com maiúsculas/minúsculas misturadas

-- Verificar emails antes de normalizar
SELECT id, email, name, "isActive" FROM users ORDER BY email;

-- Normalizar todos os emails para lowercase
UPDATE users 
SET email = LOWER(TRIM(email))
WHERE email != LOWER(TRIM(email));

-- Verificar emails após normalizar
SELECT id, email, name, "isActive" FROM users ORDER BY email;

-- Verificar se há emails duplicados após normalização
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

