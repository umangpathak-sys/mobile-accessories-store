const path = require('path');
const express = require('express');
const session = require('express-session');

const catalog = require('./catalog');
const cartLib = require('./cart');
const { getOrder, placeOrder, validateCheckout } = require('./orders');

const { ValidationError } = cartLib;

function currency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'mobile-accessories-dev-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { httpOnly: true, sameSite: 'lax' },
    })
  );

  app.use((req, res, next) => {
    if (!Array.isArray(req.session.cart)) req.session.cart = [];
    res.locals.cartCount = cartLib.itemCount(req.session.cart);
    res.locals.currency = currency;
    res.locals.categories = catalog.CATEGORIES;
    res.locals.platforms = catalog.PLATFORMS;
    res.locals.query = req.query;
    next();
  });

  app.get('/', (req, res) => {
    const { platform = '', device = '', category = '', brand = '', search = '', sort = 'featured' } = req.query;
    const products = catalog.searchProducts({ platform, device, category, brand, search, sort });
    res.render('index', {
      title: 'Shop mobile accessories',
      products,
      devices: catalog.devicesForPlatform(platform),
      brands: catalog.brands(),
      filters: { platform, device, category, brand, search, sort },
    });
  });

  app.get('/products/:id', (req, res, next) => {
    const product = catalog.getProduct(req.params.id);
    if (!product) return next();
    return res.render('product', {
      title: product.name,
      product,
      devices: catalog.compatibleDevices(product),
      selectedDevice: req.query.device || '',
      error: null,
      submitted: {},
    });
  });

  app.post('/cart/add', (req, res) => {
    const { productId, deviceId, quantity = '1', ...rest } = req.body;
    const product = catalog.getProduct(productId);
    if (!product) return res.status(404).render('404', { title: 'Not found' });

    const selections = {};
    for (const option of product.options) {
      const value = rest[`option_${option.id}`];
      if (value) selections[option.id] = value;
    }

    try {
      const item = cartLib.configureItem({
        productId,
        deviceId,
        selections,
        quantity: Number(quantity),
      });
      cartLib.addItem(req.session.cart, item);
      return res.redirect('/cart');
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      return res.status(400).render('product', {
        title: product.name,
        product,
        devices: catalog.compatibleDevices(product),
        selectedDevice: deviceId || '',
        error: err.message,
        submitted: { ...selections, quantity },
      });
    }
  });

  app.get('/cart', (req, res) => {
    const promoCode = req.session.promoCode || null;
    const shipping = req.session.shipping || 'standard';
    res.render('cart', {
      title: 'Your cart',
      cart: req.session.cart,
      totals: cartLib.summarize(req.session.cart, { shipping, promoCode }),
      error: req.session.cartError || null,
      shipping,
    });
    req.session.cartError = null;
  });

  app.post('/cart/update', (req, res) => {
    try {
      cartLib.updateQuantity(req.session.cart, req.body.key, req.body.quantity);
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      req.session.cartError = err.message;
    }
    res.redirect('/cart');
  });

  app.post('/cart/remove', (req, res) => {
    cartLib.removeItem(req.session.cart, req.body.key);
    res.redirect('/cart');
  });

  app.post('/cart/promo', (req, res) => {
    try {
      const promo = cartLib.applyPromo(req.body.promoCode);
      req.session.promoCode = promo ? promo.code : null;
    } catch (err) {
      if (!(err instanceof ValidationError)) throw err;
      req.session.promoCode = null;
      req.session.cartError = err.message;
    }
    res.redirect('/cart');
  });

  app.post('/cart/shipping', (req, res) => {
    req.session.shipping = req.body.shipping === 'express' ? 'express' : 'standard';
    res.redirect(req.body.next === 'checkout' ? '/checkout' : '/cart');
  });

  app.get('/checkout', (req, res) => {
    if (req.session.cart.length === 0) return res.redirect('/cart');
    const shipping = req.session.shipping || 'standard';
    return res.render('checkout', {
      title: 'Checkout',
      cart: req.session.cart,
      totals: cartLib.summarize(req.session.cart, { shipping, promoCode: req.session.promoCode }),
      shipping,
      errors: {},
      form: {},
    });
  });

  app.post('/checkout', (req, res) => {
    const shipping = req.body.shipping === 'express' ? 'express' : req.session.shipping || 'standard';
    req.session.shipping = shipping;

    if (req.session.cart.length === 0) return res.redirect('/cart');

    const errors = validateCheckout(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).render('checkout', {
        title: 'Checkout',
        cart: req.session.cart,
        totals: cartLib.summarize(req.session.cart, { shipping, promoCode: req.session.promoCode }),
        shipping,
        errors,
        form: req.body,
      });
    }

    const order = placeOrder({
      cart: req.session.cart,
      form: req.body,
      shipping,
      promoCode: req.session.promoCode,
    });

    req.session.cart = [];
    req.session.promoCode = null;
    req.session.shipping = 'standard';
    return res.redirect(`/orders/${order.id}`);
  });

  app.get('/orders/:id', (req, res, next) => {
    const order = getOrder(req.params.id);
    if (!order) return next();
    return res.render('confirmation', { title: `Order ${order.id}`, order });
  });

  app.get('/api/products', (req, res) => {
    res.json(catalog.searchProducts(req.query));
  });

  app.get('/api/cart', (req, res) => {
    res.json({
      items: req.session.cart,
      totals: cartLib.summarize(req.session.cart, {
        shipping: req.session.shipping || 'standard',
        promoCode: req.session.promoCode,
      }),
    });
  });

  app.use((req, res) => {
    res.status(404).render('404', { title: 'Page not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('500', { title: 'Something went wrong' });
  });

  return app;
}

module.exports = { createApp, currency };
