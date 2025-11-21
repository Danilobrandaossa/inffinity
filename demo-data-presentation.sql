-- Dados de demonstração para apresentação ao cliente
-- Sistema de Embarcações ReservaPro

-- Inserir usuário ADMIN
INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at) VALUES
('admin-001', 'admin@reservapro.com', 'Administrador Sistema', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário CLIENTE
INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at) VALUES
('user-001', 'cliente@reservapro.com', 'Cliente Demo', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKzKz', 'USER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Inserir embarcações de demonstração
INSERT INTO vessels (id, name, description, capacity, price_per_hour, is_active, created_at, updated_at) VALUES
('vessel-001', 'Lancha Azul', 'Lancha para passeios na baía', 8, 150.00, true, NOW(), NOW()),
('vessel-002', 'Iate Luxo', 'Iate de luxo para eventos especiais', 12, 300.00, true, NOW(), NOW()),
('vessel-003', 'Barco Pesca', 'Barco equipado para pesca esportiva', 6, 200.00, true, NOW(), NOW()),
('vessel-004', 'Catamarã', 'Catamarã para grupos grandes', 20, 400.00, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir reservas de demonstração
INSERT INTO bookings (id, user_id, vessel_id, start_date, end_date, total_price, status, created_at, updated_at) VALUES
('booking-001', 'user-001', 'vessel-001', '2024-11-01 09:00:00', '2024-11-01 12:00:00', 450.00, 'CONFIRMED', NOW(), NOW()),
('booking-002', 'user-001', 'vessel-002', '2024-11-02 14:00:00', '2024-11-02 18:00:00', 1200.00, 'CONFIRMED', NOW(), NOW()),
('booking-003', 'user-001', 'vessel-003', '2024-11-03 07:00:00', '2024-11-03 11:00:00', 800.00, 'PENDING', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir notificações de demonstração
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
('notif-001', 'user-001', 'Reserva Confirmada', 'Sua reserva da Lancha Azul foi confirmada para 01/11/2024', 'BOOKING_CONFIRMED', false, NOW()),
('notif-002', 'user-001', 'Lembrete de Reserva', 'Você tem uma reserva amanhã às 14:00 no Iate Luxo', 'BOOKING_REMINDER', false, NOW()),
('notif-003', 'admin-001', 'Nova Reserva', 'Nova reserva pendente de aprovação', 'BOOKING_PENDING', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Atualizar estatísticas
UPDATE users SET updated_at = NOW() WHERE email IN ('admin@reservapro.com', 'cliente@reservapro.com');








