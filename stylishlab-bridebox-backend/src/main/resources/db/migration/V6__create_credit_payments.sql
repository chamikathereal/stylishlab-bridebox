-- Credit payments against sales
CREATE TABLE credit_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by BIGINT NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_credit_sale FOREIGN KEY (sale_id) REFERENCES sales(id),
    CONSTRAINT fk_credit_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_credit_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
