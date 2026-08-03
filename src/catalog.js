const { CATEGORIES, PLATFORMS, DEVICES, PRODUCTS } = require('./data/products');

function getDevice(deviceId) {
  return DEVICES.find((d) => d.id === deviceId) || null;
}

function getProduct(productId) {
  return PRODUCTS.find((p) => p.id === productId) || null;
}

function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || null;
}

function devicesForPlatform(platform) {
  if (!platform) return DEVICES;
  return DEVICES.filter((d) => d.platform === platform);
}

function brands() {
  return [...new Set(PRODUCTS.map((p) => p.brand))].sort();
}

const SORTS = {
  featured: null,
  'price-asc': (a, b) => a.basePrice - b.basePrice,
  'price-desc': (a, b) => b.basePrice - a.basePrice,
  rating: (a, b) => b.rating - a.rating,
};

function searchProducts({ platform, device, category, brand, search, sort } = {}) {
  let results = PRODUCTS.slice();

  if (device) {
    results = results.filter((p) => p.devices.includes(device));
  } else if (platform) {
    const ids = devicesForPlatform(platform).map((d) => d.id);
    results = results.filter((p) => p.devices.some((id) => ids.includes(id)));
  }
  if (category) results = results.filter((p) => p.category === category);
  if (brand) results = results.filter((p) => p.brand === brand);
  if (search) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  const comparator = SORTS[sort];
  if (comparator) results.sort(comparator);
  return results;
}

function compatibleDevices(product) {
  return DEVICES.filter((d) => product.devices.includes(d.id));
}

module.exports = {
  CATEGORIES,
  PLATFORMS,
  DEVICES,
  PRODUCTS,
  brands,
  compatibleDevices,
  devicesForPlatform,
  getCategory,
  getDevice,
  getProduct,
  searchProducts,
};
