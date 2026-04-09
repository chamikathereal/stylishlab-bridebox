<div align="center">

  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5/3o7TKSjRrfIPjeiVyM/giphy.gif" width="100" alt="Salon Growth Animation">

  <h1 style="font-size: 3rem; font-weight: 900; color: #2563EB; margin-bottom: -10px;">
    Stylish Lab Bridebox
  </h1>
  
  <p style="font-size: 1.2rem; font-style: italic; color: #666;">
    "Luxury Salon Management & Automated Financial Ecosystem."
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot">
    <img src="https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  </p>

  <a href="https://github.com/chamikathereal/stylishlab-bridebox/issues">
    <img src="https://img.shields.io/badge/🐞_Report_Bug-F44336?style=for-the-badge" alt="Report Bug">
  </a>
  <a href="https://github.com/chamikathereal/stylishlab-bridebox/issues">
    <img src="https://img.shields.io/badge/✨_Request_Feature-FF9800?style=for-the-badge" alt="Request Feature">
  </a>

</div>

<br />

---

## Table of Contents

1. [**🎯 Part I: Executive Summary**](#part-i-executive-summary)
2. [**🏗️ Part II: Technical Architecture & Environment**](#part-ii-technical-architecture--environment)
   - ⚙️ 2.1 High-Level Architecture
   - ☕ 2.2 Technology Stack (Full Deep-Dive)
   - 🧩 2.3 Critical Software Design Patterns
   - 📂 2.4 Logical Project Structure
3. [**⚙️ Part III: Backend Engine Specification**](#part-iii-backend-engine-specification)
   - 🔐 3.1 Identity, Security & RBAC
   - 📦 3.2 Module Catalog (API & Core Logic)
4. [**🎨 Part IV: Frontend & UX Functional Specification**](#part-iv-frontend--ux-functional-specification)
   - 💎 4.1 Design Philosophy (Luxury Interface)
   - 🖥️ 4.2 Administrative Control Center
   - 📱 4.3 Mobile Staff Experience
5. [**📊 Part V: Database Schema & Data Integrity**](#part-v-database-schema--data-integrity)
6. [**📖 Part VI: Master Operational Manual**](#part-vi-master-operational-manual)
   - 👔 6.1 Administrator Workflows
   - 💇 6.2 Staff Member Workflows
7. [**🛠️ Part VII: Infrastructure, Setup & Maintenance**](#part-vii-infrastructure-setup--maintenance)
8. [**🚀 Part VIII: Developer Tools & API Testing**](#part-viii-developer-tools--api-testing)

---

# 🎯 Part I: Executive Summary

The **Stylish Lab Bridebox Salon Management System** is a premium, end-to-end enterprise platform designed to maximize operational efficiency within high-end salon environments. The system provides a centralized hub for managing staff performance, customer relationships, complex financial bookkeeping, and automated payroll processing.

By leveraging a decoupled, mobile-optimized architecture, the platform ensures that salon staff can record transactions instantly on the floor, while administrators maintain a high-level strategic overview via a data-rich dashboard.

---

# 🏗️ Part II: Technical Architecture & Environment

## 2.1 High-Level Architecture

The system employs a **Decoupled Client-Server Architecture** (Micro-Service Lite) utilizing a stateless RESTful API.

- **Backend (API Core):** Built with Spring Boot 4, providing transactional integrity, enterprise-grade security, and exhaustive business logic.
- **Frontend (UX Layer):** A Next.js 15 application using React's App Router for industry-leading performance and SEO-friendly rendering.
- **Contract-First Synchronization:** Frontend type-definitions and API hooks are automatically generated from the backend's OpenAPI 3.0 specification using **Orval**, ensuring 100% synchronization and eliminated typing errors.

## 2.2 Core Technology Stack

### ☕ 2.2.1 Backend (Enterprise Java)

- **Runtime:** Java 17 (LTS)
- **Framework:** Spring Boot 4.0.5
- **ORM:** Spring Data JPA / Hibernate
- **Migrations:** Flyway (Version-controlled schema)
- **Security:** Spring Security 7.x + JJWT (Stateless JSON Web Tokens)
- **Email:** Java Mail Sender (Asynchronous password recovery)

### ⚛️ 2.2.2 Frontend (Modern JavaScript)

- **Framework:** Next.js 15.x (App Router)
- **Language:** TypeScript 5.x
- **State Management:** TanStack Query v5 (Server State)
- **UI System:** Tailwind CSS + Radix UI (shadcn/ui)
- **Component Library:** Lucide React (Icons), Recharts (Analytics)

### 🗄️ 2.2.3 Data Storage

- **Primary Engine:** MySQL 8.0+
- **Dialect:** InnoDB (ACID Compliant)

## 2.3 Critical Software Design Patterns

- **Snapshot Architecture:** Encapsulates service prices and commission rates at the time of sale. This ensures historical records remain accurate even if global prices are updated later.
- **Service Layer Pattern:** Separates complex business rules (e.g., payroll calculations) from API entry points.
- **DTO Projection:** Never exposes database entities to the client; all data is mapped to specific DTOs for security and flexibility.
- **Stateless RBAC:** Uses JWT claims to enforce Role-Based Access Control without server-side session overhead.

## 📂 2.4 Logical Project Structure

### 🏗️ Backend Architecture (`/stylishlab-bridebox-backend`)

The backend is organized using a **tier-based modular architecture**, ensuring that each feature (Sale, Payroll, etc.) is isolated and easily maintainable.

```text
src/main/java/com/stylishlab/bridebox/stylishlab_bridebox_backend/
├── auth/               # 🔐 Identity & JWT logic
├── bill/               # 📋 Utility & Rent management
├── config/             # ⚙️ Spring Security, CORS, Bean configs
├── common/             # 🧱 Enums, Global Exceptions, Base DTOs
├── credit/             # 💳 Client debt & settlement tracking
├── customer/           # 🤝 Client profiles & Lead management
├── employee/           # 👤 Staff profiles & Commission snapshots
├── expense/            # 📉 Overhead & operational cost tracking
├── payroll/            # 🏦 Salary trackers, advances & monthly settlement
├── report/             # 📊 Multi-dimensional analytics engine
├── sale/               # 💵 Core transaction logic (Snapshot-based)
├── service/            # 💇 Salon treatment catalog
└── user/               # 🆔 Internal system accounts
```

### 🎨 Frontend Architecture (`/stylishlab-bridebox-frontend`)

The frontend is a **Next.js 15 App Router** application, prioritizing type-safety and visual performance.

```text
src/
├── api/generated/      # ⚡ Auto-generated TanStack Query hooks (Orval)
├── app/                # 🌐 Next.js App Router (Layouts & Pages)
│   ├── admin/          # 👑 High-control management dashboard
│   ├── employee/       # 📱 Mobile-first operational portal
│   ├── login/          # 🔐 Stateless authentication gateway
│   └── (auth)/         # 🔑 Password recovery flows
├── components/         # 🧩 Reusable Component Architecture
│   ├── ui/             # 💎 shadcn/ui primitives (Radix UI)
│   ├── layout/         # 🖼️ Admin Sidebar & Employee Bottom Nav
│   ├── shared/         # ⚙️ Mode toggles, Loaders, Stat cards
│   └── employee/       # 💇 Staff-specific interaction modals
├── hooks/              # 🪝 Custom React hooks (e.g., use-mobile)
├── lib/                # 🛠️ JWT context, Axios interceptors, Utilities
└── public/             # 🖼️ Brand assets & static media
```

---

# ⚙️ Part III: Backend Engine Specification

## 3.1 Identity, Security & RBAC

The system implements a unified security layer using **Spring Security 7.x**.

### 3.1.1 Authentication & Stateless Auth

- **stateless JWT:** Tokens are signed using an HMAC-512 secret. No session state is held on the server, allowing for easy horizontal scaling.
- **Login Flow:** Users provide a `username` and `password`. On success, the server responds with a JWT containing the user's `ID`, `username`, and `Role`.
- **BCrypt Hashing:** All passwords undergo 10 rounds of salt-hashing before persistent storage.

### 3.1.2 Role-Based Access Control (RBAC)

| Role           | Responsibility            | Platform Access                   |
| :------------- | :------------------------ | :-------------------------------- |
| **`ADMIN`**    | 👑 Full Financial Control | 🖥️ Admin Dashboard + API          |
| **`EMPLOYEE`** | 💇 Field Operations       | 📱 Mobile Portal + Restricted API |

---

## 3.2 Backend Module Catalog

### 3.2.1 Authentication Module (`auth`)

Manages security entry points and password recovery.

- **Endpoints:** `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
- **Logic:** Implements token-based password reset with email notifications.

### 3.2.2 Employee & Commission Module (`employee`)

Handles staff lifecycle and dynamic pricing shares.

- **Dynamic Commissions:** Tracks active vs. inactive commission rates.
- **Endpoints:** `/api/employees` (CRUD), `/api/employees/{id}/commission` (Update rate), `/api/employees/{id}/status` (Toggle activity).

### 3.2.3 Sales Engine (`sale`)

High-integrity transaction processor.

- **Snapshot Logic:** Automatically captures service price and commission percentage at the point of sale.
- **Calculations:** `Employee Share = Price * CommissionRate / 100`.
- **Endpoints:** `/api/sales` (Create/List), `/api/sales/date-range` (Historical audit).

### 3.2.4 Credit & Debt Tracking (`credit`)

- **Status Mapping:** Automatically transitions sale status from `CREDIT` to `FULLY_PAID` when outstanding balances hit zero.
- **Endpoints:** `/api/credits/sales/{id}/payments`, `/api/credits/pending`.

### 3.2.5 Payroll & Settlement (`payroll`)

Automated financial closure for the month.

- **Live Tracker:** Real-time accumulation of service commissions.
- **Formula:** `Final Pay = (Commission + Base Salary) - Approved Advances`.
- **Endpoints:** `/api/admin/payroll/trackers`, `/api/admin/payroll/settle`.

### 3.2.6 Reports & Analytics (`report`)

- **Aggregators:** Daily, Weekly, Monthly, and Yearly profit/loss views.
- **Endpoints:** `/api/reports/daily`, `/api/reports/monthly`, `/api/reports/employee/earnings`.

---

# 🎨 Part IV: Frontend & UX Functional Specification

## 4.1 Design Philosophy (Luxury Interface)

The UI is built with **"Premium Dark Mode"** as the primary aesthetic.

- **Glassmorphism:** Uses `backdrop-blur` and semi-transparent borders for depth.
- **Mobile-First Staff Experience:** Optimized for single-hand usage on salon-floor mobile devices.
- **Micro-Animations:** Fluid state changes via `framer-motion` and Tailwind animations.

## 4.2 Application Shell & Routing

- **Layouts:** Persistent navigation bars (Sidebar for Admin, Bottom Nav for Employees).
- **Protected Routes:** Next.js middleware forces redirection for unauthenticated or unauthorized hits.

---

# 📊 Part V: Database Schema & Data Integrity

## 5.1 Relational Architecture

| Table       | Description              | Integrity Feature                                |
| :---------- | :----------------------- | :----------------------------------------------- |
| `employees` | 👤 Primary staff records | 🛡️ Soft-delete via `status` codes                |
| `sales`     | 💵 Financial ledger      | ❄️ **Immutable snapshots** of prices/commissions |
| `customers` | 🤝 Client database       | 🆔 Unique indexing on mobile numbers             |
| `payrolls`  | 🏦 Salary history        | 🧾 Hard link to `settled_by` user for auditing   |

---

# 📖 Part VI: Master Operational Manual

## 6.1 Administrator Workflows

### 6.1.1 Monthly Settlement Flow

1. **Review:** Check the live tracker for each stylist.
2. **Advances:** Process pending advance requests from the dashboard.
3. **Settlement:** Execute the "Settle Salary" action. The system calculates net pay and clears trackers for the new period.

## 6.2 Staff Member Workflows

### 6.2.1 Recording a New Sale (3-Step Fast Track)

1. **🔍 Identify:** Search for customer or tap "Guest."
2. **💇 Select:** Choose treatments from the visual treatment grid.
3. **✅ Pay:** Select payment mode and confirm. The sale is instantly visible in personal earnings.

---

# 🛠️ Part VII: Infrastructure, Setup & Maintenance

## 7.1 Local Development Environment

1. **Prerequisites:** JDK 17, Node.js 20+, MySQL 8.0.
2. **Setup:**
   - Create DB: `CREATE DATABASE bridebox_salon;`
   - Run Backend: `mvn clean spring-boot:run`
   - Run Frontend: `npm run dev`

## 7.2 Deployment Protocol

- **Production Build:** Use `mvn clean package` for the backend and `npm run build` for the frontend.
- **Environment Variables:** Ensure `JWT_SECRET` and `DATABASE_URL` are securely injected via environment configurations, not hardcoded.

## 7.3 Maintenance

- **Schema Lifecycle:** Database updates must only be performed via Flyway migrations.
- **Backups:** Perform a full `mysqldump` of the `bridebox_salon` schema daily.

---

# 🚀 Part VIII: Developer Tools & API Testing

The Stylish Lab Bridebox backend provides built-in tools for rapid development, testing, and API verification.

## 🛠️ 8.1 Swagger UI (Interactive Documentation)

The system uses **SpringDoc OpenAPI** to generate a live, interactive test environment.

- **URL:** `http://localhost:8080/swagger-ui.html`
- **Authentication:**
  1. Login via `/api/auth/login` to obtain a JWT.
  2. Click the **"Authorize"** button at the top of the Swagger page.
  3. Enter the token in the format: `Bearer YOUR_JWT_TOKEN`.
  4. All protected endpoints will now be accessible for testing directly in the browser.

## 📮 8.2 Postman Integration

For advanced testing, performance monitoring, and automated collections:

1. **Importing Docs:** In Postman, click **Import** and paste the raw OpenAPI JSON URL: `http://localhost:8080/v3/api-docs`.
2. **Environment Setup:** Create a variable named `base_url` set to `http://localhost:8080`.
3. **Automated Auth:**
   - Go to the Collection's **Authorization** tab.
   - Select **Type:** Bearer Token.
   - Use a variable: `{{jwt_token}}`.
   - Update this variable upon login to authorize all requests in the collection automatically.

---

## 🧑‍💻 Author

<div align="center">

  <img src="https://github.com/chamikathereal.png" width="120px" style="border-radius: 50%; border: 4px solid #2563EB; box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);" alt="Chamika Gayashan">

### **Chamika Gayashan**

_Lead Developer | Stylish Lab Bridebox System_

> _"Code is poetry, and I'm just trying to make it rhyme."_ 🚀

  <p>
    <a href="https://www.linkedin.com/in/chamikathereal">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
    <a href="https://github.com/chamikathereal">
      <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://medium.com/@chamikathereal">
      <img src="https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white" alt="Medium">
    </a>
  </p>
  <p>
    <a href="https://www.instagram.com/chamikathereal/">
      <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
    </a>
    <a href="https://www.facebook.com/chamikathereaI">
      <img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook">
    </a>
  </p>

  <br />

<code>Last Updated: Thursday, April 9, 2026</code>

</div>

---

<p align="center">
  <sub>Built with ❤️ and ☕ by Chamika Gayashan. Star this repo if you found it useful! ⭐</sub>
</p>
