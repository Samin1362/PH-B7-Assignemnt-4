# GearUp — Sports & Outdoor Gear Rental API

A production-style REST API for renting sports and outdoor gear. Customers browse and rent gear, providers list gear and fulfil orders, and admins manage the platform. Payments are handled with real Stripe integration.

- **Live API:** https://ph-b7-assignemnt-4.vercel.app
- **API Docs (Postman):** `TODO_ADD_YOUR_PUBLISHED_POSTMAN_LINK` — the collection is included in the repo at [`postman/GearUp.postman_collection.json`](./postman/GearUp.postman_collection.json) (import it into Postman)

> Health check: https://ph-b7-assignemnt-4.vercel.app/api/v1/health

## Tech Stack

- **Runtime:** Node.js 20, Express 5, TypeScript (ESM)
- **Database:** PostgreSQL via Prisma 7 (`@prisma/adapter-pg` driver adapter)
- **Auth:** JWT (access + refresh) with bcrypt password hashing
- **Validation:** Zod
- **Payments:** Stripe (PaymentIntents + signature-verified webhook)
- **Deployment:** Vercel

## Features

- Role-based auth for 3 roles: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Gear catalog with search, filters, pagination, and sorting
- Provider gear management and order fulfilment with a status state machine
- Rental orders with a full lifecycle: `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED` (and `CANCELLED`)
- Real Stripe payments with webhook-driven status updates
- Gear reviews (only after a rental is returned)
- Admin management of users (suspend/activate), gear, and rentals
- Structured success (`{ success, message, meta?, data }`) and error (`{ success, message, errorDetails }`) responses
- Request logging, health check, and basic auth rate limiting

## Getting Started

### Prerequisites

- Node.js **20.x** (required by Prisma 7 — see `.nvmrc`)
- A PostgreSQL database
- A Stripe account (test mode is fine)

### 1. Install

```bash
nvm use          # switches to Node 20
npm install      # runs `prisma generate` automatically (postinstall)
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Allowed CORS origin (your frontend URL) |
| `PORT` | Server port (default `5001`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost (e.g. `12`) |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | e.g. `1d` |
| `JWT_REFRESH_EXPIRES_IN` | e.g. `30d` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `ADMIN_EMAIL` | Seed admin email (optional; defaults to `admin@gearup.com`) |
| `ADMIN_PASSWORD` | Seed admin password (optional; defaults to `Admin@1234`) |

### 3. Set up the database

```bash
npx prisma migrate deploy   # apply migrations
npm run db:seed             # seed admin, categories, sample providers + gear
```

### 4. Run

```bash
npm run dev     # development (tsx watch)
# or
npm start       # production start
```

The server listens on `http://localhost:5001`.

## Default Credentials (from the seed)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gearup.com` | `Admin@1234` |
| Provider | `trailhead.rentals@gearup.com` | `Password@123` |
| Provider | `summit.gear@gearup.com` | `Password@123` |

Customers register themselves via `POST /api/v1/auth/register`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Generate Prisma client + type-check/compile |
| `npm start` | Start the server |
| `npm run db:seed` | Seed the database (idempotent) |

## API Overview

Base path: `/api/v1`

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Users | `GET /users/me`, `PATCH /users/me` |
| Categories | `GET /categories`, `POST /categories`*, `PATCH /categories/:id`*, `DELETE /categories/:id`* |
| Gear (public) | `GET /gear`, `GET /gear/:id`, `GET /gear/:id/reviews` |
| Provider gear | `POST /provider/gear`, `GET /provider/gear`, `PATCH /provider/gear/:id`, `DELETE /provider/gear/:id` |
| Rentals | `POST /rentals`, `GET /rentals`, `GET /rentals/:id`, `PATCH /rentals/:id/cancel` |
| Provider orders | `GET /provider/orders`, `PATCH /provider/orders/:id` |
| Payments | `POST /payments/create`, `GET /payments`, `GET /payments/:id`, `POST /payments/confirm` (Stripe webhook) |
| Reviews | `POST /reviews` |
| Admin* | `GET /admin/users`, `PATCH /admin/users/:id`, `GET /admin/gear`, `GET /admin/rentals` |
| System | `GET /`, `GET /api/v1/health` |

\* admin-only. Full request/response examples are in the Postman collection.

## Stripe Payments

1. Customer places a rental → provider confirms it (`CONFIRMED`).
2. `POST /payments/create` creates a Stripe PaymentIntent and returns a `clientSecret`.
3. On successful payment, Stripe calls `POST /api/v1/payments/confirm` (signature-verified), which sets the order to `PAID` and the payment to `COMPLETED`.

For local webhook testing:

```bash
stripe listen --forward-to localhost:5001/api/v1/payments/confirm
# set the printed whsec_... as STRIPE_WEBHOOK_SECRET in .env
stripe payment_intents confirm <intent_id> -d payment_method=pm_card_visa
```

## Deployment (Vercel)

The app is configured for Vercel via `vercel.json` (all traffic is rewritten to the Express app exported from `api/index.ts`).

1. Push the repo to GitHub and import the project into Vercel (root directory = `Assignment`).
2. Add all environment variables from the table above in **Project Settings → Environment Variables**.
3. Deploy. Vercel runs `npm install` (which runs `prisma generate` via `postinstall`).
4. After the first deploy, run the seed once against the production database (locally with the production `DATABASE_URL`): `npm run db:seed`.
5. In the **Stripe Dashboard → Developers → Webhooks**, add an endpoint pointing to `https://<your-app>.vercel.app/api/v1/payments/confirm`, then copy its signing secret into the Vercel `STRIPE_WEBHOOK_SECRET` variable and redeploy.
6. Update the **Live API** and **Postman** links at the top of this README.

## Project Structure

```
Assignment/
├── api/index.ts            # Vercel serverless entry (exports the Express app)
├── prisma/
│   ├── schema/             # Multi-file Prisma schema
│   ├── migrations/
│   └── seed.ts             # Idempotent seed script
├── postman/                # Postman collection
├── src/
│   ├── app.ts              # Express app (middleware, routes)
│   ├── server.ts           # HTTP server bootstrap
│   ├── config/
│   ├── lib/                # prisma + stripe clients
│   ├── middlewares/        # auth, validation, error handling, logging, rate limit
│   ├── modules/            # feature modules (auth, user, category, gear, rental, payment, review, admin)
│   ├── routes/             # central router
│   └── utils/              # AppError, catchAsync, sendResponse, jwt, password
└── vercel.json
```
