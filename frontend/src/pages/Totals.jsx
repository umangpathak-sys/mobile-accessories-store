import { currency } from '../api';

export default function Totals({ totals }) {
  return (
    <dl className="totals" data-testid="totals">
      <dt>Subtotal</dt>
      <dd data-testid="subtotal">{currency(totals.subtotal)}</dd>
      {totals.discount > 0 && (
        <>
          <dt>Discount ({totals.promo.code})</dt>
          <dd data-testid="discount">−{currency(totals.discount)}</dd>
        </>
      )}
      <dt>Shipping{totals.shippingMethod === 'express' ? ' (express)' : ''}</dt>
      <dd data-testid="shipping">{totals.shipping === 0 ? 'Free' : currency(totals.shipping)}</dd>
      <dt>Tax</dt>
      <dd data-testid="tax">{currency(totals.tax)}</dd>
      <dt className="grand">Total</dt>
      <dd className="grand" data-testid="total">
        {currency(totals.total)}
      </dd>
    </dl>
  );
}
