import { Link, NavLink, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import { useCart } from './CartContext.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function Header({ catalog }) {
  const { cart } = useCart();
  const [searchParams] = useSearchParams();
  const activeSearch = searchParams.get('search') || '';
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const term = new FormData(event.target).get('search').trim();
    navigate(term ? `/?search=${encodeURIComponent(term)}` : '/');
  }

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="logo" to="/">
          mobile<span>accessories</span>
        </Link>
        <form className="search" onSubmit={submit}>
          <input
            key={activeSearch}
            type="search"
            name="search"
            defaultValue={activeSearch}
            placeholder="Search cases, chargers, audio…"
            data-testid="search-input"
          />
          <button type="submit">Search</button>
        </form>
        <Link className="cart-link" to="/cart" data-testid="cart-link">
          Cart
          <span className="badge" data-testid="cart-count">
            {cart.totals.itemCount}
          </span>
        </Link>
      </div>
      <nav className="wrap subnav">
        <NavLink to="/" end>
          All
        </NavLink>
        {catalog.platforms.map((platform) => (
          <Link key={platform.id} to={`/?platform=${platform.id}`}>
            {platform.name}
          </Link>
        ))}
        {catalog.categories.map((category) => (
          <Link key={category.id} to={`/?category=${category.id}`}>
            {category.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.catalog().then(setCatalog).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="wrap error">{error}</p>;
  if (!catalog) return <p className="wrap loading">Loading store…</p>;

  return (
    <>
      <Header catalog={catalog} />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<CatalogPage catalog={catalog} />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>Demo storefront · Free standard shipping over $75 · Promo codes: SAVE10, MOBILE5</p>
        </div>
      </footer>
    </>
  );
}
