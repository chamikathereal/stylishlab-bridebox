-- Monthly bills
CREATE TABLE monthly_bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bill_month VARCHAR(7) NOT NULL,
    due_date DATE,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
