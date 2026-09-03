# Alaska Tour & Travel — Full Stack

## Structure
- `frontend/` — all original pages/assets plus missing pages and API helper.
- `backend/` — Express REST API, JWT authentication, flight search, bookings, payments and bank-transfer endpoints.
- `backend/data.json` — local development data store (no database setup required).

## Run
1. Open a terminal in `backend`.
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:5000`

### Main flow
Home → Login/Register → Book Flight → Search Results → Booking Details → Payment.
Bank Transfer → Invoice.
All backend-protected actions use the JWT stored in `localStorage`.

For production, replace `data.json` with MongoDB/PostgreSQL and replace demo social-login pages with real OAuth providers.
