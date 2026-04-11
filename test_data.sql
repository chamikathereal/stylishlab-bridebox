-- =====================================================
-- BRIDEBOX SALON - COMPREHENSIVE TEST DATA
-- 2 Months: March 2026 + April 2026
-- =====================================================
-- 
-- IMPORTANT: Run this AFTER the existing schema is created
-- This script will:
-- 1. Clear existing test data (preserving admin user & seed data)
-- 2. Insert employees, customers, sales, expenses, bills, payroll, advances
--
-- ⚠️ Make sure to backup your database before running this!
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing transaction data (keep users id=1 admin, keep services, keep categories)
DELETE FROM credit_payments;
DELETE FROM advance_requests;
DELETE FROM payrolls;
DELETE FROM salary_tracker;
DELETE FROM sales;
DELETE FROM expenses;
DELETE FROM monthly_bills;
DELETE FROM employee_commissions;
DELETE FROM customers WHERE id > 0;
DELETE FROM payees WHERE id > 0;
DELETE FROM users WHERE id > 1;
DELETE FROM employees WHERE id > 0;

-- Reset auto increment
ALTER TABLE employees AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE payees AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE employee_commissions AUTO_INCREMENT = 1;
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE expenses AUTO_INCREMENT = 1;
ALTER TABLE monthly_bills AUTO_INCREMENT = 1;
ALTER TABLE salary_tracker AUTO_INCREMENT = 1;
ALTER TABLE payrolls AUTO_INCREMENT = 1;
ALTER TABLE advance_requests AUTO_INCREMENT = 1;
ALTER TABLE credit_payments AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. EMPLOYEES (3 barbers)
-- =====================================================
INSERT INTO employees (id, full_name, mobile, join_date, status) VALUES
    (1, 'Kamal Perera', '0771234567', '2025-06-01', 'ACTIVE'),
    (2, 'Nimal Silva', '0779876543', '2025-08-15', 'ACTIVE'),
    (3, 'Ruwan Fernando', '0775551234', '2026-01-10', 'ACTIVE');

-- User accounts for employees
INSERT INTO users (id, username, email, password_hash, role, employee_id, status) VALUES
    (2, 'kamal', 'kamal@stylishlab.com', '$2a$10$ontNdECDTdyytJCcD/y2AuIdYKY/nKeN9o4h.3/OX6tPwO1XSJQpG', 'EMPLOYEE', 1, 'ACTIVE'),
    (3, 'nimal', 'nimal@stylishlab.com', '$2a$10$ontNdECDTdyytJCcD/y2AuIdYKY/nKeN9o4h.3/OX6tPwO1XSJQpG', 'EMPLOYEE', 2, 'ACTIVE'),
    (4, 'ruwan', 'ruwan@stylishlab.com', '$2a$10$ontNdECDTdyytJCcD/y2AuIdYKY/nKeN9o4h.3/OX6tPwO1XSJQpG', 'EMPLOYEE', 3, 'ACTIVE');

-- Commission splits
INSERT INTO employee_commissions (employee_id, employee_percent, owner_percent, effective_from) VALUES
    (1, 50.00, 50.00, '2025-06-01'),
    (2, 45.00, 55.00, '2025-08-15'),
    (3, 40.00, 60.00, '2026-01-10');

-- =====================================================
-- 2. CUSTOMERS (5 regular customers)
-- =====================================================
INSERT INTO customers (id, customer_name, mobile, notes) VALUES
    (1, 'Saman Kumara', '0712345678', 'Regular customer'),
    (2, 'Ashan Bandara', '0723456789', 'VIP client'),
    (3, 'Dinesh Rajapaksa', '0734567890', 'Prefers weekend appointments'),
    (4, 'Lahiru Mendis', '0745678901', NULL),
    (5, 'Tharaka Weerasekara', '0756789012', 'Walk-in customer');

-- =====================================================
-- 3. PAYEES (for expenses)
-- =====================================================
INSERT INTO payees (id, name, type, mobile, is_active) VALUES
    (1, 'Lanka Electricity Board', 'SUPPLIER', '0112345678', 1),
    (2, 'Water Board', 'SUPPLIER', '0112345679', 1),
    (3, 'Shop Owner (Mrs. Perera)', 'SUPPLIER', '0771112233', 1),
    (4, 'SLT Internet', 'SUPPLIER', '0114567890', 1),
    (5, 'Salon Supplies Lanka', 'SUPPLIER', '0779998877', 1);

-- =====================================================
-- 4. SALES - MARCH 2026 (15 transactions)
-- =====================================================
-- Kamal (emp 1): 50/50 split
-- Nimal (emp 2): 45/55 split
-- Ruwan (emp 3): 40/60 split

INSERT INTO sales (invoice_no, customer_id, employee_id, service_id, service_name_snapshot, service_price_snapshot, employee_percent_snapshot, owner_percent_snapshot, employee_amount, owner_amount, payment_status, paid_amount, due_amount, created_by, created_at) VALUES
-- March 2026 - Week 1
('INV-2026-0001', 1, 1, 1, 'Haircut', 350.00, 50.00, 50.00, 175.00, 175.00, 'PAID', 350.00, 0.00, 1, '2026-03-02 10:00:00'),
('INV-2026-0002', 2, 1, 3, 'Hair & Beard', 700.00, 50.00, 50.00, 350.00, 350.00, 'PAID', 700.00, 0.00, 1, '2026-03-02 14:00:00'),
('INV-2026-0003', 3, 2, 6, 'Facial', 2500.00, 45.00, 55.00, 1125.00, 1375.00, 'PAID', 2500.00, 0.00, 1, '2026-03-03 11:00:00'),
-- March 2026 - Week 2
('INV-2026-0004', 4, 2, 4, 'Hair, Beard & Massage', 900.00, 45.00, 55.00, 405.00, 495.00, 'PAID', 900.00, 0.00, 1, '2026-03-08 09:30:00'),
('INV-2026-0005', 5, 3, 10, 'Special Package', 2500.00, 40.00, 60.00, 1000.00, 1500.00, 'CREDIT', 1500.00, 1000.00, 1, '2026-03-09 15:00:00'),
('INV-2026-0006', 1, 1, 8, 'Hair Color Black', 800.00, 50.00, 50.00, 400.00, 400.00, 'PAID', 800.00, 0.00, 1, '2026-03-10 10:30:00'),
-- March 2026 - Week 3
('INV-2026-0007', 2, 3, 7, 'Cleanup', 2000.00, 40.00, 60.00, 800.00, 1200.00, 'PAID', 2000.00, 0.00, 1, '2026-03-15 13:00:00'),
('INV-2026-0008', 3, 1, 9, 'Hair & Beard Black', 1200.00, 50.00, 50.00, 600.00, 600.00, 'PAID', 1200.00, 0.00, 1, '2026-03-16 11:30:00'),
('INV-2026-0009', 4, 2, 1, 'Haircut', 350.00, 45.00, 55.00, 157.50, 192.50, 'PAID', 350.00, 0.00, 1, '2026-03-17 16:00:00'),
-- March 2026 - Week 4
('INV-2026-0010', 5, 3, 5, 'Massage', 300.00, 40.00, 60.00, 120.00, 180.00, 'PAID', 300.00, 0.00, 1, '2026-03-22 10:00:00'),
('INV-2026-0011', 1, 1, 2, 'Beardcut', 350.00, 50.00, 50.00, 175.00, 175.00, 'PAID', 350.00, 0.00, 1, '2026-03-23 09:00:00'),
('INV-2026-0012', 2, 2, 10, 'Special Package', 2500.00, 45.00, 55.00, 1125.00, 1375.00, 'CREDIT', 2000.00, 500.00, 1, '2026-03-24 14:00:00'),
('INV-2026-0013', 3, 3, 1, 'Haircut', 350.00, 40.00, 60.00, 140.00, 210.00, 'PAID', 350.00, 0.00, 1, '2026-03-25 11:00:00'),
('INV-2026-0014', 4, 1, 4, 'Hair, Beard & Massage', 900.00, 50.00, 50.00, 450.00, 450.00, 'PAID', 900.00, 0.00, 1, '2026-03-28 10:00:00'),
('INV-2026-0015', 5, 2, 3, 'Hair & Beard', 700.00, 45.00, 55.00, 315.00, 385.00, 'PAID', 700.00, 0.00, 1, '2026-03-30 15:00:00'),

-- =====================================================
-- 5. SALES - APRIL 2026 (12 transactions)
-- =====================================================
-- April 2026 - Week 1
('INV-2026-0016', 1, 1, 6, 'Facial', 2500.00, 50.00, 50.00, 1250.00, 1250.00, 'PAID', 2500.00, 0.00, 1, '2026-04-01 10:00:00'),
('INV-2026-0017', 2, 2, 7, 'Cleanup', 2000.00, 45.00, 55.00, 900.00, 1100.00, 'PAID', 2000.00, 0.00, 1, '2026-04-02 11:00:00'),
('INV-2026-0018', 3, 3, 3, 'Hair & Beard', 700.00, 40.00, 60.00, 280.00, 420.00, 'PAID', 700.00, 0.00, 1, '2026-04-03 13:00:00'),
-- April 2026 - Week 2
('INV-2026-0019', 4, 1, 1, 'Haircut', 350.00, 50.00, 50.00, 175.00, 175.00, 'PAID', 350.00, 0.00, 1, '2026-04-07 09:00:00'),
('INV-2026-0020', 5, 2, 9, 'Hair & Beard Black', 1200.00, 45.00, 55.00, 540.00, 660.00, 'PAID', 1200.00, 0.00, 1, '2026-04-08 10:30:00'),
('INV-2026-0021', 1, 3, 10, 'Special Package', 2500.00, 40.00, 60.00, 1000.00, 1500.00, 'CREDIT', 2000.00, 500.00, 1, '2026-04-09 14:00:00'),
-- April 2026 - Week 3
('INV-2026-0022', 2, 1, 8, 'Hair Color Black', 800.00, 50.00, 50.00, 400.00, 400.00, 'PAID', 800.00, 0.00, 1, '2026-04-10 11:00:00'),
('INV-2026-0023', 3, 2, 2, 'Beardcut', 350.00, 45.00, 55.00, 157.50, 192.50, 'PAID', 350.00, 0.00, 1, '2026-04-10 16:00:00'),
('INV-2026-0024', 4, 3, 4, 'Hair, Beard & Massage', 900.00, 40.00, 60.00, 360.00, 540.00, 'PAID', 900.00, 0.00, 1, '2026-04-11 09:30:00'),
('INV-2026-0025', 5, 1, 5, 'Massage', 300.00, 50.00, 50.00, 150.00, 150.00, 'PAID', 300.00, 0.00, 1, '2026-04-11 14:00:00'),
('INV-2026-0026', 1, 2, 1, 'Haircut', 350.00, 45.00, 55.00, 157.50, 192.50, 'PAID', 350.00, 0.00, 1, '2026-04-12 10:00:00'),
('INV-2026-0027', 2, 3, 6, 'Facial', 2500.00, 40.00, 60.00, 1000.00, 1500.00, 'PAID', 2500.00, 0.00, 1, '2026-04-12 12:00:00');

-- =====================================================
-- 6. EXPENSES
-- =====================================================
INSERT INTO expenses (category_id, payee_id, amount, note, recorded_by, paid_by, expense_date, created_at) VALUES
-- March 2026 expenses
(1, 5, 3500.00, 'Salon product restock - shampoo & conditioner', 1, 'CASH', '2026-03-05', '2026-03-05 10:00:00'),
(2, 5, 2800.00, 'Hair color supplies', 1, 'CASH', '2026-03-12', '2026-03-12 11:00:00'),
(6, NULL, 1500.00, 'Equipment repair - hair dryer', 1, 'CASH', '2026-03-20', '2026-03-20 09:00:00'),
(1, 5, 4200.00, 'Monthly inventory restock', 1, 'CASH', '2026-03-28', '2026-03-28 10:00:00'),
-- April 2026 expenses
(1, 5, 5000.00, 'Full salon product restock', 1, 'CASH', '2026-04-03', '2026-04-03 10:00:00'),
(6, NULL, 800.00, 'Cleaning supplies', 1, 'CASH', '2026-04-07', '2026-04-07 11:00:00'),
(2, 5, 3200.00, 'Professional hair color', 1, 'CASH', '2026-04-10', '2026-04-10 09:00:00');

-- =====================================================
-- 7. MONTHLY BILLS
-- =====================================================
INSERT INTO monthly_bills (bill_type, amount, bill_month, due_date, paid_date, status, note) VALUES
-- March 2026 bills
('Electricity', 8500.00, '2026-03', '2026-03-20', '2026-03-18', 'PAID', 'March electricity'),
('Water', 3200.00, '2026-03', '2026-03-15', '2026-03-14', 'PAID', 'March water'),
('Rent', 45000.00, '2026-03', '2026-03-05', '2026-03-04', 'PAID', 'March shop rent'),
('Internet', 3500.00, '2026-03', '2026-03-10', '2026-03-10', 'PAID', 'March internet'),
-- April 2026 bills
('Electricity', 9200.00, '2026-04', '2026-04-20', '2026-04-18', 'PAID', 'April electricity'),
('Water', 3500.00, '2026-04', '2026-04-15', '2026-04-14', 'PAID', 'April water'),
('Rent', 45000.00, '2026-04', '2026-04-05', '2026-04-04', 'PAID', 'April shop rent'),
('Internet', 3500.00, '2026-04', '2026-04-10', NULL, 'PENDING', 'April internet - not paid yet');

-- =====================================================
-- 8. SALARY TRACKER (current live state)
-- =====================================================
-- Kamal: March salary settled, April commissions accumulating
-- Accumulated from April sales: 1250+175+400+150 = Rs. 1,975
INSERT INTO salary_tracker (employee_id, current_salary, total_advances, last_settlement_date) VALUES
    (1, 1975.00, 0.00, '2026-03-31 18:00:00'),
    (2, 1755.00, 500.00, '2026-03-31 18:00:00'),
    (3, 2640.00, 1000.00, NULL);

-- =====================================================
-- 9. PAYROLL - March 2026 settlements
-- =====================================================
-- Kamal earned in March: 175+350+400+600+175+450 = Rs. 2,150
INSERT INTO payrolls (employee_id, total_earnings, total_advances, net_paid, settled_by, settled_at, note) VALUES
    (1, 2150.00, 0.00, 2150.00, 1, '2026-03-31 18:00:00', 'March 2026 salary settlement'),
    (2, 3127.50, 500.00, 2627.50, 1, '2026-03-31 18:00:00', 'March 2026 salary settlement (advance deducted)');

-- =====================================================
-- 10. ADVANCE REQUESTS
-- =====================================================
INSERT INTO advance_requests (employee_id, requested_amount, approved_amount, status, requested_at, approved_by, approved_at, note) VALUES
-- Approved advance for Nimal (March)
(2, 500.00, 500.00, 'APPROVED', '2026-03-15 10:00:00', 1, '2026-03-15 10:30:00', 'Need money for family emergency'),
-- Approved advance for Ruwan (April)
(3, 1000.00, 1000.00, 'APPROVED', '2026-04-05 09:00:00', 1, '2026-04-05 09:15:00', 'School fees for kid'),
-- Pending advance request
(1, 500.00, NULL, 'PENDING', '2026-04-11 14:00:00', NULL, NULL, 'Need advance for personal needs'),
-- Rejected advance
(3, 3000.00, NULL, 'REJECTED', '2026-04-10 11:00:00', 1, '2026-04-10 11:30:00', 'Amount too high - exceeds pending salary');

-- =====================================================
-- VERIFICATION CALCULATIONS
-- =====================================================
/*
=== MARCH 2026 SUMMARY ===

SALES (15 transactions):
Total Sales Revenue                = Rs. 16,400.00
  Paid (Cash Received)             = Rs. 14,900.00
  Credit (Due)                     = Rs. 1,500.00

Employee Commission Breakdown:
  Kamal  (50%): 175+350+400+600+175+450 = Rs. 2,150.00
  Nimal  (45%): 1125+405+157.50+1125+315 = Rs. 3,127.50
  Ruwan  (40%): 1000+800+120+140       = Rs. 2,060.00
  TOTAL Employee Commissions           = Rs. 7,337.50

Owner Earnings:
  Kamal sales: 175+350+400+600+175+450  = Rs. 2,150.00
  Nimal sales: 1375+495+192.50+1375+385 = Rs. 3,822.50
  Ruwan sales: 1500+1200+180+210        = Rs. 3,090.00
  TOTAL Owner Revenue                   = Rs. 9,062.50

EXPENSES:
  Product restock      = Rs. 3,500
  Hair color supplies  = Rs. 2,800
  Equipment repair     = Rs. 1,500
  Inventory restock    = Rs. 4,200
  TOTAL Expenses       = Rs. 12,000.00

BILLS (March):
  Electricity = Rs. 8,500
  Water       = Rs. 3,200
  Rent        = Rs. 45,000
  Internet    = Rs. 3,500
  TOTAL Bills = Rs. 60,200.00

SALARY PAYMENTS (March):
  Kamal settlement = Rs. 2,150.00
  Nimal settlement = Rs. 2,627.50
  Nimal advance    = Rs. 500.00
  TOTAL Salaries   = Rs. 5,277.50

Estimated Profit = Owner Revenue - Expenses - Bills
                 = 9,062.50 - 12,000 - 60,200 = -63,137.50

Cash on Hand     = Cash Received - Salaries Paid - Expenses - Bills  
                 = 14,900 - 5,277.50 - 12,000 - 60,200 = -62,577.50

=== APRIL 2026 SUMMARY (up to April 12) ===

SALES (12 transactions):
Total Sales Revenue                = Rs. 14,450.00
  Paid (Cash Received)             = Rs. 13,950.00
  Credit (Due)                     = Rs. 500.00

Employee Commissions:
  Kamal: 1250+175+400+150       = Rs. 1,975.00
  Nimal: 900+540+157.50+157.50  = Rs. 1,755.00
  Ruwan: 280+1000+360+1000      = Rs. 2,640.00
  TOTAL                          = Rs. 6,370.00

Owner Revenue:
  Kamal: 1250+175+400+150       = Rs. 1,975.00
  Nimal: 1100+660+192.50+192.50 = Rs. 2,145.00
  Ruwan: 420+1500+540+1500      = Rs. 3,960.00
  TOTAL                          = Rs. 8,080.00

EXPENSES (April):
  Product restock   = Rs. 5,000
  Cleaning supplies = Rs. 800
  Hair color        = Rs. 3,200
  TOTAL             = Rs. 9,000.00

BILLS (April):
  Electricity = Rs. 9,200
  Water       = Rs. 3,500
  Rent        = Rs. 45,000
  Internet    = Rs. 3,500 (PENDING)
  TOTAL       = Rs. 61,200.00

SALARY/ADVANCE PAYMENTS (April):
  Ruwan advance = Rs. 1,000.00
  TOTAL         = Rs. 1,000.00

=== OVERALL TOTALS ===
Total Sales Revenue = Rs. 30,850.00
Cash Received       = Rs. 28,850.00
Credit Outstanding  = Rs. 2,000.00
Employee Commissions= Rs. 13,707.50
Owner Revenue       = Rs. 17,142.50
Total Expenses      = Rs. 21,000.00
Total Bills         = Rs. 121,400.00
Salaries Paid       = Rs. 6,277.50

Estimated Profit    = 17,142.50 - 21,000 - 121,400 = -125,257.50
Cash on Hand        = 28,850 - 6,277.50 - 21,000 - 121,400 = -119,827.50
*/
