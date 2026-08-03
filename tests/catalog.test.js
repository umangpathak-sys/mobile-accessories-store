const catalog = require('../src/catalog');

test('filters by platform', () => {
  const apple = catalog.searchProducts({ platform: 'apple' });
  const androidOnlyBand = apple.find((p) => p.id === 'watch-band');
  expect(androidOnlyBand).toBeDefined();
  expect(catalog.searchProducts({ device: 'apple-watch-9' }).map((p) => p.id)).toEqual(['watch-band']);
});

test('filters by device compatibility', () => {
  const results = catalog.searchProducts({ device: 'iphone-14' });
  expect(results.length).toBeGreaterThan(0);
  results.forEach((p) => expect(p.devices).toContain('iphone-14'));
});

test('combines category and search', () => {
  const results = catalog.searchProducts({ category: 'chargers', search: 'gan' });
  expect(results.map((p) => p.id)).toEqual(['gan-charger']);
});

test('sorts by price ascending', () => {
  const prices = catalog.searchProducts({ sort: 'price-asc' }).map((p) => p.basePrice);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

test('device list narrows by platform', () => {
  expect(catalog.devicesForPlatform('android').every((d) => d.platform === 'android')).toBe(true);
});
