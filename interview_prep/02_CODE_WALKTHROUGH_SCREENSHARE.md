# ROXILER CODE WALKTHROUGH & SCREEN SHARE PLAYBOOK
**Goal:** Look like a seasoned, confident engineer who wrote every line of this code.

---

## 🎬 STAGE 1: THE OPENING SCREEN SHARE (FIRST 60 SECONDS)

Jab interviewer bole: *"Please share your screen and walk us through your codebase"*:

1. **Screen Share:** Share the whole screen or VS Code window with the project open: `C:\Users\ANANTMADHAV\PROJECTS\store-rating-portal`.
2. **Terminal Status:** Keep two terminal tabs ready:
   - Tab 1: Running `npm start` (Backend on `localhost:5000`, Frontend on `localhost:5173`).
   - Browser Tab: Open to `https://store-rating-portal-green.vercel.app` (Live Demo!).
3. **Opening Dialogue (Bolna kya hai):**
> *"Sure! Here is the project repository. It is organized into a clean decoupled architecture:  
> - `backend/`: An Express.js REST API with MVC pattern and dual database adapter.  
> - `frontend/`: A React Single Page Application built with Vite and pure CSS tokens.  
> - `api/` and `vercel.json`: The serverless routing layer for cloud deployment.  
> Let me first show you the database design, as that anchors the entire domain model."*

---

## 📂 STAGE 2: THE 4 CRITICAL FILES TO OPEN & HIGHLIGHT

### File 1: Database Schema & Adapter
👉 **Path to open:** `backend/src/db/schema.sql` and `backend/src/config/db.js`
* **Where to point with cursor:**
  - In `schema.sql`: Point to `CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)` (Line ~28).
  - In `db.js`: Point to `initSqlite()` and `query()` function.
* **What to say (Script):**
> *"Here in `schema.sql`, we have three primary entities: `users`, `stores`, and `ratings`.  
> The key architectural decision is the composite unique constraint on `(user_id, store_id)` in the `ratings` table. This guarantees data integrity at the database layer so a user can never inject duplicate ratings for the same store.  
> In `db.js`, I built a unified adapter that converts PostgreSQL `$1, $2` parameters into SQLite `?` placeholders when running locally, giving us zero-friction offline execution."*

---

### File 2: Validation Middleware (The Intern Challenge Catch)
👉 **Path to open:** `backend/src/middleware/validate.js`
* **Where to point with cursor:**
  - Function `validateName(name)` (Line ~10): `trimmed.length < 20 || trimmed.length > 60`.
  - Function `validatePassword(password)` (Line ~40): regex checking uppercase and special character.
* **What to say (Script):**
> *"The problem specification had strict constraints: Names must be between 20 and 60 characters, and passwords must have 8-16 characters with uppercase and special character rules.  
> I isolated all business validation rules into this reusable `validate.js` middleware. If any field fails, it returns an explicit `errors` dictionary with human-readable error messages so the frontend form can highlight the exact faulty field."*

---

### File 3: Role-Based Access Control (RBAC) & Routes
👉 **Path to open:** `backend/src/middleware/roles.js` and `backend/src/routes/admin.js`
* **Where to point with cursor:**
  - In `roles.js`: `function requireRole(...allowedRoles)`
  - In `admin.js`: `router.use(requireAuth, requireRole('ADMIN'));` (Line ~9)
* **What to say (Script):**
> *"For authorization, I wrote a higher-order middleware `requireRole`. In `admin.js`, you can see line 9 guards all administrative endpoints in a single declarative line: `router.use(requireAuth, requireRole('ADMIN'))`. If someone tries to forge a request with a normal user token, it halts immediately with a 403 status before any database query executes."*

---

### File 4: Rating Logic & Upsert
👉 **Path to open:** `backend/src/controllers/ratingController.js`
* **Where to point with cursor:**
  - `submitOrUpdateRating` function (Line ~10 to ~50):
  - Check existing rating: `SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2`.
  - If existing $\to$ `UPDATE`, else $\to$ `INSERT`.
  - The aggregate query: `SELECT ROUND(AVG(rating), 2) AS overall_rating`.
* **What to say (Script):**
> *"Here in `ratingController.js`, we handle both initial submissions and modifications in one idempotent endpoint. We first query if a rating exists for this `(user_id, store_id)` pair. If it does, we perform an `UPDATE`; otherwise, an `INSERT`. Then we instantly compute the updated store average and return it to the client so the UI can update without refreshing the page."*

---

### File 5: Frontend Route Guards & Auth Context
👉 **Path to open:** `frontend/src/App.jsx`
* **Where to point with cursor:**
  - `function ProtectedRoute({ children, allowedRoles })` (Line ~10 to ~30)
  - `<Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />`
* **What to say (Script):**
> *"On the frontend in `App.jsx`, I created a `<ProtectedRoute>` component wrapping each dashboard route. It evaluates `AuthContext` in real time: if not authenticated, it sends the user to `/login`; if the user's role does not match `allowedRoles`, it routes them to their authorized view."*

---

## 🌐 STAGE 3: LIVE APP DEMO (1 MINUTE WALKTHROUGH)

If the interviewer says: *"Can you show the working app in the browser?"*

1. Open **`https://store-rating-portal-green.vercel.app`** (or `http://localhost:5173`).
2. Point out the **Quick Demo Logins** on the login card:
   > *"I added one-click demo credentials here on the login screen to allow quick evaluation of all three roles."*
3. **Step 1 - Login as Normal User (`alexander@storerating.com`):**
   - Show the store cards.
   - Point out: *"Here is Artisan Roast Coffeehouse. You can see the community average is 4.7 stars, and my submitted rating is 5 stars."*
   - Click **Modify** $\to$ Change rating to 4 stars $\to$ Click Submit.
   - Point out: *"Notice the star rating updated optimistically with zero screen flicker."*
4. **Step 2 - Login as Store Owner (`jonathan@artisancoffee.com`):**
   - Click Logout $\to$ Click Quick Demo "Owner" $\to$ Login.
   - Point out: *"As the store owner of Artisan Roast, I see my store's average rating banner and the customer review audit table below showing every user who reviewed my store."*
5. **Step 3 - Login as System Administrator (`admin@storerating.com`):**
   - Show the 3 metric counters: Total Users, Total Stores, Total Ratings.
   - Show the table filtering (type a letter in search bar $\to$ list filters instantly).
   - Click a column header (`Overall Rating` or `Name`) $\to$ show the sorting arrow toggling.
