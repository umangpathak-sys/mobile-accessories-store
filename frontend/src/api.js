async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error((payload && payload.error) || 'Request failed.');
    error.status = response.status;
    error.fieldErrors = (payload && payload.fieldErrors) || {};
    throw error;
  }
  return payload;
}

const body = (data) => ({ body: JSON.stringify(data) });

export const api = {
  catalog: () => request('/api/catalog'),
  products: (filters = {}) => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value != null)
    );
    const query = params.toString();
    return request(`/api/products${query ? `?${query}` : ''}`);
  },
  product: (id) => request(`/api/products/${id}`),
  cart: () => request('/api/cart'),
  addItem: (item) => request('/api/cart/items', { method: 'POST', ...body(item) }),
  updateItem: (key, quantity) =>
    request(`/api/cart/items/${encodeURIComponent(key)}`, { method: 'PATCH', ...body({ quantity }) }),
  removeItem: (key) => request(`/api/cart/items/${encodeURIComponent(key)}`, { method: 'DELETE' }),
  setPromo: (code) => request('/api/cart/promo', { method: 'PUT', ...body({ code }) }),
  setShipping: (shipping) => request('/api/cart/shipping', { method: 'PUT', ...body({ shipping }) }),
  checkout: (form) => request('/api/checkout', { method: 'POST', ...body(form) }),
  order: (id) => request(`/api/orders/${id}`),
};

export const currency = (value) => `$${Number(value).toFixed(2)}`;
