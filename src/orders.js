const { ValidationError, summarize } = require('./cart');

const orders = new Map();

const REQUIRED_FIELDS = [
  ['fullName', 'Full name'],
  ['email', 'Email'],
  ['address1', 'Address'],
  ['city', 'City'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
  ['cardNumber', 'Card number'],
  ['cardExpiry', 'Card expiry'],
  ['cardCvc', 'Card security code'],
];

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function luhnValid(number) {
  const digits = digitsOnly(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryValid(value, now = new Date()) {
  const match = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})$/.exec(String(value || '').trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
  const endOfMonth = new Date(year, month, 1);
  return endOfMonth > now;
}

function validateCheckout(form) {
  const errors = {};

  for (const [field, label] of REQUIRED_FIELDS) {
    if (!String(form[field] || '').trim()) errors[field] = `${label} is required.`;
  }

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!errors.cardNumber && !luhnValid(form.cardNumber)) {
    errors.cardNumber = 'Enter a valid card number.';
  }
  if (!errors.cardExpiry && !expiryValid(form.cardExpiry)) {
    errors.cardExpiry = 'Enter a valid future expiry date (MM/YY).';
  }
  if (!errors.cardCvc && !/^\d{3,4}$/.test(String(form.cardCvc).trim())) {
    errors.cardCvc = 'Security code must be 3 or 4 digits.';
  }

  return errors;
}

function orderNumber() {
  const random = Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, '0');
  return `MA-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function placeOrder({ cart, form, shipping, promoCode }) {
  if (!cart || cart.length === 0) throw new ValidationError('Your cart is empty.');
  const totals = summarize(cart, { shipping, promoCode });

  const order = {
    id: orderNumber(),
    placedAt: new Date().toISOString(),
    items: cart.map((line) => ({ ...line, options: line.options.map((o) => ({ ...o })) })),
    totals,
    customer: {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      address1: form.address1.trim(),
      address2: String(form.address2 || '').trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    },
    payment: { last4: digitsOnly(form.cardNumber).slice(-4) },
  };

  orders.set(order.id, order);
  return order;
}

function getOrder(id) {
  return orders.get(id) || null;
}

module.exports = { expiryValid, getOrder, luhnValid, orders, placeOrder, validateCheckout };
