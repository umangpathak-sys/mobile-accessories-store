const request = require('supertest');
const { createApp } = require('../src/app');

function agent() {
  return request.agent(createApp());
}

test('home page lists products and filters by device', async () => {
  const app = agent();
  const all = await app.get('/');
  expect(all.status).toBe(200);
  expect(all.text).toContain('Silicone Grip Case');

  const watch = await app.get('/?device=apple-watch-9');
  expect(watch.text).toContain('Woven Sport Band');
  expect(watch.text).not.toContain('Silicone Grip Case');
});

test('product page renders configuration options', async () => {
  const res = await agent().get('/products/gan-charger');
  expect(res.status).toBe(200);
  expect(res.text).toContain('65W dual port');
});

test('rejects an incompatible configuration', async () => {
  const res = await agent()
    .post('/cart/add')
    .type('form')
    .send({ productId: 'watch-band', deviceId: 'iphone-15', option_color: 'storm', option_size: 's-m', quantity: '1' });
  expect(res.status).toBe(400);
  expect(res.text).toContain('not compatible');
});

test('full browse to checkout flow', async () => {
  const app = agent();

  await app
    .post('/cart/add')
    .type('form')
    .send({
      productId: 'silicone-case',
      deviceId: 'iphone-15-pro',
      option_color: 'ocean',
      option_magsafe: 'magnetic',
      quantity: '2',
    })
    .expect(302);

  const cartPage = await app.get('/cart');
  expect(cartPage.text).toContain('Silicone Grip Case');
  expect(cartPage.text).toContain('$79.98');

  await app.post('/cart/promo').type('form').send({ promoCode: 'SAVE10' }).expect(302);

  const api = await app.get('/api/cart');
  expect(api.body.totals.discount).toBe(8);
  expect(api.body.totals.itemCount).toBe(2);

  const invalid = await app
    .post('/checkout')
    .type('form')
    .send({ fullName: 'Ada', email: 'bad', cardNumber: '1111' });
  expect(invalid.status).toBe(400);
  expect(invalid.text).toContain('Enter a valid email address.');

  const placed = await app.post('/checkout').type('form').send({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    address1: '12 Analytical Way',
    city: 'London',
    postalCode: 'E1 6AN',
    country: 'UK',
    cardNumber: '4242424242424242',
    cardExpiry: '12/34',
    cardCvc: '123',
  });
  expect(placed.status).toBe(302);

  const confirmation = await app.get(placed.headers.location);
  expect(confirmation.text).toContain('Thank you, Ada!');
  expect(confirmation.text).toContain('card ending 4242');

  const emptied = await app.get('/cart');
  expect(emptied.text).toContain('Your cart is empty');
});

test('quantity update and removal', async () => {
  const app = agent();
  await app
    .post('/cart/add')
    .type('form')
    .send({ productId: 'glass-protector', deviceId: 'pixel-8', option_finish: 'matte', option_pack: 'twin', quantity: '1' });

  const { body } = await app.get('/api/cart');
  const key = body.items[0].key;

  await app.post('/cart/update').type('form').send({ key, quantity: '3' });
  const updated = await app.get('/api/cart');
  expect(updated.body.totals.itemCount).toBe(3);

  await app.post('/cart/remove').type('form').send({ key });
  const cleared = await app.get('/api/cart');
  expect(cleared.body.items).toHaveLength(0);
});

test('unknown routes render 404', async () => {
  const res = await agent().get('/nope');
  expect(res.status).toBe(404);
  expect(res.text).toContain('Page not found');
});
