# ✈️ Alaska Tour & Travel — Full-Stack Progressive Web App (PWA)

A production-ready, full-stack travel booking Progressive Web App (PWA) featuring flights, buses, trains, international holiday tours, dynamic booking & payment flows (UPI QR, Card, Bank Transfer), automated printable invoices, traveler profile management, administrative control panel, and cross-device installability.

---

## 🌐 PRODUCTION WEBSITE

> **Important:** Do NOT use localhost as your public website URL. The production application is served online through GitHub Pages and Render.

- **Public PWA Website:** [https://nitin-108-ai.github.io/Alaska-Tour-Travel/](https://nitin-108-ai.github.io/Alaska-Tour-Travel/)
  - Configured for cross-platform PWA installation across mobile, tablet, desktop, and Smart TV browsers.
- **Production Backend API:** `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/api`
- **Backend Health Check:** `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com/health`

---

## 📱 PWA INSTALLATION & CROSS-DEVICE EXPERIENCE

The Alaska Tour & Travel application is built as a standards-compliant Progressive Web App (PWA) supporting standalone full-screen operation, offline app shell caching, and responsive layouts from 320px smartphones to 4K Smart TVs.

### 🤖 Android Installation (Google Chrome / Edge / Samsung Internet)
1. Open [https://nitin-108-ai.github.io/Alaska-Tour-Travel/](https://nitin-108-ai.github.io/Alaska-Tour-Travel/) in your Android browser.
2. A bottom install banner **"Alaska Tour App — Install on your home screen"** will appear automatically, or you can tap the **"Install App"** button in the navigation header.
3. Tap **Install** when prompted by the browser dialog.
4. The Alaska Tour & Travel icon will be added to your home screen and app drawer, launching in native standalone mode with splash screen support.

### 🍎 iOS / iPadOS Installation (Apple Safari)
1. Open [https://nitin-108-ai.github.io/Alaska-Tour-Travel/](https://nitin-108-ai.github.io/Alaska-Tour-Travel/) in **Safari** on your iPhone or iPad.
2. Tap the **Share** button (the square with an arrow pointing upward) in the Safari navigation bar.
3. Scroll down the share menu and tap **"Add to Home Screen"**.
4. Confirm by tapping **Add** in the upper-right corner.
5. The app will launch with edge-to-edge full-screen display, custom apple touch icons, and translucent status bar integration.

### 💻 Windows Installation (Google Chrome / Microsoft Edge)
1. Open the website in Google Chrome or Microsoft Edge on Windows 10/11.
2. An **App Available** install icon ($\oplus$ or computer monitor icon) will appear on the right side of the browser URL address bar, and an **"Install App"** button is visible in the top navbar.
3. Click **Install**.
4. The app opens in its own standalone desktop window with a custom title bar and can be pinned to the Windows Taskbar and Start Menu.

### 🖥️ Desktop Installation (macOS & Linux)
- **macOS (Chrome / Edge / Safari Sonoma+):**
  - In Chrome/Edge: Click the install icon in the URL bar or menu **More Tools → Install Alaska Tour & Travel**.
  - In Safari (macOS Sonoma 14+): Choose **File → Add to Dock**.
- **Linux (Chrome / Chromium):**
  - Click the install button in the address bar or the header **"Install App"** button to register it into your desktop environment launcher (GNOME, KDE, etc.).

### 📺 Smart TV & Large Screen Browser Usage
- The application includes responsive layouts tailored for 1080p, 1440p, and 4K displays.
- Large touch/click targets (minimum 44x44px), readable typography (`rem`-based scaling), and no reliance on mouse-hover-only dropdowns ensure usability with TV remotes, trackpads, or wireless gamepads.
- Supported in modern WebKit/Chromium-based Smart TV browsers (such as Samsung Tizen, LG webOS, Android TV Chrome, Fire TV Silk).

---

## ⚡ OFFLINE CAPABILITIES & LIMITATIONS

The application features a resilient Service Worker (`sw.js`) and an interactive `offline.html` fallback.

### ✅ What Works Offline:
- **Application Shell:** The homepage, flight search, tour guides, bus listings, and UI assets load instantly from cache even without an active internet connection.
- **Repeat Visits:** Static stylesheets (`MAIN.css`, `bookti.css`, `logins.css`), JavaScript libraries, icons, and fonts are served using a cache-first/stale-while-revalidate strategy for lightning-fast loads.
- **Offline Status Notifications:** When internet connection drops, an unobtrusive floating banner informs the user that cached pages are being browsed.

### ⚠️ Offline Limitations (Requires Active Internet Connection):
The application communicates with a secure live backend and **NEVER** fakes or caches sensitive transactions offline:
- 🔐 **User Registration & Login:** Password verification and JWT token issuance require live authentication.
- ✈️ **Flight, Bus, and Train Search & Availability:** Up-to-date seat inventory requires active API connectivity.
- 💳 **Payments & Checkout:** Card, UPI, and Bank Transfers require live backend processing.
- 📄 **Invoice Generation:** Official booking records and invoice persistence require connection to the backend database.
- 👤 **Traveler Profile & Booking History:** Live database sync requires network access.
- 🛡️ **Administrative Controls:** Admin KPI metrics and booking management are strictly network-only to prevent stale or insecure cached data.

If an API request is initiated while offline, the system safely surfaces a clear notification rather than falsely confirming any booking.

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
│   ├── data.json                # Local database store (auto-seeded on fresh boots)
│   └── package.json             # Node dependencies & start script
├── frontend/
│   ├── manifest.json            # W3C PWA Web App Manifest
│   ├── sw.js                    # Production Service Worker (caching & offline manager)
│   ├── pwa.js                   # PWA runtime client, install prompt & offline detector
│   ├── offline.html             # Offline fallback UI with connection retry
│   ├── icon-192.png             # PWA 192x192 icon
│   ├── icon-512.png             # PWA 512x512 standard icon
│   ├── icon-512-maskable.png    # PWA 512x512 maskable icon for Android adaptive icons
│   ├── apple-touch-icon.png     # 180x180 high-DPI iOS home screen icon
│   ├── favicon.svg              # Scalable vector brand icon
│   ├── config.js                # Centralized API configuration (switches dev vs prod)
│   ├── api.js                   # Unified API client with cold-start error handling
│   ├── script.js                # Mobile navigation drawer & interactive navbar
│   ├── index.html               # Main landing page
│   ├── MAIN.html                # Explore & flights booking portal
│   ├── MAIN.CSS                 # Core responsive design tokens & PWA styles
│   ├── admin.html               # Admin control panel & app download tracker
│   ├── profile.html / .js       # User profile management & past booking history
│   ├── bookti.html / .css       # Flight search & ticket booking UI
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
│   └── term.html / .css         # Terms of Service & Cancellation policies
├── index.html                   # Repository root fallback redirect for GitHub Pages
├── render.yaml                  # Infrastructure-as-code deployment blueprint for Render
├── README.md                    # Comprehensive documentation & deployment guide
└── .gitignore                   # Git exclusion rules for secrets and node_modules
```

---

## 💻 LOCAL DEVELOPMENT

The URLs below are only valid on your private computer during local development and are never accessible to public users.

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm (bundled with Node)

### Step-by-Step Setup
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
   *Terminal output: `Alaska Travel API running on port 5000 [development]`*

5. **Open local frontend:**
   - Open `frontend/index.html` in your browser, or run via VS Code Live Server at `http://127.0.0.1:5500/frontend/index.html`.
   - `frontend/config.js` automatically detects `localhost` / `127.0.0.1` and points API requests to `http://localhost:5000/api`.

---

## 🛠️ PRODUCTION BACKEND DEPLOYMENT (Render)

The backend is configured with `render.yaml` for deployment on [Render](https://render.com/).

### Using Render Blueprint (Recommended)
1. Sign in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository: `https://github.com/nitin-108-ai/Alaska-Tour-Travel`.
4. Render automatically reads `render.yaml`:
   - **Service Name:** `alaska-tour-travel-backend`
   - **Runtime:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Auto-generates a secure `JWT_SECRET`
5. Click **Apply**.
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

## ⚙️ API CONFIGURATION & CONNECTION

To link your live frontend to your deployed Render backend:

1. Open `frontend/config.js`.
2. Set `PRODUCTION_BACKEND_URL` to your live Render service:
   ```javascript
   const PRODUCTION_BACKEND_URL = "https://<YOUR-RENDER-SERVICE-NAME>.onrender.com";
   ```
3. Commit and push to GitHub:
   ```bash
   git add frontend/config.js
   git commit -m "configure production backend url"
   git push origin master
   ```
4. GitHub Actions will automatically redeploy the updated frontend within ~60 seconds.

---

## 🔑 ENVIRONMENT VARIABLES REFERENCE

| Variable | Required in Production | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto-provided by Render | `10000` (Render) / `5000` (Local) | HTTP server listener port |
| `JWT_SECRET` | **Yes** | 32+ character random string | Signs and verifies user & admin JWT tokens |
| `FRONTEND_URL` | Optional | `https://nitin-108-ai.github.io` | Allowed CORS origins whitelist |
| `NODE_ENV` | Recommended | `production` | Enables production mode and security warnings |

---

## 🛡️ SECURITY & AUTHENTICATION

- **Dual-Role RBAC:**
  - **Traveler (`role: user`):** Book trips, process payments, view booking history, update profile.
  - **Administrator (`role: admin`):** View KPI dashboard, manage bookings, inspect live PWA app download counts.
- **Default Seed Accounts:**
  - Admin: `admin@alaska.com` / `admin123`
  - Traveler: Register via `signin.html` or login at `logintravel.html`
- **PWA Cache Privacy:** Service worker explicitly ignores `/api/*` and any HTTP POST/PUT/DELETE requests. No private traveler details, passwords, or booking tokens are ever saved to the browser service worker cache.
- **Protected Endpoints:** All `/api/admin/*` endpoints strictly require `Bearer` authorization header with admin role.

---

## 📜 GIT WORKFLOW

```bash
git status
git add .
git commit -m "feat: convert alaska tour & travel into installable production PWA"
git push origin master
```
