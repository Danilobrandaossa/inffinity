-- Criar usuários de demonstração
INSERT INTO users (id, email, name, password, role, "updatedAt") VALUES 
('admin-001', 'admin@reservapro.com', 'Administrador Sistema', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz', 'ADMIN', NOW()) 
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, name, password, role, "updatedAt") VALUES 
('user-001', 'cliente@reservapro.com', 'Cliente Demo', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz', 'USER', NOW()) 
ON CONFLICT (email) DO NOTHING;








