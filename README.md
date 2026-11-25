# BiteBay: food ordering app

A full-stack food ordering app. Customers browse restaurants, fill a cart and place orders. Restaurant owners manage their menu and orders, and get new orders live through Socket.io.

## Features

- Customer and restaurant-owner accounts, with a dashboard for each
- Restaurant profiles with images, menus with categories, search, and a cart
- Orders with live status updates (placed, confirmed, preparing, ready, delivered, cancelled)
- A Security page: two-step sign-in, change password, and recent security activity

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, lucide-react |
| Backend | Node.js, Express 4, MongoDB with Mongoose 8, Socket.io, Multer (image uploads) |
| Sign-in and security | Argon2id (`argon2`), TOTP codes (`otplib`, `qrcode`), JWT (`jsonwebtoken`), `helmet`, `express-rate-limit` |

`bcryptjs` is kept only to check passwords of accounts created before the Argon2id upgrade.

## How sign-in works

| Topic | Behaviour |
|---|---|
| Identity | Username and password. There is no e-mail anywhere in the app. |
| Passwords | Argon2id. 8 to 128 characters, at least one letter and one number, no common passwords, not containing the username. |
| Restaurant owners | **Two-step sign-in is required.** Until it is set up, they only get a limited token that works on the setup routes. |
| Customers | Two-step sign-in is optional and can be switched on or off on the Security page. |
| Tokens | Short-lived (60 minutes by default). Logout, a password change or reset, and turning MFA on or off revoke every older token. |
| Wrong password or code | "N attempts remaining", then the account is locked for 15 minutes. Unknown usernames get the same counter, so nothing reveals which accounts exist. |
| Forgot password | Username, an authenticator code and a new password. Accounts without two-step sign-in cannot use this (there is no e-mail). |
| Audit log | Logins, failures, lockouts, MFA and password changes, denied access and order status changes go into a hash-chained log. Check it with `node scripts/verifyAuditLog.js`. |

Other protections: orders can only be read by the customer who placed them or by that restaurant, menu items can't be added to another restaurant, order status can only move forward step by step, MongoDB operator keys (`$...`) are rejected in every request, and the API is rate limited per IP.

## Getting started

Requirements: Node.js 18 or newer, MongoDB, npm.

```bash
# backend
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run dev               # http://localhost:5000

# frontend (second terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Make a `JWT_SECRET` (at least 32 random characters, or the server will not start):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Settings in `backend/.env`:

| Variable | Default | Meaning |
|---|---|---|
| `MONGODB_URI` | required | MongoDB connection string |
| `JWT_SECRET` | required | Signing key, 32+ characters |
| `JWT_EXPIRES_IN` | `60m` | Length of a normal login |
| `TOTP_ISSUER` | `Food Ordering` | Name shown in the authenticator app |
| `MAX_FAILED_ATTEMPTS` / `LOCKOUT_MINUTES` | `5` / `15` | Lockout rule |
| `PORT` | `5000` | Backend port |
| `TRUST_PROXY` | unset | Set to `1` only behind a reverse proxy you control |

### First use

1. Open the frontend and create a **restaurant** account. You will be asked to set up two-step sign-in with an authenticator app (scan the QR code, type the code).
2. Add menu items from the restaurant dashboard.
3. Create a **customer** account in another browser and place an order.

### Useful scripts (run from `backend/`)

| Command | What it does |
|---|---|
| `node seed.js` | Fills an **empty test database** with sample restaurants. It deletes existing restaurants, menu items and restaurant owners, and prints a random password. |
| `node scripts/migrate-to-username.js` | One-time migration for a database created before the username sign-in. Back it up first. |
| `node scripts/reset-password.js <username>` | Sets a new password for a locked-out account directly in the database. Use `--list` to see usernames. |
| `node scripts/verifyAuditLog.js` | Checks that the audit log has not been edited or cut. |

## Main API routes

| Route | Who |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/recover` | Everyone |
| `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/mfa/setup`, `POST /api/auth/mfa/enable` | Any signed-in user, including a limited token |
| `POST /api/auth/mfa/disable`, `PUT /api/auth/password`, `GET /api/auth/activity` | Full sign-in only |
| `/api/restaurants`, `/api/menu`, `/api/orders` | Customers and restaurant owners, with role and ownership checks |

## Project structure

```
backend/
  config/        database, environment check, socket server
  controllers/   auth, restaurants, menu, orders
  middleware/    auth (scopes, roles), rate limiting, input sanitising, uploads
  models/        User, Restaurant, MenuItem, Order, AuditLog
  routes/
  scripts/       migrate-to-username, reset-password, verifyAuditLog
  utils/         password, totp, token, audit, attempts, passwordPolicy
  index.js  seed.js  clearAll.js
frontend/
  src/           components, context, pages, services
SECURITY_REVIEW.md
```

## Known limitations

- Open findings from the review: file upload checks (#6), order validation (#7), restaurant list filters (#11) and dependency updates (#13). See [SECURITY_REVIEW.md](SECURITY_REVIEW.md).
- The login token is kept in `localStorage`. An HttpOnly cookie would need CSRF protection as well.
- Authenticator secrets are stored unencrypted, and there are no backup codes.
- Rate limits are stored in memory. With several server instances, use a shared store such as Redis.
- There is no e-mail recovery. A customer without two-step sign-in cannot reset a forgotten password on their own.
