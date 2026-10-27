# ROXILER SYSTEMS — MASTER 1-PAGE SURVIVAL CHEATSHEET
**Target:** Technical Round 1 (Store Rating Portal) | **Role:** Full Stack Intern / SDE  
**Core Strategy:** Keywords + Hinglish Understanding $\to$ Crisp English Delivery

---

## ⚡ 1. 30-SECOND ELEVATOR PITCH (PROJECT INTRO)
*Jab interviewer bole: "Tell me about this project / give me an overview"*

* **Hinglish Samajh:** "Maine ek role-based store rating portal banaya hai jisme teen users hain (Admin, Normal User, Store Owner). Express backend, React Vite frontend, aur dual database adapter (PostgreSQL + SQLite) use kiya hai. Normal user 1-5 rating de sakta hai, admin sab manage karta hai, aur store owner apne reviews dekhta hai."
* **3 Keywords to Anchor:** `Three-Tier RBAC`, `Dual-Engine Database`, `Atomic Rating Upsert`.
* **Speak in English:**
> "I built the **Store Rating Portal**, a full-stack platform featuring **three-tier Role-Based Access Control** for Admins, Store Owners, and Normal Users.  
> The backend is built with **Express.js** and features a **dual database adapter** supporting both PostgreSQL and zero-config SQLite.  
> On the frontend, I used **React with Vite**, implementing interactive 1-to-5 star ratings with optimistic UI updates, live constraint validators, and multi-column sortable data tables.  
> All API endpoints are secured using stateless **JWT authentication**."

---

## 🗺️ 2. THE ARCHITECTURE MENTAL MAP (YAAD RAKHNE KE LIYE)

```
[ FRONTEND: React + Vite (Port 5173) ]
      │
      ├── AuthContext (User session, Token in localStorage)
      ├── ProtectedRoute Guard (Checks user.role -> redirects if unauthorized)
      ├── Pages: /login, /signup, /admin, /stores, /owner
      └── Interactive Components: StarRating, SortableHeader, Modal
            │
            ▼ (HTTP REST API / JSON with JWT Bearer Token)
[ BACKEND: Express.js (Port 5000 / Vercel Serverless) ]
      │
      ├── Middleware Chain:
      │     1. cors() + express.json()
      │     2. requireAuth (verifies JWT signature)
      │     3. requireRole (ADMIN / USER / STORE_OWNER)
      │     4. validateUserRegistration (20-60 chars name, regex)
      │
      └── Database Adapter (src/config/db.js):
            ├── If DATABASE_URL set -> PostgreSQL Pool (pg)
            └── If not set -> Persistent WASM SQLite (sql.js in /tmp or data/)
                  │
                  ▼
[ RELATIONAL DATABASE SCHEMA ]
      ├── users   (id, name, email, password_hash, address, role)
      ├── stores  (id, name, email, address, owner_id -> users.id)
      └── ratings (id, user_id, store_id, rating[1-5], created_at, updated_at)
            └── UNIQUE(user_id, store_id)  <-- CRITICAL CONSTRAINT!
```

---

## 🎯 3. TOP 10 INTERVIEW QUESTIONS (HINGLISH $\to$ KEYWORDS $\to$ SPOKEN SCRIPT)

### Q1: "Why did you use SQLite and PostgreSQL both? (Dual Adapter)"
* **Hinglish Samajh:** "Production me PostgreSQL best hai, lekin interview evaluation me bina docker ya postgres install kiye project run hona chahiye. Isliye adapter pattern banaya jo DATABASE_URL hone pe Postgres use karta hai, warna zero-dependency SQLite pe switch ho jata hai."
* **3 Keywords:** `Adapter Pattern`, `Zero-Friction Evaluation`, `Postgres Production Ready`.
* **Speak in English:**
> "I designed a **dual-engine database adapter** using the Adapter pattern. In production, it connects to **PostgreSQL** via connection pooling. However, for seamless evaluation and offline testing, it gracefully falls back to persistent **WASM SQLite**. This guarantees the reviewer can clone and run `npm start` instantly with zero Docker or local database setup."

---

### Q2: "How is Role-Based Access Control (RBAC) implemented?"
* **Hinglish Samajh:** "Login hote hi user ka role (`ADMIN`, `USER`, `STORE_OWNER`) JWT token ke payload me sign kar dete hain. Backend me `requireAuth` token verify karta hai aur `requireRole` check karta hai ki allowed role hai ya nahi. Frontend me `<ProtectedRoute>` wrapper unauthorized page pe jaane se rokta hai."
* **3 Keywords:** `JWT Payload`, `Higher-Order Middleware`, `Client Route Guards`.
* **Speak in English:**
> "RBAC is enforced at two distinct boundaries:  
> 1. **Backend Layer:** Upon login, the user's role is baked into the signed **JWT payload**. Incoming requests pass through `requireAuth` which verifies the token, followed by a reusable `requireRole('ADMIN')` middleware that halts unauthorized requests with a `403 Forbidden`.  
> 2. **Frontend Layer:** The React Router routes are wrapped in a `<ProtectedRoute allowedRoles={['ADMIN']}>` guard that checks the `AuthContext` state and redirects unauthorized users to their appropriate dashboard."

---

### Q3: "How do you handle the 20-character minimum Name requirement?"
* **Hinglish Samajh:** "Assignment me strict requirement thi: Name 20 se 60 characters ka hona chahiye. Maine frontend me live character meter lagaya aur backend me `validate.js` me defensive check lagaya. Testing ke liye realistic long names (e.g., Alexander Bartholomew Smith) seed kiye."
* **3 Keywords:** `Defense-in-Depth`, `Live Character Meter`, `Realistic Seed Fixtures`.
* **Speak in English:**
> "I applied a **defense-in-depth validation strategy**:  
> On the frontend, input fields provide **real-time visual feedback** with a character counter (`{name.length} / 60`), preventing submission if below 20.  
> On the backend, `validateUserRegistration` strictly validates `trimmed.length >= 20 && trimmed.length <= 60` and returns clean `400 Bad Request` messages.  
> In the database seed script, all demo records use realistic compliant names like *'Alexander Bartholomew Smith'* to prevent test failures."

---

### Q4: "What happens when a user modifies their rating for a store?"
* **Hinglish Samajh:** "Ratings table me `UNIQUE(user_id, store_id)` constraint laga hai. Jab user dobara rate karta hai, code check karta hai: agar pehle se record hai toh `UPDATE` chalta hai, warna `INSERT`. Uske turant baad `AVG(rating)` calculate karke frontend ko naya average return hota hai."
* **3 Keywords:** `Composite Unique Constraint`, `Atomic Upsert`, `Optimistic UI Update`.
* **Speak in English:**
> "The `ratings` table enforces a composite unique constraint on `(user_id, store_id)`, guaranteeing a user can only rate a store once.  
> In `ratingController.js`, I check if a rating already exists. If found, it executes an **UPDATE**; otherwise, an **INSERT**.  
> The endpoint then queries the fresh `AVG(rating)` and `COUNT(*)` using SQL aggregate functions and returns the new average. On the frontend, the state updates optimistically so the stars reflect the change instantly."

---

### Q5: "How does Password Validation and Storage work?"
* **Hinglish Samajh:** "Plain text password kabhi database me save nahi hota. Hum `bcryptjs` se 10 rounds ka salt generate karke hash store karte hain. Validation me 8-16 chars, 1 uppercase aur 1 special char regex se check hota hai."
* **3 Keywords:** `Bcrypt Salting (10 rounds)`, `Complexity Regex`, `Zero Plaintext Persistence`.
* **Speak in English:**
> "Passwords are never persisted in plaintext. We hash them using **bcrypt** with a salt factor of 10.  
> Complexity is enforced via regular expressions validating `8 to 16 characters`, at least one uppercase letter `[A-Z]`, and at least one special character.  
> The frontend provides a 3-point visual checklist showing green checkmarks as the user types."

---

### Q6: "How do you calculate Store Average Ratings without performance lag?"
* **Hinglish Samajh:** "Javascript me array loop karke average nikalne ke bajaye, database level pe `LEFT JOIN` aur `ROUND(AVG(r.rating), 2)` use kiya hai with `GROUP BY s.id`. Ratings table pe `store_id` ka index bhi banaya hai."
* **3 Keywords:** `SQL Aggregate (AVG)`, `GROUP BY Indexing`, `Decimal Precision (ROUND 2)`.
* **Speak in English:**
> "Instead of fetching all ratings and computing the average in Node.js memory, I delegate aggregation directly to the database engine using `LEFT JOIN ratings r ON s.id = r.store_id` grouped by `s.id`, computing `ROUND(AVG(r.rating), 2)`.  
> I also created an index on `ratings(store_id)` to keep aggregate lookups $O(\log N)$ as the ratings volume scales."

---

### Q7: "How is sorting and searching implemented on tables?"
* **Hinglish Samajh:** "SQL query me dynamic `ORDER BY` aur `LIKE %search%` lagaya hai. Lekin SQL injection se bachne ke liye allowed sort columns ka whitelist mapping object rakha hai."
* **3 Keywords:** `Whitelist Column Mapping`, `SQL Parameterization`, `Debounced Querying`.
* **Speak in English:**
> "Sorting and filtering are server-driven. The API accepts `sortBy`, `sortOrder`, and `search` query parameters.  
> To prevent SQL injection, I implemented a strict **whitelist map** of valid sortable columns (`name`, `email`, `address`, `rating`).  
> All search filters use parameterized `$1, $2` queries with `LOWER() LIKE %search%`."

---

### Q8: "How does the Store Owner view only their store?"
* **Hinglish Samajh:** "Stores table me `owner_id` foreign key hai jo `users.id` ko point karta hai. Owner jab login hota hai, uski JWT ID se `stores WHERE owner_id = req.user.id` query hoti hai aur uske customer reviews render hote hain."
* **3 Keywords:** `Foreign Key Association`, `JWT Identity Binding`, `Customer Audit Trail`.
* **Speak in English:**
> "The `stores` table maintains an `owner_id` foreign key referencing `users.id`.  
> When a Store Owner requests their dashboard, the controller queries their assigned store using `req.user.id` from the verified JWT. It then joins the `ratings` table with the `users` table to display the names, emails, and ratings of every customer who reviewed their store."

---

### Q9: "How is the app hosted on Vercel?"
* **Hinglish Samajh:** "Vercel multi-service routing (`vercel.json`) use kiya hai. `/api/*` Express backend service ko route hota hai, aur `/(.*)` static React Vite bundle ko route hota hai. Same domain hone se CORS ka koi issue nahi hota."
* **3 Keywords:** `Unified Domain Rewrites`, `Serverless Function Bridge`, `Zero-CORS Architecture`.
* **Speak in English:**
> "I configured Vercel's multi-service architecture in `vercel.json`. Incoming requests to `/api/*` route to the Express serverless function entrypoint, while all client routes route to the static Vite build in `frontend/dist`. Because both live on the same domain, cross-origin CORS conflicts are eliminated."

---

### Q10: "If you had 1 more week, what would you improve?"
* **Hinglish Samajh:** "Rate limiting lagata (express-rate-limit), refresh token rotation implement karta, aur Redis caching add karta popular stores ke ratings ke liye."
* **3 Keywords:** `Redis Cache Layer`, `Refresh Token Rotation`, `API Rate Limiting`.
* **Speak in English:**
> "I would implement three production enhancements:  
> 1. **Redis Caching:** Cache average store ratings to reduce repetitive database aggregations.  
> 2. **Token Security:** Implement HTTP-only cookie-based refresh token rotation rather than storing the access token in localStorage.  
> 3. **Rate Limiting:** Add `express-rate-limit` on the rating submission and authentication endpoints to prevent brute-force attacks."
