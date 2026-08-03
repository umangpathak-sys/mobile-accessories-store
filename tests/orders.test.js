const { expiryValid, luhnValid, placeOrder, validateCheckout } = require('../src/orders');
const cart = require('../src/cart');

const validForm = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  address1: '12 Analytical Way',
  city: 'London',
  postalCode: 'E1 6AN',
  country: 'UK',
  cardNumber: '4242 4242 4242 4242',
  cardExpiry: '12/34',
  cardCvc: '123',
};

test('accepts a valid form', () => {
  expect(validateCheckout(validForm)).toEqual({});
});

test('flags missing and malformed fields', () => {
  const errors = validateCheckout({ ...validForm, email: 'nope', cardNumber: '1234', city: '' });
  expect(errors.email).toBeDefined();
  expect(errors.cardNumber).toBeDefined();
  expect(errors.city).toBeDefined();
});

test('luhn and expiry helpers', () => {
  expect(luhnValid('4242424242424242')).toBe(true);
  expect(luhnValid('4242424242424241')).toBe(false);
  expect(expiryValid('01/20')).toBe(false);
  expect(expiryValid('13/30')).toBe(false);
  expect(expiryValid('12/34')).toBe(true);
});

test('places an order and masks the card', () => {
  const lines = [];
  cart.addItem(
    lines,
    cart.configureItem({ productId: 'anc-buds', deviceId: 'pixel-8', selections: { color: 'white' } })
  );
  const order = placeOrder({ cart: lines, form: validForm, shipping: 'standard', promoCode: null });
  expect(order.id).toMatch(/^MA-/);
  expect(order.payment.last4).toBe('4242');
  expect(order.totals.total).toBeGreaterThan(0);
  expect(order.customer.email).toBe('ada@example.com');
});

test('refuses to place an empty order', () => {
  expect(() => placeOrder({ cart: [], form: validForm })).toThrow(/empty/i);
});
