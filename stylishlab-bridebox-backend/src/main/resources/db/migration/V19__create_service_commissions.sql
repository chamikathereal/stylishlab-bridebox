-- Per-service commission overrides for employees
-- Supports both PERCENTAGE and FIXED_AMOUNT commission types
CREATE TABLE service_commissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    commission_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    employee_percent DECIMAL(5,2),
    owner_percent DECIMAL(5,2),
    employee_fixed_amount DECIMAL(10,2),
    owner_fixed_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_svc_comm_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_svc_comm_service FOREIGN KEY (service_id) REFERENCES services(id),
    CONSTRAINT uk_employee_service UNIQUE (employee_id, service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
