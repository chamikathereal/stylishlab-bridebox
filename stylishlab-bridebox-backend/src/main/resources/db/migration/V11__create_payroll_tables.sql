-- payrolls table
CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_advances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    settled_by BIGINT NOT NULL,
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_payroll_user FOREIGN KEY (settled_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- salary_tracker table
CREATE TABLE salary_tracker (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL UNIQUE,
    current_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_advances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_settlement_date TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_tracker_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- advance_requests table
CREATE TABLE advance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    requested_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_advance_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_advance_user FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
