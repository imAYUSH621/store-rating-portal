# NOTEBOOKLM READY-TO-PASTE SOURCE & AUDIO PROMPTS
**How to use:** Go to **`https://notebooklm.google.com`** $\to$ Click **"New Notebook"** $\to$ Upload or paste this entire document as a Source $\to$ Click **"Generate Audio Overview"**.
Aapke dono AI hosts 10 minute me pure project ko ek mazedaar podcast audio bana denge!

---

## 🎧 SOURCE TEXT FOR NOTEBOOKLM (COPY-PASTE THIS INTO NOTEBOOKLM):

```text
Title: Full Stack Store Rating Portal Technical Architecture & Interview Prep
Candidate: Ayush Anand
Company: Roxiler Systems Technical Interview Round 1
Tech Stack: React (Vite), Express.js (Node.js), Dual Database Adapter (PostgreSQL & SQLite), JWT Authentication, RBAC.

1. High Level Overview:
The Store Rating Portal is a web application where users can discover stores and submit 1 to 5 star ratings. It features three distinct user roles:
- System Administrator: Accesses a central dashboard with count metrics (total users, total stores, total ratings), creates new stores, creates users with any role, and views full user and store tables with multi-column sorting and filtering.
- Store Owner: Logs into a dedicated dashboard showing their store's overall performance banner, average star rating, and a customer audit ledger displaying names, emails, and ratings of users who reviewed their store.
- Normal User: Self-registers, logs in, browses the store catalog with name/address search, views the community rating and their own previously submitted rating, and can submit or modify ratings from 1 to 5 stars.

2. Critical Technical Constraints & Solutions:
- Name Validation: The specification mandates that all user names must be between 20 and 60 characters long. This is validated on both frontend and backend.
- Password Complexity: Passwords must be 8-16 characters, containing at least one uppercase letter and one special character. Hashed using bcrypt with 10 salt rounds.
- Database Composite Constraint: The ratings table enforces UNIQUE(user_id, store_id). This prevents a user from rating the same store multiple times. Re-rating triggers an atomic SQL UPDATE rather than duplicate INSERT.
- Dual Database Architecture: Built using the Adapter design pattern. Connects to PostgreSQL via 'pg' connection pooling when DATABASE_URL is configured, and gracefully falls back to persistent WASM SQLite (sql.js) for zero-dependency local evaluation.
- Deployment on Vercel: Configured using vercel.json with native multi-service rewrites (/api routes to backend Express serverless function, and / routes to Vite React static build). SQLite automatically stores state in /tmp on Vercel to handle read-only serverless filesystems.

3. Key Interview Q&A Flashcards:
Q: What is the database constraint preventing duplicate ratings?
A: Composite unique constraint: UNIQUE(user_id, store_id) on the ratings table.

Q: How is Role-Based Access Control implemented?
A: The user role is signed inside the JWT payload. On the backend, requireRole middleware intercepts requests. On the frontend, ProtectedRoute guards wrap the router.

Q: How do you calculate store average ratings?
A: Using database aggregation: SELECT ROUND(AVG(rating), 2) AS overall_rating, COUNT(id) AS total_ratings FROM ratings WHERE store_id = $1. Indexed on store_id for fast lookup.

Q: Why use SQLite and PostgreSQL both?
A: Dual adapter pattern allows PostgreSQL production performance while offering zero-setup instant local running for interviewers who do not have PostgreSQL running locally.
```

---

## 🎙️ PROMPT TO GENERATE CUSTOM AUDIO IN NOTEBOOKLM:

Paste this into NotebookLM chat box:
> *"Create a conversational podcast discussion between two senior software engineers reviewing my full-stack Store Rating Portal submission for Roxiler Systems.  
> Focus on:  
> 1. The three user roles (Admin, Store Owner, Normal User).  
> 2. The dual-engine database adapter (why having both Postgres and SQLite was a smart architectural choice).  
> 3. The unique constraint on (user_id, store_id) and how rating modification works.  
> 4. How the 20-character name validation was enforced.  
> Explain everything in clear, friendly, conversational terms with analogies so I can easily retain and speak it in my interview tomorrow."*

---

## ❓ 5-QUESTION SELF-CHECK QUIZ (TEST YOUR RETENTION)

### Question 1:
**What stops a user from rating the same store 10 times to boost its score?**  
*Answer:* The `UNIQUE(user_id, store_id)` composite unique constraint in the `ratings` database table. Re-rating executes an `UPDATE`, not an `INSERT`.

### Question 2:
**Where is the user's role stored after login?**  
*Answer:* Inside the signed JWT token payload (and cached in React `AuthContext` / `localStorage`).

### Question 3:
**What is the minimum character length for a user's name according to the spec?**  
*Answer:* Exactly 20 characters (maximum 60 characters).

### Question 4:
**How does the backend support both PostgreSQL and SQLite?**  
*Answer:* The unified adapter in `backend/src/config/db.js` checks if `DATABASE_URL` is configured. If yes, it uses `pg.Pool`; if not, it uses persistent WASM `sql.js` and maps `$1, $2` parameters to SQLite `?` placeholders.

### Question 5:
**How does the Store Owner view only their store's reviews?**  
*Answer:* The `stores` table has an `owner_id` foreign key referencing `users.id`. The backend queries `WHERE owner_id = req.user.id`.
