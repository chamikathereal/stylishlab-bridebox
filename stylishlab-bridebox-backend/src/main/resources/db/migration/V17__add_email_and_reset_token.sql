-- Add email column to users table
ALTER TABLE users ADD COLUMN email VARCHAR(100) AFTER username;

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Update existing admin user with a default email
UPDATE users SET email = 'admin@stylishlab.com' WHERE username = 'admin';

-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
