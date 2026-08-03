# Mobile Accessories Store

Node.js storefront for mobile-device accessories (Apple and Android): browse a filtered catalog,
configure a product for a specific device, manage a cart, and check out.

## Stack

- Express 4 + EJS server-rendered views
- `express-session` cart persistence (per browser session, in-memory store)
- Jest + Supertest for unit and HTTP tests, ESLint for linting
- No external services required — the catalog is static data in `src/data/products.js`

## Running

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # auto-restart via node --watch
npm test
npm run lint
```

## Features

- **Browse**: filter by platform (Apple/Android), specific device, category, brand, free-text search, and sort by price or rating.
- **Configure**: each product exposes device compatibility plus options (color, wattage, finish, pack size…) with price deltas and a live price preview.
- **Cart**: identical configurations merge, quantities are editable (0 removes), promo codes `SAVE10` / `MOBILE5`, standard vs express shipping, free standard shipping over $75.
- **Checkout**: shipping + payment validation (email format, Luhn card check, future expiry, CVC), then an order confirmation page with a masked card and order number.

## Layout

```
src/data/products.js  catalog, devices, categories, configurable options
src/catalog.js        filtering, sorting, lookups
src/cart.js           configuration validation, pricing, totals
src/orders.js         checkout validation and order placement
src/app.js            Express routes and view wiring
views/                EJS templates
tests/                Jest unit + Supertest integration tests
```

## JSON endpoints

- `GET /api/products` — same filters as the catalog page (`platform`, `device`, `category`, `brand`, `search`, `sort`)
- `GET /api/cart` — current session cart and totals

Payments are simulated; no card data is stored beyond the last four digits held in memory.
