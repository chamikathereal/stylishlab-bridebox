-- Migration to create bill_categories table and seed initial types
CREATE TABLE bill_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO bill_categories (name) VALUES ('Electricity');
INSERT INTO bill_categories (name) VALUES ('Water');
INSERT INTO bill_categories (name) VALUES ('Rent');
INSERT INTO bill_categories (name) VALUES ('Internet');
INSERT INTO bill_categories (name) VALUES ('Maintenance');
INSERT INTO bill_categories (name) VALUES ('Salary Related');
INSERT INTO bill_categories (name) VALUES ('Inventory');
INSERT INTO bill_categories (name) VALUES ('Marketing');
INSERT INTO bill_categories (name) VALUES ('Other');
