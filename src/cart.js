const { getDevice, getProduct } = require('./catalog');

const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 5.99;
const EXPRESS_SHIPPING = 14.99;
const TAX_RATE = 0.0825;
const MAX_QUANTITY = 10;

const PROMO_CODES = {
  SAVE10: { type: 'percent', value: 0.1, label: '10% off' },
  MOBILE5: { type: 'fixed', value: 5, label: '$5 off' },
};

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

class ValidationError extends Error {}

function configureItem({ productId, deviceId, selections = {}, quantity = 1 }) {
  const product = getProduct(productId);
  if (!product) throw new ValidationError('Unknown product.');

  const device = getDevice(deviceId);
  if (!device) throw new ValidationError('Select a device.');
  if (!product.devices.includes(device.id)) {
    throw new ValidationError(`${product.name} is not compatible with ${device.name}.`);
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    throw new ValidationError(`Quantity must be between 1 and ${MAX_QUANTITY}.`);
  }

  const chosen = [];
  let unitPrice = product.basePrice;

  for (const option of product.options) {
    const rawValue = selections[option.id];
    if (!rawValue) {
      if (option.required) throw new ValidationError(`Choose a ${option.name.toLowerCase()}.`);
      continue;
    }
    const value = option.values.find((v) => v.id === rawValue);
    if (!value) throw new ValidationError(`Invalid ${option.name.toLowerCase()} selection.`);
    unitPrice += value.priceDelta;
    chosen.push({
      optionId: option.id,
      optionName: option.name,
      valueId: value.id,
      valueName: value.name,
      priceDelta: value.priceDelta,
    });
  }

  const key = [product.id, device.id, ...chosen.map((c) => `${c.optionId}:${c.valueId}`)].join('|');

  return {
    key,
    productId: product.id,
    productName: product.name,
    image: product.image,
    deviceId: device.id,
    deviceName: device.name,
    platform: device.platform,
    options: chosen,
    unitPrice: round(unitPrice),
    quantity: qty,
  };
}

function addItem(cart, item) {
  const existing = cart.find((line) => line.key === item.key);
  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
    return cart;
  }
  cart.push(item);
  return cart;
}

function updateQuantity(cart, key, quantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0 || qty > MAX_QUANTITY) {
    throw new ValidationError(`Quantity must be between 0 and ${MAX_QUANTITY}.`);
  }
  const index = cart.findIndex((line) => line.key === key);
  if (index === -1) return cart;
  if (qty === 0) cart.splice(index, 1);
  else cart[index].quantity = qty;
  return cart;
}

function removeItem(cart, key) {
  const index = cart.findIndex((line) => line.key === key);
  if (index !== -1) cart.splice(index, 1);
  return cart;
}

function itemCount(cart) {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

function applyPromo(code) {
  if (!code) return null;
  const promo = PROMO_CODES[code.trim().toUpperCase()];
  if (!promo) throw new ValidationError('That promo code is not valid.');
  return { code: code.trim().toUpperCase(), ...promo };
}

function summarize(cart, { shipping = 'standard', promoCode = null } = {}) {
  const subtotal = round(cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const promo = promoCode ? applyPromo(promoCode) : null;

  let discount = 0;
  if (promo) {
    discount = promo.type === 'percent' ? subtotal * promo.value : Math.min(promo.value, subtotal);
  }
  discount = round(discount);

  const discounted = round(subtotal - discount);
  let shippingCost = 0;
  if (cart.length > 0) {
    if (shipping === 'express') shippingCost = EXPRESS_SHIPPING;
    else shippingCost = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  }

  const tax = round(discounted * TAX_RATE);
  const total = round(discounted + shippingCost + tax);

  return {
    itemCount: itemCount(cart),
    subtotal,
    discount,
    promo,
    shippingMethod: cart.length ? shipping : null,
    shipping: round(shippingCost),
    tax,
    total,
    freeShippingRemaining: round(Math.max(0, FREE_SHIPPING_THRESHOLD - discounted)),
  };
}

module.exports = {
  EXPRESS_SHIPPING,
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY,
  PROMO_CODES,
  STANDARD_SHIPPING,
  TAX_RATE,
  ValidationError,
  addItem,
  applyPromo,
  configureItem,
  itemCount,
  removeItem,
  round,
  summarize,
  updateQuantity,
};
