# Stylish Lab Bridebox — Frontend Implementation Plan (v2)

## Overview

Build a complete **Next.js 15** frontend using **Orval + TanStack Query** to auto-generate typed API hooks from the Spring Boot backend's OpenAPI/Swagger spec at `http://localhost:8080/v3/api-docs`.

> [!IMPORTANT]
> **Key architecture change:** Instead of manually writing API service files and TypeScript types, **Orval** will read the backend's Swagger spec and auto-generate:
> - All TypeScript interfaces (request/response DTOs)
> - All TanStack Query hooks (`useQuery`, `useMutation`)
> - A configured Axios instance as the HTTP client
> 
> This means **zero manual API code** — fully contract-first development.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| **Orval** | **Auto-generate API hooks from OpenAPI spec** |
| **TanStack Query (React Query v5)** | **Server state management** |
| Recharts | Charts for reports |
| React Hook Form + Zod | Form validation |
| Axios | HTTP client (used by Orval-generated code) |
| next-themes | Dark mode support |
| lucide-react | Icons |

## How Orval + TanStack Query Works

```
┌─────────────────────┐     reads      ┌────────────────────────┐
│  Spring Boot Backend │ ──────────────→ │  /v3/api-docs (JSON)   │
│  (Swagger/OpenAPI)   │                │  OpenAPI 3.0 Spec      │
└─────────────────────┘                └──────────┬─────────────┘
                                                  │
                                          orval generates
                                                  │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │  src/api/generated/      │
                                    │  ├── model/              │  ← TypeScript types
                                    │  │   ├── loginRequest.ts │
                                    │  │   ├── saleResponse.ts │
                                    │  │   └── ...             │
                                    │  ├── authentication.ts   │  ← Query hooks
                                    │  ├── employee-mgmt.ts    │
                                    │  ├── sales-transactions.ts│
                                    │  └── ...                 │
                                    └─────────────────────────┘
                                                  │
                                          consumed by
                                                  │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │  React Components        │
                                    │  useGetAllEmployees()    │
                                    │  useCreateSale()         │
                                    │  useGetDailyReport()     │
                                    └─────────────────────────┘
```

### What Orval generates from your backend

Based on your Swagger tags, Orval will create these hook files:

| Swagger Tag | Generated File | Example Hooks |
|-------------|---------------|---------------|
| Authentication | `authentication.ts` | `useLogin()` |
| Employee Management | `employee-management.ts` | `useGetAllEmployees()`, `useCreateEmployee()`, `useUpdateCommission()` |
| Service Packages | `service-packages.ts` | `useGetAllServices()`, `useGetActiveServices()`, `useCreateServicePackage()` |
| Customer Management | `customer-management.ts` | `useGetAllCustomers()`, `useSearchCustomers()`, `useCreateCustomer()` |
| Sales Transactions | `sales-transactions.ts` | `useRecordASale()`, `useGetAllSales()`, `useGetSalesByEmployee()` |
| Credit Management | `credit-management.ts` | `useRecordCreditPayment()`, `useGetPendingCredits()` |
| Expense Management | `expense-management.ts` | `useRecordExpense()`, `useGetExpenseCategories()` |
| Payee / Debtor | `payee-debtor-management.ts` | `useGetAllPayees()`, `useCreatePayee()` |
| Monthly Bills | `monthly-bills.ts` | `useGetAllBills()`, `useCreateMonthlyBill()`, `useSettleBill()` |
| Reports & Analytics | `reports-analytics.ts` | `useGetDailyReport()`, `useGetMonthlyReport()`, `useMyEarnings()` |
| Profile Management | `profile-management.ts` | `useGetMyProfile()`, `useChangePassword()`, `useUploadPicture()` |

---

## Design Philosophy

- **Mobile-first** for employee screens (daily phone usage)
- **Premium dark theme** with glassmorphism, gradient accents, smooth animations
- **Color palette**: Deep slate/zinc backgrounds, emerald/teal accents for salon branding
- **Typography**: Inter font family
- **Cards with backdrop blur** and subtle borders

---

## Proposed Changes

### Phase 1: Project Setup & Orval Configuration

#### [NEW] Create Next.js project
```bash
npx create-next-app@latest stylishlab-bridebox-frontend --typescript --tailwind --eslint --app --src-dir --use-npm
```

#### [NEW] Install dependencies
```bash
# TanStack Query
npm install @tanstack/react-query @tanstack/react-query-devtools

# Orval (dev dependency - code generator)
npm install -D orval

# HTTP client
npm install axios

# UI
npm install recharts react-hook-form @hookform/resolvers zod lucide-react next-themes class-variance-authority clsx tailwind-merge

# shadcn/ui init
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select table badge tabs separator sheet dropdown-menu avatar toast sonner
```

#### [NEW] orval.config.ts
Orval configuration file at project root:
```typescript
export default {
  bridebox: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',  // Backend OpenAPI spec
    },
    output: {
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mode: 'tags-split',          // Split by Swagger tags
      override: {
        mutator: {
          path: 'src/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
};
```

#### [NEW] src/api/axios-instance.ts
Custom Axios instance used by all Orval-generated code:
- Base URL: `http://localhost:8080`
- JWT Bearer token from localStorage
- 401 interceptor → redirect to `/login`
- Content-Type: `application/json`

#### [NEW] package.json scripts
```json
{
  "scripts": {
    "api:generate": "orval",
    "api:watch": "orval --watch"
  }
}
```

> [!IMPORTANT]
> **Prerequisite:** The backend must be running when you run `npm run api:generate` so Orval can read the Swagger spec.

---

### Phase 2: Auth & Providers

#### [NEW] src/lib/auth-context.tsx
- AuthContext with `user`, `login()`, `logout()`
- User type: `{ token, role, username, employeeId }`
- Stores JWT in localStorage
- Wraps the app in QueryClientProvider + AuthProvider

#### [NEW] src/app/providers.tsx
- `QueryClientProvider` with configured `QueryClient`
- `ThemeProvider` for dark mode
- `AuthProvider`
- TanStack Query Devtools (dev only)

#### [NEW] src/middleware.ts
- Next.js middleware for route protection
- Redirect `/admin/*` → `/login` if no token or role !== ADMIN
- Redirect `/employee/*` → `/login` if no token
- Redirect `/` → `/admin/dashboard` or `/employee/dashboard` based on role

---

### Phase 3: Layout & Navigation

#### [NEW] src/app/layout.tsx
- Root layout with Inter font, providers, meta tags

#### [NEW] src/app/login/page.tsx
- Premium glassmorphism login card
- Form validation with React Hook Form + Zod
- Uses Orval-generated `useLogin()` mutation
- Role-based redirect after success

#### [NEW] src/components/layout/AdminSidebar.tsx
- Collapsible sidebar navigation (13 menu items)
- Mobile: Sheet/drawer overlay
- Active route highlighting
- User info + logout at bottom

#### [NEW] src/components/layout/EmployeeBottomNav.tsx  
- Mobile bottom tab bar (5 tabs)
- Floating "New Sale" action button
- Large touch targets (48px min)

#### [NEW] src/app/admin/layout.tsx
- Admin shell: sidebar + header + scrollable content
- Breadcrumbs, page title

#### [NEW] src/app/employee/layout.tsx
- Employee shell: header + content + bottom nav
- Mobile-optimized padding

#### [NEW] src/components/layout/Header.tsx
- Page title, user avatar, theme toggle, logout

---

### Phase 4: Admin Dashboard

#### [NEW] src/app/admin/dashboard/page.tsx
- Uses `useDailyReport()` for today's KPIs
- **4 stat cards**: Total Sales, Cash Received, Credit Sales, Net Profit
- **Weekly revenue bar chart** (Recharts BarChart)
- **Monthly trend line chart** (Recharts LineChart)
- **Recent sales table** using `useGetAllSales()`
- **Quick action buttons**: New Sale, Add Customer, View Reports

#### [NEW] src/components/shared/StatCard.tsx
- Reusable KPI card with icon, label, value, trend indicator
- Glassmorphism effect with gradient icon backgrounds

---

### Phase 5: Admin Management Pages

#### [NEW] src/app/admin/employees/page.tsx
- `useGetAllEmployees()` for list
- `useCreateEmployee()` mutation in dialog form
- `useUpdateCommission()` for commission management
- `useToggleEmployeeStatus()` for activate/deactivate
- Card grid showing each employee's name, commission %, status

#### [NEW] src/app/admin/services/page.tsx
- `useGetAllServices()` for list
- `useCreateServicePackage()` in dialog
- `useToggleServiceStatus()` toggle
- Visual price tag cards

#### [NEW] src/app/admin/customers/page.tsx
- `useGetAllCustomers()` with `useSearchCustomers()` debounced search
- `useCreateCustomer()` dialog
- Customer detail with sales history using `useGetSalesByCustomer()`

#### [NEW] src/app/admin/sales/page.tsx
- `useGetAllSales()` table with sorting
- `useGetSalesByDateRange()` for date filtering
- `useRecordASale()` for new sale form
- Sale detail view showing snapshot data, payment status

#### [NEW] src/app/admin/credits/page.tsx
- `useGetPendingCredits()` for customers with balances
- `useRecordCreditPayment()` dialog
- Credit history per sale/customer

#### [NEW] src/app/admin/expenses/page.tsx
- `useGetAllExpenses()` list
- `useRecordExpense()` form with category/payee dropdowns
- `useGetExpenseCategories()` for form select
- Date range filtering

#### [NEW] src/app/admin/payees/page.tsx
- `useGetAllPayees()` CRUD
- Create/edit dialog
- Type categorization badges

#### [NEW] src/app/admin/bills/page.tsx
- `useGetAllBills()` with month filter
- `useCreateMonthlyBill()` form
- `useSettleBill()` action
- Status badges (PENDING/PAID)

#### [NEW] src/app/admin/reports/page.tsx
- **Tabbed interface**: Daily | Weekly | Monthly | Yearly
- `useDailyReport()`, `useWeeklyReport()`, `useMonthlyReport()`, `useYearlyReport()`
- Recharts: BarChart for revenue, PieChart for expense breakdown
- KPI summary cards per period
- Employee performance: `useEmployeeEarnings()`

#### [NEW] src/app/admin/profile/page.tsx
- `useGetMyProfile()` to display
- `useUpdateMyProfile()` to edit
- `useChangePassword()` form
- `useUploadProfilePicture()` with file upload

---

### Phase 6: Employee Screens (Mobile-First)

#### [NEW] src/app/employee/dashboard/page.tsx
- `useMyEarnings()` for today/week/month/year earnings
- Big hero card with today's earnings amount
- Quick stats grid: services done, earnings trend
- Large "New Sale" CTA button
- Recent activity using employee-filtered sales

#### [NEW] src/app/employee/new-sale/page.tsx
- **Step-by-step mobile flow** (wizard):
  1. Search customer: `useSearchCustomers()` + `useCreateCustomer()` inline
  2. Select service: `useGetActiveServices()` as visual cards
  3. Payment type: FULLY_PAID / CREDIT / PARTIAL radio buttons
  4. Confirm: `useRecordASale()` mutation
- Progress indicator, large buttons, minimal scrolling

#### [NEW] src/app/employee/customers/page.tsx
- `useSearchCustomers()` with debounced input
- `useCreateCustomer()` inline form
- Customer card list

#### [NEW] src/app/employee/credits/page.tsx
- `useGetPendingCredits()` filtered view
- `useRecordCreditPayment()` action
- Payment history

#### [NEW] src/app/employee/earnings/page.tsx
- `useMyEarnings()` — full earnings breakdown
- Period toggle: Today | Week | Month | Year
- Earnings trend chart (Recharts)
- Services completed count per period

#### [NEW] src/app/employee/expenses/page.tsx
- `useRecordExpense()` simple form
- Category dropdown: `useGetExpenseCategories()`
- Payee dropdown: `useGetAllPayees()`

#### [NEW] src/app/employee/profile/page.tsx
- `useGetMyProfile()` view
- `useChangePassword()` form
- `useUploadProfilePicture()` with camera/gallery

---

### Phase 7: Shared Components

#### [NEW] src/components/shared/
- `StatCard.tsx` — KPI metric card
- `DataTable.tsx` — Sortable/filterable table wrapper
- `SearchInput.tsx` — Debounced search
- `EmptyState.tsx` — Empty state illustration
- `LoadingSpinner.tsx` — Loading states
- `ConfirmDialog.tsx` — Confirmation modal
- `PageHeader.tsx` — Page title + actions
- `FormDialog.tsx` — Reusable form in dialog pattern

---

## File Structure

```
stylishlab-bridebox-frontend/
├── orval.config.ts                    # Orval configuration
├── src/
│   ├── api/
│   │   ├── axios-instance.ts          # Axios with JWT interceptor
│   │   └── generated/                 # ⚡ AUTO-GENERATED by Orval
│   │       ├── model/                 # TypeScript types
│   │       │   ├── apiResponseLoginResponse.ts
│   │       │   ├── saleResponse.ts
│   │       │   ├── periodReportResponse.ts
│   │       │   └── ... (all DTOs)
│   │       └── endpoints/
│   │           ├── authentication.ts
│   │           ├── employee-management.ts
│   │           ├── service-packages.ts
│   │           ├── customer-management.ts
│   │           ├── sales-transactions.ts
│   │           ├── credit-management.ts
│   │           ├── expense-management.ts
│   │           ├── payee-debtor-management.ts
│   │           ├── monthly-bills.ts
│   │           ├── reports-analytics.ts
│   │           └── profile-management.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── employees/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   ├── credits/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   ├── payees/page.tsx
│   │   │   ├── bills/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── employee/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── new-sale/page.tsx
│   │       ├── customers/page.tsx
│   │       ├── credits/page.tsx
│   │       ├── earnings/page.tsx
│   │       ├── expenses/page.tsx
│   │       └── profile/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── EmployeeBottomNav.tsx
│   │   │   └── Header.tsx
│   │   ├── shared/
│   │   │   ├── StatCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── PageHeader.tsx
│   │   └── ui/                        # shadcn/ui components
│   └── lib/
│       ├── auth-context.tsx
│       └── utils.ts
```

---

## User Review Required

> [!IMPORTANT]
> **Backend must be running** when we run `npm run api:generate` (Orval needs to fetch `http://localhost:8080/v3/api-docs`). Make sure your MySQL is running and the backend starts successfully before we generate the API code.

> [!NOTE]
> **Orval regeneration**: Whenever you change a backend API endpoint, just run `npm run api:generate` and the frontend types + hooks update automatically. No manual type updates needed.

---

## Verification Plan

### Build & Generate
1. Start backend: `cd stylishlab-bridebox-backend && mvnw.cmd spring-boot:run`
2. Generate API code: `npm run api:generate` — verify all hooks are created
3. Build check: `npm run build` — ensures TypeScript compiles

### Integration Testing
1. Start frontend: `npm run dev` (port 3000)
2. Login as admin (`admin / admin123`)
3. Verify dashboard loads with charts
4. Test CRUD on all admin pages
5. Create test employee, login as employee
6. Test new sale flow on mobile viewport
7. Verify reports show real data
8. Test credit payment flow

### Mobile Testing
1. Chrome DevTools → responsive mode (iPhone 14 Pro)
2. Test employee new-sale wizard flow
3. Verify bottom nav works correctly
4. Check all forms are usable on small screens
