const express = require('express');

const catalog = require('./catalog');
const cartLib = require('./cart');
const { getOrder, placeOrder, validateCheckout } = require('./orders');

const { ValidationError } = cartLib;

function cartState(req) {
  const shipping = req.session.shipping || 'standard';
  return {
    items: req.session.cart,
    shipping,
    promoCode: req.session.promoCode || null,
    totals: cartLib.summarize(req.session.cart, { shipping, promoCode: req.session.promoCode }),
  };
}

function createApiRouter() {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!Array.isArray(req.session.cart)) req.session.cart = [];
    next();
  });

  router.get('/catalog', (req, res) => {
    res.json({
      categories: catalog.CATEGORIES,
      platforms: catalog.PLATFORMS,
      devices: catalog.DEVICES,
      brands: catalog.brands(),
    });
  });

  router.get('/products', (req, res) => {
    res.json(catalog.searchProducts(req.query));
  });

  router.get('/products/:id', (req, res) => {
    const product = catalog.getProduct(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ ...product, compatibleDevices: catalog.compatibleDevices(product) });
  });

  router.get('/cart', (req, res) => {
    res.json(cartState(req));
  });

  router.post('/cart/items', (req, res) => {
    const item = cartLib.configureItem({
      productId: req.body.productId,
      deviceId: req.body.deviceId,
      selections: req.body.selections || {},
      quantity: Number(req.body.quantity ?? 1),
    });
    cartLib.addItem(req.session.cart, item);
    res.status(201).json(cartState(req));
  });

  router.patch('/cart/items/:key', (req, res) => {
    cartLib.updateQuantity(req.session.cart, req.params.key, Number(req.body.quantity));
    res.json(cartState(req));
  });

  router.delete('/cart/items/:key', (req, res) => {
    cartLib.removeItem(req.session.cart, req.params.key);
    res.json(cartState(req));
  });

  router.put('/cart/promo', (req, res) => {
    const promo = req.body.code ? cartLib.applyPromo(req.body.code) : null;
    req.session.promoCode = promo ? promo.code : null;
    res.json(cartState(req));
  });

  router.put('/cart/shipping', (req, res) => {
    if (!['standard', 'express'].includes(req.body.shipping)) {
      throw new ValidationError('Choose standard or express shipping.');
    }
    req.session.shipping = req.body.shipping;
    res.json(cartState(req));
  });

  router.post('/checkout', (req, res) => {
    if (req.session.cart.length === 0) throw new ValidationError('Your cart is empty.');

    const fieldErrors = validateCheckout(req.body);
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({ error: 'Please fix the highlighted fields.', fieldErrors });
    }

    const order = placeOrder({
      cart: req.session.cart,
      form: req.body,
      shipping: req.session.shipping || 'standard',
      promoCode: req.session.promoCode,
    });

    req.session.cart = [];
    req.session.promoCode = null;
    req.session.shipping = 'standard';
    return res.status(201).json(order);
  });

  router.get('/orders/:id', (req, res) => {
    const order = getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    return res.json(order);
  });

  router.use((req, res) => {
    res.status(404).json({ error: 'Unknown endpoint.' });
  });

  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, next) => {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  });

  return router;
}

module.exports = { createApiRouter };
