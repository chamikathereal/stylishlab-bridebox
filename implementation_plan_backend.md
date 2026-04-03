# Stylish Lab Bridebox — Backend Implementation Plan

## Overview

Complete Spring Boot 4.0.5 backend for a Salon Management System with JWT authentication, role-based access, employee commission management, sales tracking with snapshots, credit handling, expense management, and business reporting — all documented via Swagger/OpenAPI.

**Existing project state:** Fresh Spring Boot project with only the main application class. All dependencies already in `pom.xml` (JPA, Security, Flyway, Validation, MySQL, Lombok, springdoc-openapi 3.0.2). No code written yet.

---

## User Review Required

> [!IMPORTANT]
> **MySQL Database Setup:** You will need a MySQL database running locally. The plan assumes:
> - Database name: `bridebox_salon`  
> - Username: `root`  
> - Password: You'll need to provide your MySQL password (we'll use a placeholder)
> - Port: `3306` (default)

> [!IMPORTANT]
> **Admin Seeding:** Phase 1 includes a Flyway migration that creates an initial admin user. Default credentials will be `admin / admin123` — change this immediately in production.

> [!WARNING]
> **Spring Boot 4.0.5 + Spring Security 7:** Uses the modern `SecurityFilterChain` bean-based configuration. No deprecated `WebSecurityConfigurerAdapter`.

---

## Proposed Changes

### Phase 1: Foundation & Core Modules

We'll build the foundation first — everything needed for the system to start up, authenticate users, and perform basic CRUD operations.

---

### 1. Configuration & Infrastructure

#### [MODIFY] [pom.xml](file:///d:/ME/MYPROJECTS/stylishlab-bridebox/stylishlab-bridebox-backend/pom.xml)
- Add JJWT 0.13.0 dependencies (api, impl, jackson) for JWT authentication

#### [MODIFY] [application.properties](file:///d:/ME/MYPROJECTS/stylishlab-bridebox/stylishlab-bridebox-backend/src/main/resources/application.properties)
- MySQL datasource configuration
- JPA/Hibernate settings (`ddl-auto=validate` since we use Flyway)
- Flyway configuration
- JWT secret key and expiration settings
- Swagger/OpenAPI configuration
- Server port

#### [NEW] application-dev.properties
- Development profile with relaxed settings

---

### 2. Database Migrations (Flyway)

All database schema managed via Flyway migrations in `src/main/resources/db/migration/`:

#### [NEW] V1__create_users_and_employees.sql
- `employees` table: id, full_name, mobile, join_date, profile_picture, status, timestamps
- `users` table: id, username, password_hash, role (ADMIN/EMPLOYEE), employee_id (nullable FK), status, timestamps

#### [NEW] V2__create_employee_commissions.sql
- `employee_commissions` table: id, employee_id, employee_percent, owner_percent, effective_from, effective_to, timestamps

#### [NEW] V3__create_services.sql
- `services` table: id, service_name, price, description, is_active, timestamps

#### [NEW] V4__create_customers.sql
- `customers` table: id, customer_name, mobile, notes, timestamps

#### [NEW] V5__create_sales.sql
- `sales` table: id, invoice_no, customer_id, employee_id, service_id, snapshot fields (service_name, service_price, employee_percent, owner_percent), calculated amounts, payment_status, paid/due amounts, created_by, timestamps

#### [NEW] V6__create_credit_payments.sql
- `credit_payments` table: id, sale_id, customer_id, amount_paid, paid_at, recorded_by, note

#### [NEW] V7__create_payees.sql
- `payees` table: id, name, type, mobile, notes, is_active, timestamps

#### [NEW] V8__create_expenses.sql
- `expense_categories` table: id, category_name, category_type, timestamps
- `expenses` table: id, category_id, payee_id, amount, note, recorded_by, paid_by, expense_date, timestamps

#### [NEW] V9__create_monthly_bills.sql
- `monthly_bills` table: id, bill_type, amount, bill_month, due_date, paid_date, status, note

#### [NEW] V10__seed_admin_user.sql
- Insert default admin user (username: `admin`, password: bcrypt hash of `admin123`)
- Insert default expense categories (Bank Payment, Supplier Payment, Electricity, Water, Rent, Other)

---

### 3. Package Structure

All code under `com.stylishlab.bridebox.stylishlab_bridebox_backend`:

```
├── config/           # Security, Swagger, CORS, App configurations
├── security/         # JWT filter, provider, entry points
├── auth/             # Login controller, DTOs, service
├── user/             # User entity, repository
├── employee/         # Employee CRUD + commission management
├── service/          # Salon service package CRUD
├── customer/         # Customer CRUD
├── sale/             # Sales transactions, invoice generation
├── credit/           # Credit payment management
├── expense/          # Expense recording & categories
├── payee/            # Payee/debtor management
├── bill/             # Monthly bills management
├── report/           # Reporting & analytics
├── profile/          # Profile management (picture, password)
├── common/           # Shared DTOs, enums, exceptions, utils
│   ├── dto/          # ApiResponse wrapper
│   ├── enums/        # Role, PaymentStatus, BillStatus, etc.
│   ├── exception/    # Global exception handler
│   └── util/         # Utility classes
```

---

### 4. Common Module

#### [NEW] common/enums/Role.java
- `ADMIN`, `EMPLOYEE`

#### [NEW] common/enums/PaymentStatus.java  
- `FULLY_PAID`, `CREDIT`, `PARTIAL`

#### [NEW] common/enums/BillStatus.java
- `PENDING`, `PAID`

#### [NEW] common/enums/Status.java
- `ACTIVE`, `INACTIVE`

#### [NEW] common/dto/ApiResponse.java
- Generic wrapper: `success`, `message`, `data`, `timestamp`

#### [NEW] common/exception/GlobalExceptionHandler.java
- `@RestControllerAdvice` handling validation errors, not-found, unauthorized, general errors

#### [NEW] common/exception/ResourceNotFoundException.java
- Custom 404 exception

#### [NEW] common/exception/BadRequestException.java
- Custom 400 exception

---

### 5. Security & Authentication Module

#### [NEW] config/SecurityConfig.java
- `SecurityFilterChain` bean
- Permit: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/**`
- All other routes require authentication
- Stateless session management
- JWT filter registration
- CORS configuration
- Password encoder bean (BCrypt)

#### [NEW] config/OpenApiConfig.java
- Swagger/OpenAPI configuration with JWT bearer auth scheme
- API info (title, description, version)

#### [NEW] config/CorsConfig.java
- CORS configuration allowing frontend origins

#### [NEW] security/JwtTokenProvider.java
- Generate access token
- Validate token
- Extract username and role from token
- Configurable secret and expiration from properties

#### [NEW] security/JwtAuthenticationFilter.java
- `OncePerRequestFilter`
- Extract JWT from Authorization header
- Validate and set SecurityContext

#### [NEW] security/JwtAuthenticationEntryPoint.java
- Handle 401 unauthorized responses

#### [NEW] security/CustomUserDetailsService.java
- Load user by username from database
- Build Spring Security `UserDetails`

#### [NEW] auth/controller/AuthController.java
- `POST /api/auth/login` — login with username/password, return JWT
- `POST /api/auth/refresh` — (future: refresh token)

#### [NEW] auth/dto/LoginRequest.java
- username, password (validated)

#### [NEW] auth/dto/LoginResponse.java
- token, type ("Bearer"), role, username, employeeId

#### [NEW] auth/service/AuthService.java
- Authenticate user, generate and return JWT

---

### 6. User & Employee Module

#### [NEW] user/entity/User.java
- JPA entity mapping to `users` table
- Fields: id, username, passwordHash, role, employee, status, timestamps

#### [NEW] user/repository/UserRepository.java
- `findByUsername()`, `existsByUsername()`

#### [NEW] employee/entity/Employee.java
- JPA entity mapping to `employees` table

#### [NEW] employee/entity/EmployeeCommission.java
- JPA entity mapping to `employee_commissions` table

#### [NEW] employee/repository/EmployeeRepository.java
#### [NEW] employee/repository/EmployeeCommissionRepository.java
- `findCurrentCommission(employeeId)` — where effective_to is null

#### [NEW] employee/dto/CreateEmployeeRequest.java
- fullName, mobile, joinDate, username, password, employeePercent, ownerPercent

#### [NEW] employee/dto/UpdateEmployeeRequest.java
#### [NEW] employee/dto/EmployeeResponse.java
#### [NEW] employee/dto/UpdateCommissionRequest.java
#### [NEW] employee/dto/CommissionResponse.java

#### [NEW] employee/service/EmployeeService.java (interface)
#### [NEW] employee/service/EmployeeServiceImpl.java
- createEmployee — creates Employee + User + initial Commission
- updateEmployee
- activateDeactivate
- getAllEmployees
- getEmployeeById
- updateCommission — closes old commission, creates new one
- getCommissionHistory

#### [NEW] employee/controller/EmployeeController.java
- `POST /api/employees` (ADMIN)
- `GET /api/employees` (ADMIN)
- `GET /api/employees/{id}` (ADMIN)
- `PUT /api/employees/{id}` (ADMIN)
- `PATCH /api/employees/{id}/status` (ADMIN)
- `PUT /api/employees/{id}/commission` (ADMIN)
- `GET /api/employees/{id}/commissions` (ADMIN)

---

### 7. Service Package Module

#### [NEW] service/entity/SalonService.java
- Named `SalonService` to avoid conflict with Java's `Service`

#### [NEW] service/repository/SalonServiceRepository.java

#### [NEW] service/dto/CreateServiceRequest.java
#### [NEW] service/dto/UpdateServiceRequest.java
#### [NEW] service/dto/ServiceResponse.java

#### [NEW] service/service/SalonServiceService.java (interface)
#### [NEW] service/service/SalonServiceServiceImpl.java
- CRUD operations
- Activate/deactivate

#### [NEW] service/controller/SalonServiceController.java
- `POST /api/services` (ADMIN)
- `GET /api/services` (ALL — employees see list during sale)
- `GET /api/services/{id}` (ALL)
- `PUT /api/services/{id}` (ADMIN)
- `PATCH /api/services/{id}/status` (ADMIN)

---

### 8. Customer Module

#### [NEW] customer/entity/Customer.java
#### [NEW] customer/repository/CustomerRepository.java
- Search by name (LIKE query)

#### [NEW] customer/dto/CreateCustomerRequest.java
#### [NEW] customer/dto/UpdateCustomerRequest.java
#### [NEW] customer/dto/CustomerResponse.java

#### [NEW] customer/service/CustomerService.java (interface)
#### [NEW] customer/service/CustomerServiceImpl.java

#### [NEW] customer/controller/CustomerController.java
- `POST /api/customers` (ALL)
- `GET /api/customers` (ALL)
- `GET /api/customers/{id}` (ALL)
- `PUT /api/customers/{id}` (ADMIN)
- `GET /api/customers/search?name=...` (ALL)

---

### Phase 2: Sales, Credit & Expense Modules

---

### 9. Sales Transaction Module

#### [NEW] sale/entity/Sale.java
- Snapshots: serviceName, servicePrice, employeePercent, ownerPercent
- Calculated: employeeAmount, ownerAmount
- PaymentStatus enum
- Auto-generated invoice number

#### [NEW] sale/repository/SaleRepository.java
- Find by employee, customer, date range, payment status
- Sum queries for reports

#### [NEW] sale/dto/CreateSaleRequest.java
- customerId, serviceId, paymentStatus, paidAmount

#### [NEW] sale/dto/SaleResponse.java
#### [NEW] sale/dto/SaleSummaryResponse.java

#### [NEW] sale/service/SaleService.java (interface)
#### [NEW] sale/service/SaleServiceImpl.java
- **createSale:** Fetches service price + employee commission at time of sale, stores as snapshots, calculates employee/owner amounts
- getAllSales, getSalesByEmployee, getSalesByCustomer, getSalesByDateRange

#### [NEW] sale/controller/SaleController.java
- `POST /api/sales` (ALL — employees record sales)
- `GET /api/sales` (ADMIN — all sales)
- `GET /api/sales/{id}` (ALL)
- `GET /api/sales/employee/{employeeId}` (filtered by role)
- `GET /api/sales/customer/{customerId}` (ALL)
- `GET /api/sales/date-range?from=...&to=...` (ADMIN)

---

### 10. Credit Management Module

#### [NEW] credit/entity/CreditPayment.java
#### [NEW] credit/repository/CreditPaymentRepository.java

#### [NEW] credit/dto/RecordCreditPaymentRequest.java
#### [NEW] credit/dto/CreditPaymentResponse.java
#### [NEW] credit/dto/CustomerCreditSummaryResponse.java

#### [NEW] credit/service/CreditService.java (interface)
#### [NEW] credit/service/CreditServiceImpl.java
- recordPayment — reduces due amount on sale, updates status if fully settled
- getCustomersWithPendingCredit
- getCreditHistoryForSale
- getCreditHistoryForCustomer

#### [NEW] credit/controller/CreditController.java
- `POST /api/credits/sales/{saleId}/payments` (ALL)
- `GET /api/credits/pending` (ALL)
- `GET /api/credits/sales/{saleId}/history` (ALL)
- `GET /api/credits/customers/{customerId}/history` (ALL)

---

### 11. Payee / Debtor Module

#### [NEW] payee/entity/Payee.java
#### [NEW] payee/repository/PayeeRepository.java

#### [NEW] payee/dto/CreatePayeeRequest.java
#### [NEW] payee/dto/UpdatePayeeRequest.java
#### [NEW] payee/dto/PayeeResponse.java

#### [NEW] payee/service/PayeeService.java (interface)
#### [NEW] payee/service/PayeeServiceImpl.java

#### [NEW] payee/controller/PayeeController.java
- `POST /api/payees` (ADMIN)
- `GET /api/payees` (ALL)
- `GET /api/payees/{id}` (ALL)
- `PUT /api/payees/{id}` (ADMIN)
- `PATCH /api/payees/{id}/status` (ADMIN)

---

### 12. Expense Module

#### [NEW] expense/entity/ExpenseCategory.java
#### [NEW] expense/entity/Expense.java
#### [NEW] expense/repository/ExpenseCategoryRepository.java
#### [NEW] expense/repository/ExpenseRepository.java

#### [NEW] expense/dto/CreateExpenseRequest.java
#### [NEW] expense/dto/ExpenseResponse.java
#### [NEW] expense/dto/ExpenseCategoryResponse.java

#### [NEW] expense/service/ExpenseService.java (interface)
#### [NEW] expense/service/ExpenseServiceImpl.java
- recordExpense — linked to employee who recorded it
- getExpensesByDateRange
- getExpensesByCategory

#### [NEW] expense/controller/ExpenseController.java
- `POST /api/expenses` (ALL — employees can record)
- `GET /api/expenses` (ADMIN)
- `GET /api/expenses/categories` (ALL)
- `GET /api/expenses/date-range?from=...&to=...` (ADMIN)

---

### Phase 3: Bills, Reports & Profile

---

### 13. Monthly Bills Module

#### [NEW] bill/entity/MonthlyBill.java
#### [NEW] bill/repository/MonthlyBillRepository.java

#### [NEW] bill/dto/CreateBillRequest.java
#### [NEW] bill/dto/UpdateBillRequest.java
#### [NEW] bill/dto/BillResponse.java

#### [NEW] bill/service/BillService.java (interface)
#### [NEW] bill/service/BillServiceImpl.java

#### [NEW] bill/controller/BillController.java
- `POST /api/bills` (ADMIN)
- `GET /api/bills` (ADMIN)
- `GET /api/bills/{id}` (ADMIN)
- `PUT /api/bills/{id}` (ADMIN)
- `PATCH /api/bills/{id}/settle` (ADMIN)
- `GET /api/bills/month/{yearMonth}` (ADMIN)

---

### 14. Reports & Analytics Module

#### [NEW] report/dto/DailyReportResponse.java
- totalSales, cashReceived, creditSales, employeeCommissions, totalExpenses, dailyProfit

#### [NEW] report/dto/WeeklyReportResponse.java
#### [NEW] report/dto/MonthlyReportResponse.java
#### [NEW] report/dto/YearlyReportResponse.java
#### [NEW] report/dto/EmployeeEarningsResponse.java

#### [NEW] report/service/ReportService.java (interface)
#### [NEW] report/service/ReportServiceImpl.java
- Uses JPA repository queries to aggregate data
- Daily/Weekly/Monthly/Yearly profit calculation:  
  `Profit = Total Sales Owner Share - Total Expenses - Monthly Bills`

#### [NEW] report/controller/ReportController.java
- `GET /api/reports/daily?date=...` (ADMIN)
- `GET /api/reports/weekly?date=...` (ADMIN)
- `GET /api/reports/monthly?yearMonth=...` (ADMIN)
- `GET /api/reports/yearly?year=...` (ADMIN)
- `GET /api/reports/employee/earnings` (EMPLOYEE — own earnings)
- `GET /api/reports/employee/{employeeId}/earnings` (ADMIN)

---

### 15. Profile Module

#### [NEW] profile/dto/UpdateProfileRequest.java
#### [NEW] profile/dto/ChangePasswordRequest.java
#### [NEW] profile/dto/ProfileResponse.java

#### [NEW] profile/service/ProfileService.java (interface)
#### [NEW] profile/service/ProfileServiceImpl.java

#### [NEW] profile/controller/ProfileController.java
- `GET /api/profile` (ALL — get own profile)
- `PUT /api/profile` (ALL — update own profile)
- `PUT /api/profile/password` (ALL — change own password)
- `POST /api/profile/picture` (ALL — upload profile picture)

---

## Open Questions

> [!IMPORTANT]
> 1. **MySQL Password:** What is your local MySQL root password? I'll configure it in `application.properties`.

> [!IMPORTANT]
> 2. **Do you want me to create the MySQL database `bridebox_salon` via a command, or will you create it manually?**

> [!NOTE]
> 3. **Profile picture storage:** Should I store profile pictures on the local filesystem (simple) or do you plan to use cloud storage later? For now, I'll implement local file storage.  

> [!NOTE]
> 4. **Development phases:** The SRS suggests 3 phases. Should I implement **all phases in one go** (recommended since the plan is ready), or would you prefer to start with Phase 1 only and iterate?

---

## Verification Plan

### Automated Tests
1. **Build verification:** `mvn clean compile` — ensures all code compiles without errors
2. **Flyway migration:** Application startup validates all SQL migrations run correctly
3. **Swagger UI:** Navigate to `http://localhost:8080/swagger-ui.html` to verify all endpoints are documented

### Manual Verification
1. Start the application and confirm it boots without errors
2. Test login via Swagger UI — get JWT token
3. Test all CRUD endpoints via Swagger with JWT auth header
4. Verify role-based access (admin vs employee restrictions)
5. Test sale creation with snapshot verification
6. Test credit payment settlement flow

---

## Summary of Files to Create

| Category | Count |
|----------|-------|
| Configuration files | 5 |
| Flyway migrations | 10 |
| Entities | 12 |
| Repositories | 12 |
| DTOs | ~35 |
| Services (interface + impl) | 18 |
| Controllers | 10 |
| Security classes | 5 |
| Common/shared classes | 6 |
| **Total** | **~113 files** |

All endpoints will be fully documented in Swagger with proper tags, descriptions, and request/response schemas.
