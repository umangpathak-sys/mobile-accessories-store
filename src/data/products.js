const CATEGORIES = [
  { id: 'cases', name: 'Cases & Covers' },
  { id: 'chargers', name: 'Chargers & Power' },
  { id: 'audio', name: 'Audio' },
  { id: 'screen', name: 'Screen Protection' },
  { id: 'mounts', name: 'Mounts & Stands' },
  { id: 'wearables', name: 'Wearable Bands' },
];

const PLATFORMS = [
  { id: 'apple', name: 'Apple' },
  { id: 'android', name: 'Android' },
];

const DEVICES = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', platform: 'apple' },
  { id: 'iphone-15', name: 'iPhone 15', platform: 'apple' },
  { id: 'iphone-14', name: 'iPhone 14', platform: 'apple' },
  { id: 'ipad-air', name: 'iPad Air', platform: 'apple' },
  { id: 'apple-watch-9', name: 'Apple Watch Series 9', platform: 'apple' },
  { id: 'galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra', platform: 'android' },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24', platform: 'android' },
  { id: 'pixel-8-pro', name: 'Google Pixel 8 Pro', platform: 'android' },
  { id: 'pixel-8', name: 'Google Pixel 8', platform: 'android' },
  { id: 'oneplus-12', name: 'OnePlus 12', platform: 'android' },
  { id: 'galaxy-watch-6', name: 'Galaxy Watch 6', platform: 'android' },
];

const COLOR_OPTION = (values) => ({
  id: 'color',
  name: 'Color',
  required: true,
  values,
});

const PRODUCTS = [
  {
    id: 'silicone-case',
    name: 'Silicone Grip Case',
    category: 'cases',
    brand: 'Aeris',
    basePrice: 29.99,
    rating: 4.6,
    description:
      'Soft-touch silicone case with a microfiber lining and raised camera lip. Drop tested to 3 meters.',
    image: '/img/case.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      COLOR_OPTION([
        { id: 'midnight', name: 'Midnight', priceDelta: 0 },
        { id: 'sand', name: 'Desert Sand', priceDelta: 0 },
        { id: 'ocean', name: 'Ocean Blue', priceDelta: 2 },
      ]),
      {
        id: 'magsafe',
        name: 'Magnetic ring',
        required: false,
        values: [
          { id: 'none', name: 'No magnets', priceDelta: 0 },
          { id: 'magnetic', name: 'Built-in magnet array', priceDelta: 8 },
        ],
      },
    ],
  },
  {
    id: 'leather-folio',
    name: 'Leather Folio Wallet',
    category: 'cases',
    brand: 'Northbank',
    basePrice: 59.0,
    rating: 4.4,
    description: 'Full-grain leather folio with three card slots and a magnetic closure.',
    image: '/img/folio.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'galaxy-s24-ultra', 'pixel-8-pro'],
    options: [
      COLOR_OPTION([
        { id: 'black', name: 'Black', priceDelta: 0 },
        { id: 'tan', name: 'Tan', priceDelta: 0 },
      ]),
      {
        id: 'monogram',
        name: 'Monogram',
        required: false,
        values: [
          { id: 'none', name: 'None', priceDelta: 0 },
          { id: 'embossed', name: 'Embossed initials', priceDelta: 12 },
        ],
      },
    ],
  },
  {
    id: 'gan-charger',
    name: 'GaN Fast Charger',
    category: 'chargers',
    brand: 'Voltcore',
    basePrice: 34.5,
    rating: 4.8,
    description: 'Compact gallium nitride wall charger with USB-C Power Delivery and PPS support.',
    image: '/img/charger.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'ipad-air', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      {
        id: 'wattage',
        name: 'Output',
        required: true,
        values: [
          { id: '30w', name: '30W single port', priceDelta: 0 },
          { id: '65w', name: '65W dual port', priceDelta: 15 },
          { id: '100w', name: '100W triple port', priceDelta: 32 },
        ],
      },
      {
        id: 'plug',
        name: 'Plug type',
        required: true,
        values: [
          { id: 'us', name: 'US', priceDelta: 0 },
          { id: 'eu', name: 'EU', priceDelta: 0 },
          { id: 'uk', name: 'UK', priceDelta: 1.5 },
        ],
      },
    ],
  },
  {
    id: 'wireless-pad',
    name: 'Wireless Charging Pad',
    category: 'chargers',
    brand: 'Voltcore',
    basePrice: 39.0,
    rating: 4.2,
    description: 'Qi2 charging pad with magnetic alignment and an anti-slip base.',
    image: '/img/pad.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8'],
    options: [
      {
        id: 'speed',
        name: 'Charging speed',
        required: true,
        values: [
          { id: '15w', name: '15W', priceDelta: 0 },
          { id: '25w', name: '25W turbo', priceDelta: 10 },
        ],
      },
    ],
  },
  {
    id: 'anc-buds',
    name: 'Noise Cancelling Earbuds',
    category: 'audio',
    brand: 'Sonade',
    basePrice: 129.0,
    rating: 4.7,
    description: 'Hybrid ANC earbuds with multipoint pairing, 30h total battery and IPX5 water resistance.',
    image: '/img/buds.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'ipad-air', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      COLOR_OPTION([
        { id: 'white', name: 'Cloud White', priceDelta: 0 },
        { id: 'graphite', name: 'Graphite', priceDelta: 0 },
      ]),
      {
        id: 'eartips',
        name: 'Ear tip kit',
        required: false,
        values: [
          { id: 'standard', name: 'Standard silicone', priceDelta: 0 },
          { id: 'foam', name: 'Memory foam kit', priceDelta: 14 },
        ],
      },
    ],
  },
  {
    id: 'usbc-dac',
    name: 'USB-C Headphone DAC',
    category: 'audio',
    brand: 'Sonade',
    basePrice: 24.0,
    rating: 4.1,
    description: '32-bit/384kHz DAC adapter for wired headphones on USB-C phones and tablets.',
    image: '/img/dac.svg',
    devices: ['ipad-air', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12', 'iphone-15-pro', 'iphone-15'],
    options: [
      {
        id: 'length',
        name: 'Cable length',
        required: true,
        values: [
          { id: 'short', name: '10 cm', priceDelta: 0 },
          { id: 'long', name: '30 cm', priceDelta: 3 },
        ],
      },
    ],
  },
  {
    id: 'glass-protector',
    name: 'Tempered Glass Protector',
    category: 'screen',
    brand: 'Clearline',
    basePrice: 19.99,
    rating: 4.3,
    description: '9H tempered glass with oleophobic coating and a bubble-free alignment tray.',
    image: '/img/glass.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'ipad-air', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      {
        id: 'finish',
        name: 'Finish',
        required: true,
        values: [
          { id: 'clear', name: 'Clear', priceDelta: 0 },
          { id: 'matte', name: 'Anti-glare matte', priceDelta: 4 },
          { id: 'privacy', name: 'Privacy filter', priceDelta: 9 },
        ],
      },
      {
        id: 'pack',
        name: 'Pack size',
        required: true,
        values: [
          { id: 'single', name: 'Single', priceDelta: 0 },
          { id: 'twin', name: 'Twin pack', priceDelta: 7 },
        ],
      },
    ],
  },
  {
    id: 'car-mount',
    name: 'Magnetic Car Mount',
    category: 'mounts',
    brand: 'Aeris',
    basePrice: 27.0,
    rating: 4.5,
    description: 'Vent-clip magnetic mount with a 360° ball joint and N52 magnets.',
    image: '/img/mount.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      {
        id: 'mounting',
        name: 'Mounting style',
        required: true,
        values: [
          { id: 'vent', name: 'Air vent clip', priceDelta: 0 },
          { id: 'dash', name: 'Dashboard suction', priceDelta: 5 },
        ],
      },
      {
        id: 'charging',
        name: 'Wireless charging',
        required: false,
        values: [
          { id: 'none', name: 'Mount only', priceDelta: 0 },
          { id: 'wireless', name: '15W wireless charging', priceDelta: 22 },
        ],
      },
    ],
  },
  {
    id: 'desk-stand',
    name: 'Aluminium Desk Stand',
    category: 'mounts',
    brand: 'Northbank',
    basePrice: 45.0,
    rating: 4.6,
    description: 'Weighted aluminium stand with adjustable tilt for phones and tablets.',
    image: '/img/stand.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'ipad-air', 'galaxy-s24-ultra', 'pixel-8-pro', 'oneplus-12'],
    options: [
      COLOR_OPTION([
        { id: 'silver', name: 'Silver', priceDelta: 0 },
        { id: 'space-grey', name: 'Space Grey', priceDelta: 3 },
      ]),
    ],
  },
  {
    id: 'watch-band',
    name: 'Woven Sport Band',
    category: 'wearables',
    brand: 'Aeris',
    basePrice: 35.0,
    rating: 4.4,
    description: 'Breathable woven nylon band with a quick-release pin and stainless buckle.',
    image: '/img/band.svg',
    devices: ['apple-watch-9', 'galaxy-watch-6'],
    options: [
      COLOR_OPTION([
        { id: 'storm', name: 'Storm Grey', priceDelta: 0 },
        { id: 'coral', name: 'Coral', priceDelta: 0 },
        { id: 'olive', name: 'Olive', priceDelta: 0 },
      ]),
      {
        id: 'size',
        name: 'Band size',
        required: true,
        values: [
          { id: 's-m', name: 'S/M (130-180mm)', priceDelta: 0 },
          { id: 'm-l', name: 'M/L (160-210mm)', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'power-bank',
    name: '10K Power Bank',
    category: 'chargers',
    brand: 'Voltcore',
    basePrice: 49.0,
    rating: 4.5,
    description: '10,000 mAh battery with pass-through charging and a built-in USB-C cable.',
    image: '/img/powerbank.svg',
    devices: ['iphone-15-pro', 'iphone-15', 'iphone-14', 'ipad-air', 'galaxy-s24-ultra', 'galaxy-s24', 'pixel-8-pro', 'pixel-8', 'oneplus-12'],
    options: [
      {
        id: 'capacity',
        name: 'Capacity',
        required: true,
        values: [
          { id: '10k', name: '10,000 mAh', priceDelta: 0 },
          { id: '20k', name: '20,000 mAh', priceDelta: 18 },
        ],
      },
      {
        id: 'cable',
        name: 'Built-in cable',
        required: true,
        values: [
          { id: 'usbc', name: 'USB-C', priceDelta: 0 },
          { id: 'lightning', name: 'Lightning', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'stylus',
    name: 'Active Stylus Pen',
    category: 'mounts',
    brand: 'Clearline',
    basePrice: 69.0,
    rating: 4.2,
    description: 'Pressure-sensitive stylus with palm rejection and magnetic charging.',
    image: '/img/stylus.svg',
    devices: ['ipad-air', 'galaxy-s24-ultra'],
    options: [
      {
        id: 'tip',
        name: 'Tip pack',
        required: false,
        values: [
          { id: 'none', name: 'Standard tip only', priceDelta: 0 },
          { id: 'spare', name: 'Spare tip pack', priceDelta: 9 },
        ],
      },
    ],
  },
];

module.exports = { CATEGORIES, PLATFORMS, DEVICES, PRODUCTS };
