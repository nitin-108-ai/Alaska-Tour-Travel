# ✈️ Alaska Tour & Travel — Full-Stack Web Application

A full-stack travel booking application featuring flights, buses, trains, international holiday tours, dynamic booking & payment flows (UPI, Card, Bank Transfer), automated printable invoices, traveler profile management, and an administrative control panel with an app-download tracker.

---

## 🌐 LIVE WEBSITE

> **Important:** Do NOT use localhost as your public website URL. Deploy the application using the instructions below.

- **Public Frontend Website:** `https://YOUR-FRONTEND-URL`
  - *(GitHub Pages URL format for this repository: `https://nitin-108-ai.github.io/Alaska-Tour-Travel/`)*
  - Place this URL in your GitHub repository: **About → Website**.
- **Live Backend API:** `https://YOUR-BACKEND-URL`
  - *(Render Web Service URL format: `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/api`)*
- **API Health Check:** `https://YOUR-BACKEND-URL/health`

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
│   ├── international.html       # Global holiday destinations & bank transfer flow
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

## 💻 LOCAL DEVELOPMENT (Testing & Dev Only)

The URLs below are only valid on your private computer during local development and are never accessible to public users.

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm (bundled with Node)

### Running Locally
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

4. **Start the local backend server:**
   ```bash
   npm start
   ```
   *Local output: `Alaska Travel API running on port 5000 [development]`*

5. **Open local frontend:**
   - Open `frontend/index.html` in your browser, or run via VS Code Live Server at `http://127.0.0.1:5500/frontend/index.html`.
   - `frontend/config.js` automatically detects `localhost` / `127.0.0.1` and routes API requests to `http://localhost:5000/api`.

---

## 🛠️ PRODUCTION BACKEND DEPLOYMENT (Render)

The backend is configured with `render.yaml` for deployment on Render.

### Option A: Using Render Blueprint (Recommended)
1. Sign in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository: `https://github.com/nitin-108-ai/Alaska-Tour-Travel`.
4. Render automatically reads `render.yaml`:
   - Service Name: `alaska-tour-travel-backend`
   - Runtime: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Auto-generates a secure `JWT_SECRET`
5. Click **Apply**.

### Option B: Manual Web Service Setup on Render
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A long, secure random key)*
   - `FRONTEND_URL`: `https://nitin-108-ai.github.io`
5. Click **Deploy Web Service**.
6. Once deployed, note your public backend URL:
   `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/api`

---

## 🚀 PRODUCTION FRONTEND DEPLOYMENT (GitHub Pages)

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that automatically deploys the `./frontend` directory to GitHub Pages.

### Setup Steps:
1. Go to your repository on GitHub: `https://github.com/nitin-108-ai/Alaska-Tour-Travel`.
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push your changes to the `master` branch.
5. GitHub Actions will build and deploy the frontend.
6. The deployed application will be accessible at:
   `https://nitin-108-ai.github.io/Alaska-Tour-Travel/`

---

## ⚙️ Connecting Frontend to the Live Backend

1. Once your backend is deployed on Render, copy its public URL (e.g., `https://alaska-tour-travel-backend.onrender.com`).
2. Open `frontend/config.js` and set:
   ```javascript
   const PRODUCTION_BACKEND_URL = "https://<YOUR-RENDER-SERVICE-NAME>.onrender.com";
   ```
3. Commit and push:
   ```bash
   git add frontend/config.js
   git commit -m "configure production backend url"
   git push origin master
   ```
4. GitHub Actions will automatically re-deploy the frontend within ~60 seconds.

---

## 🔑 Environment Variables Reference

| Variable | Required in Production | Example / Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto-provided by Render | `10000` (Render) / `5000` (Local) | HTTP server listener port |
| `JWT_SECRET` | **Yes** | 32+ character random string | Signs and verifies traveler and admin JWT tokens |
| `FRONTEND_URL` | Optional | `https://nitin-108-ai.github.io` | Allowed CORS origins whitelist |
| `NODE_ENV` | Recommended | `production` | Enables production optimizations and security warnings |

---

## 🛡️ Security & Role System

- **Dual-Role Authentication:**
  - **Traveler (`role: user`):** Book flights/trains/buses/tours, complete UPI/card payments, view past bookings, update traveler profile.
  - **Administrator (`role: admin`):** View KPI dashboard (revenue, total bookings, active users), manage customer bookings, view live app download statistics.
- **Default Seed Accounts:**
  - Admin: `admin@alaska.com` / `admin123`
  - User: Register via `signin.html` or login at `logintravel.html`
- **Protected Endpoints:** All `/api/admin/*` endpoints require `Bearer` token with `role: admin`.
- **Brute-Force Rate Limiting:** 100 requests per 15 minutes on auth endpoints.

---

## 📜 Deployment Git Commands

```bash
git status
git add .
git commit -m "prepare project for public production deployment"
git push origin master
```
