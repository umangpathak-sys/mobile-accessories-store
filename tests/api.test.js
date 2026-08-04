const request = require('supertest');
const { createApp } = require('../src/app');

function agent() {
  return request.agent(createApp());
}

const VALID_CHECKOUT = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  address1: '12 Analytical Way',
  city: 'London',
  postalCode: 'E1 6AN',
  country: 'UK',
  cardNumber: '4242424242424242',
  cardExpiry: '12/34',
  cardCvc: '123',
};

test('catalog metadata drives the frontend filters', async () => {
  const { body } = await agent().get('/api/catalog').expect(200);
  expect(body.platforms.map((p) => p.id)).toEqual(['apple', 'android']);
  expect(body.devices.length).toBeGreaterThan(5);
  expect(body.brands).toContain('Voltcore');
});

test('product search filters by device', async () => {
  const app = agent();
  const all = await app.get('/api/products').expect(200);
  expect(all.body.length).toBe(12);

  const watch = await app.get('/api/products?device=apple-watch-9').expect(200);
  expect(watch.body.map((p) => p.id)).toEqual(['watch-band']);
});

test('product detail includes compatible devices', async () => {
  const { body } = await agent().get('/api/products/gan-charger').expect(200);
  expect(body.compatibleDevices.some((d) => d.id === 'pixel-8')).toBe(true);
  expect(await agent().get('/api/products/nope').expect(404));
});

test('rejects an incompatible configuration', async () => {
  const { body } = await agent()
    .post('/api/cart/items')
    .send({ productId: 'watch-band', deviceId: 'iphone-15', selections: { color: 'storm', size: 's-m' } })
    .expect(400);
  expect(body.error).toMatch(/not compatible/);
});

test('rejects a missing required option', async () => {
  const { body } = await agent()
    .post('/api/cart/items')
    .send({ productId: 'gan-charger', deviceId: 'pixel-8', selections: { plug: 'us' } })
    .expect(400);
  expect(body.error).toMatch(/output/i);
});

test('cart lifecycle: add, promo, shipping, quantity, remove', async () => {
  const app = agent();

  const added = await app
    .post('/api/cart/items')
    .send({
      productId: 'silicone-case',
      deviceId: 'iphone-15-pro',
      selections: { color: 'ocean', magsafe: 'magnetic' },
      quantity: 2,
    })
    .expect(201);
  expect(added.body.items).toHaveLength(1);
  expect(added.body.totals.subtotal).toBe(79.98);

  const promo = await app.put('/api/cart/promo').send({ code: 'save10' }).expect(200);
  expect(promo.body.promoCode).toBe('SAVE10');
  expect(promo.body.totals.discount).toBe(8);

  const badPromo = await app.put('/api/cart/promo').send({ code: 'BOGUS' }).expect(400);
  expect(badPromo.body.error).toMatch(/not valid/);

  const express = await app.put('/api/cart/shipping').send({ shipping: 'express' }).expect(200);
  expect(express.body.totals.shipping).toBe(14.99);
  await app.put('/api/cart/shipping').send({ shipping: 'overnight' }).expect(400);

  const key = added.body.items[0].key;
  const updated = await app.patch(`/api/cart/items/${encodeURIComponent(key)}`).send({ quantity: 3 }).expect(200);
  expect(updated.body.totals.itemCount).toBe(3);

  const removed = await app.delete(`/api/cart/items/${encodeURIComponent(key)}`).expect(200);
  expect(removed.body.items).toHaveLength(0);
});

test('checkout validates fields then places the order', async () => {
  const app = agent();
  await app
    .post('/api/cart/items')
    .send({ productId: 'anc-buds', deviceId: 'pixel-8', selections: { color: 'white' } })
    .expect(201);

  const invalid = await app
    .post('/api/checkout')
    .send({ ...VALID_CHECKOUT, email: 'bad', cardNumber: '1111' })
    .expect(422);
  expect(invalid.body.fieldErrors.email).toBeDefined();
  expect(invalid.body.fieldErrors.cardNumber).toBeDefined();

  const order = await app.post('/api/checkout').send(VALID_CHECKOUT).expect(201);
  expect(order.body.id).toMatch(/^MA-/);
  expect(order.body.payment.last4).toBe('4242');

  const fetched = await app.get(`/api/orders/${order.body.id}`).expect(200);
  expect(fetched.body.totals.total).toBe(order.body.totals.total);

  const emptied = await app.get('/api/cart').expect(200);
  expect(emptied.body.items).toHaveLength(0);
});

test('checkout refuses an empty cart', async () => {
  const { body } = await agent().post('/api/checkout').send(VALID_CHECKOUT).expect(400);
  expect(body.error).toMatch(/empty/i);
});

test('unknown api routes return json 404', async () => {
  const { body } = await agent().get('/api/nope').expect(404);
  expect(body.error).toBe('Unknown endpoint.');
});

test('client routes fall through to the SPA shell', async () => {
  const res = await agent().get('/cart');
  expect([200, 503]).toContain(res.status);
});
