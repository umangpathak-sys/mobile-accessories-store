---
name: testing-storefront
description: How to run and end-to-end test the Express/EJS mobile accessories storefront (browse filters, product configuration, cart math, checkout).
---

# Testing the mobile accessories storefront

## Running it
- `npm start` serves on port 3000 (`npm run dev` for watch mode). A stale instance may already hold the
  port — check with `ss -ltnp | grep 3000` and kill it before restarting, otherwise the new process fails.
- No credentials, no database, no env vars needed. `SESSION_SECRET` is optional.
- State lives in `express-session` MemoryStore + an in-process `orders` Map, so a server restart wipes carts
  and order history. Browser cookies may still point at a dead session, so an old cart can appear to survive
  a restart — clear the cart via the UI before starting a measured run.

## Where the logic lives (useful for computing expected values)
- `src/data/products.js` — products, per-product `devices` compatibility lists, options with `priceDelta`.
- `src/cart.js` — `configureItem` (validation + unit price), merge key = `productId|deviceId|opt:value…`,
  `summarize` (promos, shipping, tax). Constants: standard $5.99, express $14.99, free standard shipping
  when the **discounted** subtotal ≥ $75, tax 8.25% applied to the discounted subtotal, shipping untaxed.
- `src/orders.js` — checkout validation (Luhn, `MM/YY` future expiry, 3–4 digit CVC, email regex).
- Views expose `data-testid` attributes (`device-filter`, `configured-price`, `subtotal`, `total`,
  `config-error`, `cart-error`, `place-order`, `order-id`, …) — prefer those as selectors.

## Adversarial cases worth re-testing after any pricing change
- A percentage promo that drops the discounted subtotal below $75 must make standard shipping revert from
  Free to $5.99 (e.g. subtotal $81.99 + SAVE10 → total $85.87).
- Subtotal exactly $75 with a $5 fixed promo → discounted $70 → shipping is NOT free.
- Adding the same product+device+options twice must merge into one line, not two.
- Setting a cart line quantity to 0 must delete the line.

## Triggering server-side configuration errors
The product page only lists compatible devices and its option selects are `required`, so you cannot submit
an incompatible or incomplete configuration from that page — the browser blocks it first. To exercise the
server validation in a browser, write a scratch HTML file with a form POSTing to
`http://localhost:3000/cart/add` (fields: `productId`, `deviceId`, `option_<id>`, `quantity`) and open it
via `file:///…`. Expect a 400 re-render of the product page with the inline error.
Caveat: that POST is cross-site, so the `SameSite=lax` session cookie is not sent and the server starts a
new session — any cart you had is orphaned. Do this probe before building the basket you plan to check out,
or rebuild the cart afterwards.

## Test cards
`4242 4242 4242 4242`, exp `12/34`, CVC `123` succeeds. `4242 4242 4242 4241` fails Luhn.
Promo codes: `SAVE10` (10%), `MOBILE5` ($5); codes are case-insensitive.

## Devin Secrets Needed
None.
