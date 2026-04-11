-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.29 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for bridebox_salon
CREATE DATABASE IF NOT EXISTS `bridebox_salon` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bridebox_salon`;

-- Dumping structure for table bridebox_salon.advance_requests
CREATE TABLE IF NOT EXISTS `advance_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` bigint NOT NULL,
  `requested_amount` decimal(10,2) NOT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` bigint DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_advance_employee` (`employee_id`),
  KEY `fk_advance_user` (`approved_by`),
  CONSTRAINT `fk_advance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_advance_user` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.advance_requests: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.bill_categories
CREATE TABLE IF NOT EXISTS `bill_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.bill_categories: ~9 rows (approximately)
INSERT INTO `bill_categories` (`id`, `name`, `is_active`) VALUES
	(1, 'Electricity', 1),
	(2, 'Water', 1),
	(3, 'Rent', 1),
	(4, 'Internet', 1),
	(5, 'Maintenance', 1),
	(6, 'Salary Related', 1),
	(7, 'Inventory', 1),
	(8, 'Marketing', 1),
	(9, 'Other', 1);

-- Dumping structure for table bridebox_salon.credit_payments
CREATE TABLE IF NOT EXISTS `credit_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `paid_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recorded_by` bigint NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_credit_sale` (`sale_id`),
  KEY `fk_credit_customer` (`customer_id`),
  KEY `fk_credit_recorded_by` (`recorded_by`),
  CONSTRAINT `fk_credit_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_credit_recorded_by` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_credit_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.credit_payments: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.customers: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `join_date` date NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.employees: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.employee_commissions
CREATE TABLE IF NOT EXISTS `employee_commissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` bigint NOT NULL,
  `employee_percent` decimal(5,2) NOT NULL,
  `owner_percent` decimal(5,2) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_commission_employee` (`employee_id`),
  CONSTRAINT `fk_commission_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.employee_commissions: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `payee_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `last_amount` decimal(10,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `recorded_by` bigint NOT NULL,
  `paid_by` varchar(50) NOT NULL,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_edit_reason` varchar(100) DEFAULT NULL,
  `last_edit_note` text,
  PRIMARY KEY (`id`),
  KEY `fk_expense_category` (`category_id`),
  KEY `fk_expense_payee` (`payee_id`),
  KEY `fk_expense_recorded_by` (`recorded_by`),
  CONSTRAINT `fk_expense_category` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`),
  CONSTRAINT `fk_expense_payee` FOREIGN KEY (`payee_id`) REFERENCES `payees` (`id`),
  CONSTRAINT `fk_expense_recorded_by` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.expenses: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.expense_categories
CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `category_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.expense_categories: ~6 rows (approximately)
INSERT INTO `expense_categories` (`id`, `category_name`, `category_type`, `created_at`) VALUES
	(1, 'Bank Payment', 'EMPLOYEE_EXPENSE', '2026-04-11 21:06:22'),
	(2, 'Supplier Payment', 'EMPLOYEE_EXPENSE', '2026-04-11 21:06:22'),
	(3, 'Electricity Bill', 'OWNER_EXPENSE', '2026-04-11 21:06:22'),
	(4, 'Water Bill', 'OWNER_EXPENSE', '2026-04-11 21:06:22'),
	(5, 'Shop Rent', 'OWNER_EXPENSE', '2026-04-11 21:06:22'),
	(6, 'Other', 'GENERAL', '2026-04-11 21:06:22');

-- Dumping structure for table bridebox_salon.flyway_schema_history
CREATE TABLE IF NOT EXISTS `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.flyway_schema_history: ~17 rows (approximately)
INSERT INTO `flyway_schema_history` (`installed_rank`, `version`, `description`, `type`, `script`, `checksum`, `installed_by`, `installed_on`, `execution_time`, `success`) VALUES
	(1, '1', 'create users and employees', 'SQL', 'V1__create_users_and_employees.sql', -1795848015, 'root', '2026-04-11 21:06:21', 69, 1),
	(2, '2', 'create employee commissions', 'SQL', 'V2__create_employee_commissions.sql', -80375250, 'root', '2026-04-11 21:06:22', 84, 1),
	(3, '3', 'create services', 'SQL', 'V3__create_services.sql', 897026541, 'root', '2026-04-11 21:06:22', 30, 1),
	(4, '4', 'create customers', 'SQL', 'V4__create_customers.sql', 634159076, 'root', '2026-04-11 21:06:22', 74, 1),
	(5, '5', 'create sales', 'SQL', 'V5__create_sales.sql', 1836405299, 'root', '2026-04-11 21:06:22', 81, 1),
	(6, '6', 'create credit payments', 'SQL', 'V6__create_credit_payments.sql', 1107352725, 'root', '2026-04-11 21:06:22', 51, 1),
	(7, '7', 'create payees', 'SQL', 'V7__create_payees.sql', 672581978, 'root', '2026-04-11 21:06:22', 24, 1),
	(8, '8', 'create expenses', 'SQL', 'V8__create_expenses.sql', 1123953231, 'root', '2026-04-11 21:06:22', 78, 1),
	(9, '9', 'create monthly bills', 'SQL', 'V9__create_monthly_bills.sql', -1958887929, 'root', '2026-04-11 21:06:22', 33, 1),
	(10, '10', 'seed data', 'SQL', 'V10__seed_data.sql', 620295548, 'root', '2026-04-11 21:06:22', 10, 1),
	(11, '11', 'create payroll tables', 'SQL', 'V11__create_payroll_tables.sql', -1055732701, 'root', '2026-04-11 21:06:22', 121, 1),
	(12, '13', 'add edit reasons', 'SQL', 'V13__add_edit_reasons.sql', 2044149634, 'root', '2026-04-11 21:06:22', 22, 1),
	(13, '14', 'add last amount to expenses', 'SQL', 'V14__add_last_amount_to_expenses.sql', 1638012680, 'root', '2026-04-11 21:06:22', 19, 1),
	(14, '15', 'add token version to users', 'SQL', 'V15__add_token_version_to_users.sql', -641879010, 'root', '2026-04-11 21:06:22', 35, 1),
	(15, '16', 'create bill categories table', 'SQL', 'V16__create_bill_categories_table.sql', -1180806990, 'root', '2026-04-11 21:06:22', 41, 1),
	(16, '17', 'add email and reset token', 'SQL', 'V17__add_email_and_reset_token.sql', -1075035818, 'root', '2026-04-11 21:06:23', 148, 1),
	(17, '18', 'fix email constraints', 'SQL', 'V18__fix_email_constraints.sql', -1693321469, 'root', '2026-04-11 21:06:23', 173, 1);

-- Dumping structure for table bridebox_salon.monthly_bills
CREATE TABLE IF NOT EXISTS `monthly_bills` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bill_type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bill_month` varchar(7) NOT NULL,
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.monthly_bills: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  `expiry_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_token_user` (`user_id`),
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.payees
CREATE TABLE IF NOT EXISTS `payees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.payees: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.payrolls
CREATE TABLE IF NOT EXISTS `payrolls` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` bigint NOT NULL,
  `total_earnings` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_advances` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `settled_by` bigint NOT NULL,
  `settled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payroll_employee` (`employee_id`),
  KEY `fk_payroll_user` (`settled_by`),
  CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_payroll_user` FOREIGN KEY (`settled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.payrolls: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.salary_tracker
CREATE TABLE IF NOT EXISTS `salary_tracker` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` bigint NOT NULL,
  `current_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_advances` decimal(10,2) NOT NULL DEFAULT '0.00',
  `last_settlement_date` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  CONSTRAINT `fk_salary_tracker_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.salary_tracker: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.sales
CREATE TABLE IF NOT EXISTS `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(30) NOT NULL,
  `customer_id` bigint NOT NULL,
  `employee_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `service_name_snapshot` varchar(100) NOT NULL,
  `service_price_snapshot` decimal(10,2) NOT NULL,
  `employee_percent_snapshot` decimal(5,2) NOT NULL,
  `owner_percent_snapshot` decimal(5,2) NOT NULL,
  `employee_amount` decimal(10,2) NOT NULL,
  `owner_amount` decimal(10,2) NOT NULL,
  `payment_status` varchar(20) NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `due_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  KEY `fk_sale_customer` (`customer_id`),
  KEY `fk_sale_employee` (`employee_id`),
  KEY `fk_sale_service` (`service_id`),
  KEY `fk_sale_created_by` (`created_by`),
  CONSTRAINT `fk_sale_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_sale_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_sale_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_sale_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.sales: ~0 rows (approximately)

-- Dumping structure for table bridebox_salon.services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.services: ~10 rows (approximately)
INSERT INTO `services` (`id`, `service_name`, `price`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Haircut', 350.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(2, 'Beardcut', 350.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(3, 'Hair & Beard', 700.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(4, 'Hair, Beard & Massage', 900.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(5, 'Massage', 300.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(6, 'Facial', 2500.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(7, 'Cleanup', 2000.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(8, 'Hair Color Black', 800.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(9, 'Hair & Beard Black', 1200.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22'),
	(10, 'Special Package', 2500.00, NULL, 1, '2026-04-11 21:06:22', '2026-04-11 21:06:22');

-- Dumping structure for table bridebox_salon.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `employee_id` bigint DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `token_version` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `fk_user_employee` (`employee_id`),
  KEY `idx_users_email` (`email`),
  CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table bridebox_salon.users: ~1 rows (approximately)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `employee_id`, `status`, `created_at`, `updated_at`, `token_version`) VALUES
	(1, 'admin', 'admin@stylishlab.com', '$2a$10$ontNdECDTdyytJCcD/y2AuIdYKY/nKeN9o4h.3/OX6tPwO1XSJQpG', 'ADMIN', NULL, 'ACTIVE', '2026-04-11 21:06:22', '2026-04-11 21:06:23', 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
