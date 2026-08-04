# Mobile Accessories Store

Storefront for mobile-device accessories (Apple and Android): browse a filtered catalog, configure a
product for a specific device, manage a cart, and check out. React single-page frontend on an Express
JSON API.

## Stack

- **Frontend**: React 19 + React Router 7, bundled with Vite (`frontend/`)
- **Backend**: Express 5 JSON API, cart kept in `express-session` (in-memory store)
- Jest + Supertest for API/unit tests, ESLint (with react/react-hooks rules) for linting
- No external services required — the catalog is static data in `src/data/products.js`

## Running

```bash
npm install      # also installs frontend deps
npm start        # builds the React app, then serves it + the API on http://localhost:3000
npm test
npm run lint
```

For frontend development with hot reload, run the API and the Vite dev server in two terminals:

```bash
npm run dev:api  # Express on :3000
npm run dev:web  # Vite on :5173, proxying /api and /img to :3000
```

## Features

- **Browse**: filter by platform (Apple/Android), specific device, category, brand, free-text search, and sort by price or rating — all driven by URL query params, so filtered views are shareable.
- **Configure**: device compatibility plus options (color, wattage, finish, pack size…) with price deltas and a live price preview.
- **Cart**: identical configurations merge, quantities editable (0 removes), promo codes `SAVE10` / `MOBILE5`, standard vs express shipping, free standard shipping over $75.
- **Checkout**: field-level validation (email format, Luhn card check, future expiry, CVC) returned as `fieldErrors`, then an order confirmation with masked card and order number.

## Layout

```
src/data/products.js   catalog, devices, categories, configurable options
src/catalog.js         filtering, sorting, lookups
src/cart.js            configuration validation, pricing, totals
src/orders.js          checkout validation and order placement
src/api.js             JSON API router
src/app.js             Express wiring: session, /api, static assets, SPA fallback
frontend/src/pages/    React screens (catalog, product, cart, checkout, confirmation)
frontend/src/CartContext.jsx  cart state shared across screens
tests/                 Jest unit + Supertest API tests
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/catalog` | platforms, devices, categories, brands |
| GET | `/api/products` | filters: `platform`, `device`, `category`, `brand`, `search`, `sort` |
| GET | `/api/products/:id` | product plus its compatible devices |
| GET | `/api/cart` | items, shipping method, promo code, totals |
| POST | `/api/cart/items` | `{ productId, deviceId, selections, quantity }` |
| PATCH/DELETE | `/api/cart/items/:key` | change quantity / remove line |
| PUT | `/api/cart/promo` | `{ code }` (`null` clears) |
| PUT | `/api/cart/shipping` | `{ shipping: 'standard' \| 'express' }` |
| POST | `/api/checkout` | places the order, `422` with `fieldErrors` on invalid input |
| GET | `/api/orders/:id` | placed order |

Payments are simulated; no card data is stored beyond the last four digits held in memory.
