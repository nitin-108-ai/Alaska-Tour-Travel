# ✈️ Alaska Tour & Travel — Full-Stack Web Application

A full-stack travel booking application featuring flights, buses, trains, international holiday tours, dynamic booking & payment flows (UPI, Card, Bank Transfer), automated PDF/print invoices, traveler profile management, and an administrative control panel with an app-download tracker.

---

## 🌐 Production Architecture & Live URLs

- **Frontend (GitHub Pages):** [https://nitin-108-ai.github.io/Alaska-Tour-Travel/](https://nitin-108-ai.github.io/Alaska-Tour-Travel/)
- **Backend API (Render Web Service):** [https://alaska-tour-travel-backend.onrender.com/api](https://alaska-tour-travel-backend.onrender.com/api)
- **API Health Endpoint:** [https://alaska-tour-travel-backend.onrender.com/api/health](https://alaska-tour-travel-backend.onrender.com/api/health)

```
[ Traveler / Admin Browser ]
             │
             ├──► GitHub Pages (Static Frontend: HTML5 / CSS3 / Vanilla JS)
             │        │
             │        └── config.js (Resolves API base URL dynamically)
             │
             └──► Render (Node.js + Express REST API + JWT + CORS)
                      │
                      └── backend/data.json (Seeded In-Memory / File Store)
```

---

## 📁 Project Structure

```
Alaska-Tour-Travel/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml     # Automated GitHub Pages CI/CD workflow
├── backend/
│   ├── src/
│   │   └── server.js            # Express server, auth, bookings, payments & admin API
│   ├── .env.example             # Template for required environment variables
│   ├── data.json                # Local data store (auto-seeded on fresh boots)
│   └── package.json             # Node dependencies & engine specifications
├── frontend/
│   ├── config.js                # Centralized production API configuration & runtime switcher
│   ├── api.js                   # Unified API client with cold-start error handling
│   ├── script.js                # Mobile navigation drawer & interactive navbar effects
│   ├── index.html               # Main landing page
│   ├── MAIN.html                # Explore & flights booking portal
│   ├── MAIN.CSS                 # Core stylesheet & UI design tokens
│   ├── admin.html               # Administrative dashboard & download tracker
│   ├── profile.html / .js       # User profile management & past booking history
│   ├── bookti.html              # Flight search & ticket booking UI
│   ├── seacht.html              # Search results & airline itinerary list
│   ├── pa.html                  # Passenger details collection
│   ├── paymen.html              # Payment gateway selection (Card / UPI / NetBanking)
│   ├── inv.html                 # Booking confirmation & printable invoice
│   ├── upi.html                 # Interactive simulated UPI QR payment flow
│   ├── bus.html                 # Bus reservation booking flow
│   ├── train.html               # IRCTC-style railway booking flow
│   ├── tour.html                # Domestic vacation packages
│   ├── international.html       # Global holiday destinations
│   ├── signin.html              # User registration
│   ├── logintravel.html         # User & Administrator login
│   ├── contact.html             # Customer support & inquiry form
│   └── term.html                # Terms of Service & Cancellation policies
├── index.html                   # Repository root fallback redirect for GitHub Pages
├── render.yaml                  # Infrastructure-as-code deployment blueprint for Render
├── README.md                    # Comprehensive documentation & deployment guide
└── .gitignore                   # Git exclusion rules for secrets and node_modules
```

---

## 🚀 1. Local Development Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm (installed with Node)

### Step-by-Step
1. **Clone the repository:**
   ```bash
   git clone https://github.com/nitin-108-ai/Alaska-Tour-Travel.git
   cd Alaska-Tour-Travel
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure local environment variables:**
   Create `backend/.env` (or copy from `backend/.env.example`):
   ```env
   PORT=5000
   JWT_SECRET=supersecretjwtkey_local_development_only
   FRONTEND_URL=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # Server starts on http://localhost:5000
   ```

5. **Launch the frontend:**
   - Open `frontend/index.html` directly in any web browser, or serve it using VS Code Live Server (`http://localhost:5500`).
   - `frontend/config.js` automatically detects `localhost` or `127.0.0.1` and points API requests to `http://localhost:5000/api`.

---

## 🛠️ 2. Backend Deployment (Render)

The backend is configured with `render.yaml` for 1-click or repository-linked deployment on Render.

### Option A: Using Blueprint (Recommended)
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect the GitHub repository: `https://github.com/nitin-108-ai/Alaska-Tour-Travel`.
4. Render detects `render.yaml` and provisions:
   - Service Name: `alaska-tour-travel-backend`
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Auto-generated `JWT_SECRET`

### Option B: Manual Web Service Setup
1. Click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. Add Environment Variables (see table below).
5. Click **Deploy Web Service**.
6. Copy your service URL (e.g., `https://alaska-tour-travel-backend.onrender.com`).

---

## 📦 3. Frontend Deployment (GitHub Pages)

The repository includes an automated GitHub Actions deployment workflow at `.github/workflows/deploy-pages.yml`.

### Enable GitHub Pages in your repository:
1. Go to your GitHub repository: `https://github.com/nitin-108-ai/Alaska-Tour-Travel`.
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. When you push to the `master` branch, GitHub Actions will automatically bundle and deploy the `./frontend` directory directly to GitHub Pages.
5. Your live site will be available at:
   `https://nitin-108-ai.github.io/Alaska-Tour-Travel/`

---

## 🔑 4. Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto | `5000` (Local) / Auto-assigned by Render | Port for Express listener |
| `JWT_SECRET` | **Yes** | Auto-generated on Render / Strong random string | Signing & verifying JWT user/admin session tokens |
| `FRONTEND_URL` | Optional | `https://nitin-108-ai.github.io` | Comma-separated allowed CORS origins |

> [!NOTE]
> `server.js` dynamically permits requests from `https://nitin-108-ai.github.io`, all `*.github.io` subdomains, and local dev servers even if `FRONTEND_URL` is omitted.

---

## ⚙️ 5. Configuring the Production API URL

The frontend uses `frontend/config.js` to define the centralized backend URL:

```javascript
// frontend/config.js
window.APP_CONFIG = {
  // Replace with your active Render web service URL:
  API_BASE_URL: "https://alaska-tour-travel-backend.onrender.com/api",
  DEMO_MODE: true,
  VERSION: "1.0.0"
};
```

### Dynamic Switcher / Testing without Re-deploying:
If your backend is deployed at a different Render URL, you can switch it instantly from the browser developer console or localStorage without editing any files:
```javascript
// Run in browser console:
localStorage.setItem('alaskaApiUrl', 'https://your-custom-backend.onrender.com/api');
location.reload();

// To clear:
localStorage.removeItem('alaskaApiUrl');
location.reload();
```

---

## 🔄 6. How to Connect GitHub Pages to Render

1. Deploy the backend on Render and confirm that the health check responds:
   ```bash
   curl https://<YOUR-RENDER-APP>.onrender.com/api/health
   # Response: {"status":"healthy","service":"Alaska Tour & Travel API",...}
   ```
2. If your Render URL differs from `https://alaska-tour-travel-backend.onrender.com/api`, open `frontend/config.js` and update `API_BASE_URL`.
3. Commit and push the changes:
   ```bash
   git add frontend/config.js
   git commit -m "update production backend url"
   git push origin master
   ```
4. GitHub Actions will rebuild the frontend in ~60 seconds.
5. Open `https://nitin-108-ai.github.io/Alaska-Tour-Travel/` and verify that login, search, and bookings connect seamlessly.

---

## 🧪 7. Testing the Backend API

You can test all endpoints using `curl` or Postman:

```bash
# 1. Health check
curl -X GET http://localhost:5000/api/health

# 2. Flight Search
curl -X GET "http://localhost:5000/api/flights/search?from=DEL&to=BOM&date=2026-09-10"

# 3. App Download Counter
curl -X POST http://localhost:5000/api/app-download -H "Content-Type: application/json" -d '{"platform":"android"}'

# 4. Traveler Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","phone":"9876543210"}'

# 5. Admin Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alaska.com","password":"admin123"}'
```

---

## 🛡️ 8. Security & Roles

- **Role-Based Authentication:**
  - **Traveler Role:** Can search flights/buses/trains, create bookings, process payments, download invoices, and manage personal profiles.
  - **Admin Role:** Can view all system bookings, change booking statuses (`CONFIRMED`, `CANCELLED`, `COMPLETED`), access the live analytics dashboard, and inspect the mobile app download counters.
- **Default Seed Accounts:**
  - **Admin:** `admin@alaska.com` / `admin123`
  - **Traveler:** Create a new traveler account via `signin.html` or login at `logintravel.html`.
- **Protected Endpoints:** Admin routes enforce `authenticateToken` + `requireAdmin` middleware.
- **Rate Limiting:** Protects `/api/auth/login` and `/api/auth/register` against brute-force attempts (100 requests per 15 minutes).
- **Graceful Cloud Restarts:** Render free tier spins down inactive services after 15 minutes. `frontend/api.js` detects spin-up delays and prompts travelers politely while the server wakes up.

---

## 📜 9. Git Commands to Commit & Push

```bash
# 1. Verify changed files
git status

# 2. Stage all production configuration files
git add .

# 3. Commit changes
git commit -m "prepare project for production deployment"

# 4. Push to master branch
git push origin master
```

---

## 📄 License & Attribution
Developed for **Alaska Tour & Travel**. All rights reserved.
