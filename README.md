
# Project: RentFlow - Vehicle Rental Management Application

> [!summary] Project Overview
> A full-stack, enterprise-grade application designed to streamline and automate the entire operational workflow of a vehicle rental agency. Built with a modern monorepo architecture, RentFlow provides a comprehensive admin dashboard to manage the vehicle fleet, clients, reservations, contracts, and billing.

---

## 🚀 Key Features & Responsibilities

> [!tip] This section details the core business logic and functionalities I designed and implemented.

-   **Fleet Management:** Developed a system for adding, modifying, and tracking vehicles. Implemented a dynamic status engine (`Available`, `Rented`, `Reserved`, `Maintenance`) based on a real-time engagement calendar.
-   **Intelligent Reservation System:**
    -   Designed and built a real-time vehicle availability calendar.
    -   Engineered logic for "chained reservations," allowing future bookings for vehicles already engaged in current contracts.
    -   Implemented a reservation confirmation workflow, including down payment tracking.
-   **Contract & Lifecycle Management:**
    -   Created a module for generating contracts either directly or from a confirmed reservation.
    -   Managed primary and secondary driver information.
    -   Tracked vehicle state (mileage, fuel level) at checkout and check-in.
-   **Automated Invoicing & Payments:**
    -   Built an automated invoice generation system tied to reservations and contracts.
    -   Developed a payment tracking module with statuses (`Pending`, `Partially Paid`, `Paid`).
    -   Enabled multi-payment recording for a single invoice.
-   **Role-Based Access Control (RBAC):**
    -   Implemented a foundational team and role system (`Admin`, `User`).
    -   Secured sensitive sections of the application (e.g., Settings, Team Management) based on user roles.
-   **Automated Conflict Alerts:** Designed a proactive alert system to notify staff of scheduling conflicts, such as a vehicle being scheduled for maintenance while having upcoming reservations.

---

## 🛠️ Tech Stack & Architecture

-   **Frontend Framework:** **Next.js** (App Router)
-   **Backend Framework:** **NestJS**
-   **Primary Language:** **TypeScript**
-   **Database:** **MySQL**
-   **ORM:** **Prisma**
-   **UI Library:** Ant Design
-   **Authentication:** NextAuth.js
-   **Validation:**
    -   Client-Side: **Zod**
    -   Server-Side: **class-validator**
-   **Architecture:** **Monorepo** managed with **PNPM Workspaces** for efficient code sharing and dependency management.

> [!info] Monorepo Structure
> The project is organized in a pnpm monorepo to maximize code reuse and maintain a single source of truth for shared logic.
> ```
> /
> ├── apps/
> │   ├── rentflow-api/  # NestJS Backend Application
> │   └── rentflow-web/  # Next.js Frontend Application
> ├── packages/
> │   ├── database/      # Shared Prisma schema and generated client
> │   ├── schemas/       # Shared Zod validation schemas
> │   └── eslint-config-custom/ # Shared ESLint configuration
> └── package.json       # Workspace root
> ```

---

## 📈 Business Logic & Workflow

The application's core logic revolves around the lifecycle of a vehicle "engagement," from initial reservation to final billing.

1.  **Reservation (`PENDING`):** A vehicle is tentatively blocked for a specific period.
2.  **Confirmation (`CONFIRMED`):** A down payment is received, and the reservation is validated.
3.  **Contract Creation (`ACTIVE`):** The reservation is converted into an active contract. The vehicle's status changes to `RENTED`.
4.  **Contract Termination (`COMPLETED`):** The vehicle is returned. The final cost is calculated, final payments are recorded, the invoice is updated, and the vehicle's status is recalculated (`AVAILABLE` or `MAINTENANCE`).
5.  **Cancellation (`CANCELLED`/`VOID`):** A reservation or contract is cancelled. The associated invoice is voided, and the vehicle's availability is recalculated.

> A centralized function analyzes each vehicle's engagement calendar to ensure its status is always accurate and up-to-date.

---

### Installation & Setup (For Technical Reference)

-   **Prerequisites:** Node.js (v18+), PNPM (v8+), MySQL, Docker (Recommended)
-   **Installation Steps:**
    1.  `git clone [REPO_URL]`
    2.  `pnpm install`
    3.  Configure `.env` file with database and auth credentials.
    4.  `pnpm prisma migrate dev` to set up the database schema.
    5.  `pnpm dev` to run both frontend and backend concurrently.

---

### Future Development & Next Steps

-   **PDF Generation:** Implement PDF generation for contracts and invoices.
-   **Advanced Alerts:** Complete the alert dashboard to display conflicts and reminders.
-   **Team Management:** Build out the UI for adding, modifying, and disabling user accounts.
-   **Granular Roles:** Expand the RBAC system with more detailed permissions.
-   **Deployment:** Deploy the application using Vercel (Frontend) and a cloud server provider (Backend).
