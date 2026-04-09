-- Populate email for all existing users to avoid NOT NULL violation
UPDATE users SET email = CONCAT(username, '@stylishlab.com') WHERE email IS NULL OR email = '';

-- Ensure admin email is correct
UPDATE users SET email = 'admin@stylishlab.com' WHERE username = 'admin';

-- Now add the NOT NULL and UNIQUE constraints that Hibernate expects
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NOT NULL;
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
