const cart = require('../src/cart');
const { ValidationError } = cart;

describe('configureItem', () => {
  test('prices base plus option deltas', () => {
    const item = cart.configureItem({
      productId: 'silicone-case',
      deviceId: 'iphone-15-pro',
      selections: { color: 'ocean', magsafe: 'magnetic' },
      quantity: 2,
    });
    expect(item.unitPrice).toBe(39.99);
    expect(item.quantity).toBe(2);
    expect(item.options).toHaveLength(2);
  });

  test('rejects incompatible device', () => {
    expect(() =>
      cart.configureItem({
        productId: 'watch-band',
        deviceId: 'iphone-15',
        selections: { color: 'storm', size: 's-m' },
      })
    ).toThrow(ValidationError);
  });

  test('requires required options', () => {
    expect(() =>
      cart.configureItem({ productId: 'gan-charger', deviceId: 'pixel-8', selections: { plug: 'us' } })
    ).toThrow(/output/i);
  });

  test('rejects invalid quantity', () => {
    expect(() =>
      cart.configureItem({
        productId: 'glass-protector',
        deviceId: 'pixel-8',
        selections: { finish: 'clear', pack: 'single' },
        quantity: 99,
      })
    ).toThrow(/quantity/i);
  });
});

describe('cart mutations', () => {
  const build = (selections, quantity = 1) =>
    cart.configureItem({ productId: 'glass-protector', deviceId: 'pixel-8', selections, quantity });

  test('merges identical configurations', () => {
    const lines = [];
    cart.addItem(lines, build({ finish: 'clear', pack: 'single' }));
    cart.addItem(lines, build({ finish: 'clear', pack: 'single' }, 2));
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  test('keeps different configurations separate', () => {
    const lines = [];
    cart.addItem(lines, build({ finish: 'clear', pack: 'single' }));
    cart.addItem(lines, build({ finish: 'matte', pack: 'single' }));
    expect(lines).toHaveLength(2);
  });

  test('quantity 0 removes the line', () => {
    const lines = [];
    const item = build({ finish: 'clear', pack: 'single' });
    cart.addItem(lines, item);
    cart.updateQuantity(lines, item.key, 0);
    expect(lines).toHaveLength(0);
  });
});

describe('summarize', () => {
  const lines = () => {
    const list = [];
    cart.addItem(
      list,
      cart.configureItem({
        productId: 'anc-buds',
        deviceId: 'galaxy-s24',
        selections: { color: 'white' },
      })
    );
    return list;
  };

  test('free standard shipping above threshold', () => {
    const totals = cart.summarize(lines());
    expect(totals.subtotal).toBe(129);
    expect(totals.shipping).toBe(0);
    expect(totals.tax).toBe(10.64);
    expect(totals.total).toBe(139.64);
  });

  test('charges shipping below threshold', () => {
    const list = [];
    cart.addItem(
      list,
      cart.configureItem({
        productId: 'glass-protector',
        deviceId: 'pixel-8',
        selections: { finish: 'clear', pack: 'single' },
      })
    );
    const totals = cart.summarize(list);
    expect(totals.shipping).toBe(5.99);
    expect(totals.freeShippingRemaining).toBe(55.01);
  });

  test('applies percentage promo before tax and shipping', () => {
    const totals = cart.summarize(lines(), { promoCode: 'save10' });
    expect(totals.discount).toBe(12.9);
    expect(totals.total).toBe(125.68);
  });

  test('express shipping overrides free shipping', () => {
    const totals = cart.summarize(lines(), { shipping: 'express' });
    expect(totals.shipping).toBe(14.99);
  });

  test('rejects unknown promo codes', () => {
    expect(() => cart.summarize(lines(), { promoCode: 'NOPE' })).toThrow(ValidationError);
  });

  test('empty cart has no shipping', () => {
    expect(cart.summarize([])).toMatchObject({ subtotal: 0, shipping: 0, total: 0, itemCount: 0 });
  });
});
