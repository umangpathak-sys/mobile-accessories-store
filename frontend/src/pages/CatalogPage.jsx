import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, currency } from '../api';

const SORTS = [
  { id: 'featured', name: 'Featured' },
  { id: 'price-asc', name: 'Price: low to high' },
  { id: 'price-desc', name: 'Price: high to low' },
  { id: 'rating', name: 'Top rated' },
];

export default function CatalogPage({ catalog }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  const filters = {
    platform: searchParams.get('platform') || '',
    device: searchParams.get('device') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'featured',
  };

  useEffect(() => {
    let active = true;
    api
      .products(filters)
      .then((data) => active && setProducts(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function setFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name === 'platform') next.delete('device');
    setSearchParams(next);
  }

  const devices = filters.platform
    ? catalog.devices.filter((device) => device.platform === filters.platform)
    : catalog.devices;

  return (
    <>
      <section className="hero">
        <h1>Accessories for every phone you own</h1>
        <p>Cases, chargers, audio and mounts, filtered to fit your exact Apple or Android device.</p>
      </section>

      <div className="filters">
        <label>
          Platform
          <select
            value={filters.platform}
            data-testid="platform-filter"
            onChange={(event) => setFilter('platform', event.target.value)}
          >
            <option value="">All platforms</option>
            {catalog.platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Device
          <select
            value={filters.device}
            data-testid="device-filter"
            onChange={(event) => setFilter('device', event.target.value)}
          >
            <option value="">All devices</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={filters.category}
            data-testid="category-filter"
            onChange={(event) => setFilter('category', event.target.value)}
          >
            <option value="">All categories</option>
            {catalog.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Brand
          <select
            value={filters.brand}
            data-testid="brand-filter"
            onChange={(event) => setFilter('brand', event.target.value)}
          >
            <option value="">All brands</option>
            {catalog.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select
            value={filters.sort}
            data-testid="sort-filter"
            onChange={(event) => setFilter('sort', event.target.value)}
          >
            {SORTS.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {!products && !error && <p className="loading">Loading products…</p>}

      {products && (
        <>
          <p className="result-count" data-testid="result-count">
            {products.length} product{products.length === 1 ? '' : 's'}
          </p>
          {products.length === 0 && (
            <p className="empty">No accessories match those filters yet. Try clearing the device or category filter.</p>
          )}
          <ul className="grid">
            {products.map((product) => {
              const to = `/products/${product.id}${filters.device ? `?device=${filters.device}` : ''}`;
              return (
                <li className="card" key={product.id} data-testid="product-card">
                  <Link to={to}>
                    <img src={product.image} alt={product.name} />
                    <h2>{product.name}</h2>
                  </Link>
                  <p className="brand">
                    {product.brand} · ★ {product.rating.toFixed(1)}
                  </p>
                  <p className="desc">{product.description}</p>
                  <p className="price">From {currency(product.basePrice)}</p>
                  <Link className="button" to={to}>
                    Configure
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
