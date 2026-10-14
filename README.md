# Store Rating Portal

A full-stack web application enabling users to browse stores, review community ratings, and submit verified 1-to-5 star ratings. Built with **Express.js**, **React (Vite)**, and a dual **PostgreSQL / SQLite** database adapter.

---

## Key Features & Role Matrix

| Capability | System Administrator | Normal User | Store Owner |
| :--- | :---: | :---: | :---: |
| Single Universal Login | Yes | Yes | Yes |
| Password Change Self-Service | Yes | Yes | Yes |
| Self Registration (Sign Up) | — | Yes | — |
| Dashboard Metric Counters (Users, Stores, Ratings) | Yes | — | — |
| Create Stores & Users | Yes | — | — |
| View All Stores (with Overall Rating) | Yes | Yes | — |
| Multi-column Sorting (Name, Email, Rating, etc.) | Yes | Yes | Yes |
| Live Multi-field Search & Filter | Yes | Yes | Yes |
| Submit / Modify 1–5 Star Ratings | — | Yes | — |
| Store Performance Dashboard (Average Rating) | — | — | Yes |
| View Customer Rating Ledger | — | — | Yes |

---

## Architecture & Design Decisions

1. **Dual-Engine Database Adapter (`backend/src/config/db.js`)**:
   - Primary: **PostgreSQL** connection pooling via `pg` when `DATABASE_URL` is supplied in `.env`.
   - Fallback: High-performance persistent **WASM SQLite** (`sql.js`), allowing evaluators to run the entire stack locally with zero external database setup or Docker dependencies.
2. **Role-Based Access Control (RBAC)**:
   - Stateless JWT tokens signed with HMAC-SHA256.
   - Dedicated middleware guards: `requireAuth` and `requireRole('ADMIN')`.
3. **Strict Form Validations**:
   - **Name**: `20 <= length <= 60` characters (enforced both on the client with live character meters and defensively validated on the backend API).
   - **Address**: Maximum 400 characters.
   - **Password**: 8–16 characters, requiring at least one uppercase letter and one special character.
   - **Ratings**: Integers constrained strictly to `1 <= rating <= 5`.
4. **Interactive UI / UX**:
   - Dynamic 1–5 star rating widget with hover states and instant optimistic UI updates.
   - Live character counters and password checklist feedback.
   - 1-click Quick Login buttons on the sign-in page to speed up evaluation testing.

---

## Quick Start (Local Setup)

### 1. Install Dependencies
Run the root installation helper to install both backend and frontend packages:
```bash
npm run install:all
```

### 2. Seed Database
Initialize sample stores, realistic users (>20 char names), and benchmark ratings:
```bash
npm run seed
```

### 3. Launch Development Servers
Start both the Express API (port `5000`) and the React Vite dev server (port `5173`):
```bash
npm start
```
Open **`http://localhost:5173`** in your browser.

---

## Pre-Configured Test Credentials

For quick evaluation, sample accounts have been seeded for every role:

| Role | Email | Password | Assigned Store / Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@storerating.com` | `Admin@1234` | Full platform administration |
| **Store Owner** | `jonathan@artisancoffee.com` | `Owner@1234` | *Artisan Roast & Brew Coffeehouse* |
| **Store Owner** | `margaret@greenleafbooks.com` | `Owner@1234` | *Greenleaf Heritage Books & Vinyl* |
| **Normal User** | `alexander@storerating.com` | `User@1234` | Pre-rated multiple stores |
| **Normal User** | `christopher@storerating.com` | `User@1234` | General user profile |
| **Normal User** | `elizabeth@storerating.com` | `User@1234` | General user profile |

*(Tip: You can click the "Quick Demo Logins" buttons on the `/login` screen to automatically fill these credentials).*

---

## Automated Backend Test Suite

To run the automated integration tests verifying API routes, RBAC security, constraint enforcement, and rating modifications:

```bash
cd backend
npm test
```

All 12 integration tests run sequentially using Node.js's native test runner (`node:test`).
