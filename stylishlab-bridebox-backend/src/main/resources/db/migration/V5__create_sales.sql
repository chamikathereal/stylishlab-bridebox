-- Sales transactions with snapshot fields
CREATE TABLE sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    service_name_snapshot VARCHAR(100) NOT NULL,
    service_price_snapshot DECIMAL(10,2) NOT NULL,
    employee_percent_snapshot DECIMAL(5,2) NOT NULL,
    owner_percent_snapshot DECIMAL(5,2) NOT NULL,
    employee_amount DECIMAL(10,2) NOT NULL,
    owner_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    due_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_sale_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_sale_service FOREIGN KEY (service_id) REFERENCES services(id),
    CONSTRAINT fk_sale_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
