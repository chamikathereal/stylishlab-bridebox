-- Seed admin user (password: admin123 - BCrypt hash)
INSERT INTO users (username, password_hash, role, status)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE');

-- Seed default expense categories
INSERT INTO expense_categories (category_name, category_type) VALUES
('Bank Payment', 'EMPLOYEE_EXPENSE'),
('Supplier Payment', 'EMPLOYEE_EXPENSE'),
('Electricity Bill', 'OWNER_EXPENSE'),
('Water Bill', 'OWNER_EXPENSE'),
('Shop Rent', 'OWNER_EXPENSE'),
('Other', 'GENERAL');

-- Seed default salon services
INSERT INTO services (service_name, price, is_active) VALUES
('Haircut', 350.00, TRUE),
('Beardcut', 350.00, TRUE),
('Hair & Beard', 700.00, TRUE),
('Hair, Beard & Massage', 900.00, TRUE),
('Massage', 300.00, TRUE),
('Facial', 2500.00, TRUE),
('Cleanup', 2000.00, TRUE),
('Hair Color Black', 800.00, TRUE),
('Hair & Beard Black', 1200.00, TRUE),
('Special Package', 2500.00, TRUE);
