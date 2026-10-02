# Food Marketplace

A multi-vendor food-ordering marketplace. Customers browse a menu, add items to a cart, and pay online. Vendors manage incoming orders, and admins oversee users, orders and payments.

## What's inside

| Part | Folder | Port | Purpose |
|---|---|---|---|
| API | `api/` | 4000 | Node.js/Express backend with PostgreSQL |
| Customer shop | `apps/customer-web-new/` | 5173 | Browse the menu, cart, checkout, order history |
| Vendor app | `apps/vendor-web-new/` | 5174 | Vendors view and update incoming orders |
| Admin dashboard | `apps/admin-web-new/` | 5175 | Overview, orders, users and payments |

The frontends are React apps built with Vite.

> The customer shop must run on port **5173**. After payment, Flutterwave sends customers back to `http://localhost:5173/payment-result`, which is set in `api/modules/payments/service.js`.

## Tech stack

- **Backend:** Node.js, Express, PostgreSQL, JSON Web Tokens (JWT) for login
- **Payments:** Flutterwave (hosted checkout)
- **Frontend:** React, Vite, React Router

## Backend modules

The API is split into modules under `api/modules/`:

- `identity`: register, login, role checks (`customer`, `vendor`, `admin`)
- `catalog`: products
- `ordering`: place and list orders
- `fulfilment`: order status updates (placed, confirmed, preparing, out for delivery, delivered, cancelled)
- `payments`: start and verify Flutterwave payments
- `notifications`: in-app notifications
- `admin`: admin-only stats, orders, users and payments

Main routes: `/api/auth`, `/api/products`, `/api/orders`, `/api/payments`, `/api/notifications`, `/api/admin`.

## Database

PostgreSQL with these tables: `users`, `products`, `orders`, `order_status_history`, `payments`, `notifications`.

The tables are not created by migration files yet, so you need to create them in your own database before running the API.

## Getting started

### 1. Requirements

- Node.js and npm
- PostgreSQL, running locally
- A Flutterwave account (use **test mode** keys while developing)

### 2. Configure the API

Create a file named `api/.env` and fill in your database connection settings, a `JWT_SECRET`, and your Flutterwave secret key. Check `api/db/pool.js` and `api/modules/payments/service.js` for the exact variable names the code reads.

The `.env` file is listed in `.gitignore`. **Never commit it.**

### 3. Install and run the API

```
cd api
npm install
npm run dev
```

You should see `API running on port 4000`.

### 4. Run the frontends

Open one terminal per app. Always start the customer shop first so it gets port 5173.

```
cd apps/customer-web-new
npm install
npx vite --port 5173 --strictPort
```

```
cd apps/vendor-web-new
npm install
npx vite --port 5174 --strictPort
```

```
cd apps/admin-web-new
npm install
npm run dev
```

Then open:

- Customer shop: http://localhost:5173
- Vendor app: http://localhost:5174
- Admin dashboard: http://localhost:5175

The API allows requests from ports 5173 to 5176.

## Creating an admin

Register a normal account first, then promote it:

```
cd api
node promoteAdmin.js your-email@example.com
```

Log in again afterwards, because the role is stored inside the login token.

## Testing payments

Use Flutterwave **test mode** keys, then pay with the test card from Flutterwave's testing docs:

- Card: `5531 8866 5214 2950`
- Expiry: `09/32`
- CVV: `564`
- PIN: `3310`
- OTP: `12345`

Test card details can change, so check https://developer.flutterwave.com/docs/integration-guides/testing-helpers if they stop working.

## Before deploying

- Change the payment redirect address in `api/modules/payments/service.js` from `localhost:5173` to your real site address.
- Replace the `API_URL` (`http://localhost:4000`) in each app's `src/api.js` with your hosted API address.
- Add your hosted site addresses to the CORS list in `api/index.js`.
- Use fresh secrets (JWT secret, database password, Flutterwave live keys) and keep them out of Git.