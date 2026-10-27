# ROXILER LIVE CODING & MODIFICATION SURVIVAL KIT
**Panic-Proof Strategy:** Agar interviewer bole *"Screen share karo aur code likh ke dikhao / live change karo"*, toh ye survival manual follow karo.

---

## 🛑 GOLDEN RULE: THE 5-STEP "STALL & WIN" METHOD
Jab interviewer achanak koi code likhne bole aur dimaag blank ho jaye:

1. **Step 1 — Clarify (15 Seconds Time Milta Hai):**
   * Don't touch keyboard.
   * Say: *"Let me confirm the requirements first. So the input will be `[X]`, and we want to return `[Y]`, correct?"*
2. **Step 2 — Write Comments First (Pseudocode):**
   * Type comments before code:
   ```javascript
   // 1. Validate input array
   // 2. Sort by rating in descending order
   // 3. Slice the top 3 elements
   // 4. Return result
   ```
   * *Interviewer sochenge: "Bande ki thinking structured hai!"*
3. **Step 3 — Write the Simplest Possible Code (No Fancy Syntax):**
   * Standard `for` loop ya `filter` / `map` use karo.
4. **Step 4 — Dry Run with Sample Data:**
   * Bolo: *"Let me walk through this with a test case `[4, 5, 3]` to make sure there are no edge cases."*
5. **Step 5 — State Time & Space Complexity:**
   * Bolo: *"The time complexity is $O(N \log N)$ due to sorting, and space complexity is $O(1)$."*

---

## 💻 TOP 5 LIVE CODING QUESTIONS ROXILER ASKS

### Challenge 1: "Write a SQL query to get Top 3 Highest Rated Stores"
```sql
SELECT 
    s.id, 
    s.name, 
    ROUND(AVG(r.rating), 2) AS avg_rating,
    COUNT(r.id) AS total_reviews
FROM stores s
JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name
HAVING COUNT(r.id) > 0
ORDER BY avg_rating DESC
LIMIT 3;
```
* **Explanation to say:** *"We join `stores` with `ratings`, group by store ID, calculate `AVG(r.rating)`, sort in descending order, and limit to 3."*

---

### Challenge 2: "Write a query to find Users who have NEVER submitted any rating"
```sql
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN ratings r ON u.id = r.user_id
WHERE r.id IS NULL AND u.role = 'USER';
```
* **Explanation to say:** *"We do a `LEFT JOIN` on ratings. Any user who has never rated will have `r.id IS NULL`."*

---

### Challenge 3: "Implement a Debounce function in JavaScript (for search input)"
```javascript
function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage example:
const handleSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 300);
```
* **Explanation to say:** *"Debouncing postpones execution until a specified delay has passed since the last invocation. We use a closure to store the timer reference and clear it on every keystroke."*

---

### Challenge 4: "Add a new field (e.g. Phone Number) to Stores live in the app"
If they say: *"Can you add a `phone` field to the store?"*
Follow these exact 3 files in order:
1. **In Database (`backend/src/db/schema.sql`):**
   ```sql
   ALTER TABLE stores ADD COLUMN phone VARCHAR(20);
   ```
2. **In Controller (`backend/src/controllers/adminController.js` inside `addStore`):**
   ```javascript
   const { name, email, address, phone, ownerId } = req.body;
   // In SQL insert:
   // INSERT INTO stores (name, email, address, phone, owner_id) VALUES ($1, $2, $3, $4, $5)
   ```
3. **In Frontend Modal (`frontend/src/pages/AdminDashboard.jsx` inside Add Store modal):**
   ```jsx
   <div className="form-group">
     <label className="form-label">Phone Number</label>
     <input 
       type="text" 
       className="form-input" 
       value={storeForm.phone} 
       onChange={(e) => setStoreForm({...storeForm, phone: e.target.value})} 
     />
   </div>
   ```

---

### Challenge 5: "Calculate Average Rating from an Array of Rating Objects"
```javascript
function getAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  
  const total = ratings.reduce((sum, item) => sum + item.rating, 0);
  const avg = total / ratings.length;
  return Number(avg.toFixed(2));
}

// Test case:
console.log(getAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 5 }])); // 4.67
```

---

## 🛡️ EMERGENCY RECOVERY LINES (JAB ANSWER NA AAYE)

* **Agar syntax bhool gaye:**
  > *"I know the logical flow: we need to filter the active records and reduce the accumulator. The exact syntax for this specific helper escapes my memory right now, but conceptually we would do X, Y, and Z."*
* **Agar question samajh na aaye:**
  > *"Could you please give me a small input/output example for this use case? That will help me align the data structure properly."*
* **Agar code me bug aa jaye:**
  > *"Let me trace through line by line with `console.log` on the input payload. Ah, here on line 14, the object is undefined before the async promise resolves. Let me add an `await`."* (Interviewers LOVE this—it shows real debugging skills!).
