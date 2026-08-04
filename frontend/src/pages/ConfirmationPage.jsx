import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, currency } from '../api';
import Totals from './Totals.jsx';

export default function ConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.order(id).then(setOrder).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="loading">Loading order…</p>;

  return (
    <section className="confirmation">
      <h1 data-testid="order-confirmed">Thank you, {order.customer.fullName.split(' ')[0]}!</h1>
      <p>
        Your order <strong data-testid="order-id">{order.id}</strong> is confirmed. A receipt was sent to{' '}
        {order.customer.email}.
      </p>

      <h2>Items</h2>
      <ul className="mini-items">
        {order.items.map((line) => (
          <li key={line.key}>
            {line.quantity} × {line.productName}{' '}
            <span className="meta">
              ({[line.deviceName, ...line.options.map((option) => option.valueName)].join(' · ')})
            </span>
            <strong>{currency(line.unitPrice * line.quantity)}</strong>
          </li>
        ))}
      </ul>

      <Totals totals={order.totals} />

      <h2>Shipping to</h2>
      <address>
        {order.customer.address1}
        {order.customer.address2 ? `, ${order.customer.address2}` : ''}
        <br />
        {order.customer.city}, {order.customer.postalCode}
        <br />
        {order.customer.country}
      </address>
      <p className="meta">Paid with card ending {order.payment.last4}</p>
      <Link className="button" to="/">
        Continue shopping
      </Link>
    </section>
  );
}
