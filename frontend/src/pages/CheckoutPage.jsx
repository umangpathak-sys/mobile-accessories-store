import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, currency } from '../api';
import { useCart } from '../CartContext.jsx';
import Totals from './Totals.jsx';

const FIELDS = [
  { name: 'fullName', label: 'Full name' },
  { name: 'email', label: 'Email' },
  { name: 'address1', label: 'Address' },
  { name: 'address2', label: 'Apartment, suite (optional)' },
];

const ADDRESS_ROW = [
  { name: 'city', label: 'City' },
  { name: 'postalCode', label: 'Postal code' },
  { name: 'country', label: 'Country' },
];

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (cart.items.length === 0 && !placed) return <Navigate to="/cart" replace />;

  const update = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  const field = ({ name, label }) => (
    <label className="field" key={name}>
      {label}
      <input name={name} value={form[name] || ''} data-testid={name} onChange={update(name)} autoComplete="off" />
      {fieldErrors[name] && <span className="error">{fieldErrors[name]}</span>}
    </label>
  );

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const order = await api.checkout(form);
      setPlaced(true);
      navigate(`/orders/${order.id}`);
      refresh();
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Checkout</h1>
      <div className="cart-layout">
        <form className="checkout-form" onSubmit={submit}>
          <h2>Shipping details</h2>
          {error && (
            <p className="error" data-testid="checkout-error">
              {error}
            </p>
          )}
          {FIELDS.map(field)}
          <div className="row">{ADDRESS_ROW.map(field)}</div>

          <h2>Payment</h2>
          <p className="hint">Demo checkout — use test card 4242 4242 4242 4242.</p>
          {field({ name: 'cardNumber', label: 'Card number' })}
          <div className="row">
            {field({ name: 'cardExpiry', label: 'Expiry (MM/YY)' })}
            {field({ name: 'cardCvc', label: 'Security code' })}
          </div>

          <button className="button primary" type="submit" disabled={busy} data-testid="place-order">
            {busy ? 'Placing order…' : `Place order · ${currency(cart.totals.total)}`}
          </button>
        </form>

        <aside className="summary">
          <h2>Order summary</h2>
          <ul className="mini-items">
            {cart.items.map((line) => (
              <li key={line.key}>
                {line.quantity} × {line.productName} <span className="meta">({line.deviceName})</span>
                <strong>{currency(line.unitPrice * line.quantity)}</strong>
              </li>
            ))}
          </ul>
          <Totals totals={cart.totals} />
          <Link to="/cart">Edit cart</Link>
        </aside>
      </div>
    </>
  );
}
