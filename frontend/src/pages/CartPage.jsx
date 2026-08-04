import { useState } from 'react';
import { Link } from 'react-router-dom';
import { currency } from '../api';
import { useCart } from '../CartContext.jsx';
import Totals from './Totals.jsx';

export default function CartPage() {
  const { cart, error, updateItem, removeItem, setPromo, setShipping } = useCart();
  const [promoInput, setPromoInput] = useState(cart.promoCode || '');

  if (cart.items.length === 0) {
    return (
      <>
        <h1>Your cart</h1>
        {error && <p className="error" data-testid="cart-error">{error}</p>}
        <p className="empty" data-testid="empty-cart">
          Your cart is empty. <Link to="/">Browse accessories</Link>.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      {error && (
        <p className="error" data-testid="cart-error">
          {error}
        </p>
      )}
      <div className="cart-layout">
        <ul className="cart-items">
          {cart.items.map((line) => (
            <li className="cart-item" key={line.key} data-testid="cart-item">
              <img src={line.image} alt={line.productName} />
              <div className="cart-item-body">
                <h2>{line.productName}</h2>
                <p className="meta">For {line.deviceName}</p>
                {line.options.length > 0 && (
                  <p className="meta">
                    {line.options.map((option) => `${option.optionName}: ${option.valueName}`).join(' · ')}
                  </p>
                )}
                <p className="price">{currency(line.unitPrice)} each</p>
              </div>
              <div className="cart-item-actions">
                <div className="inline">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={line.quantity}
                    data-testid="line-quantity"
                    onChange={(event) => updateItem(line.key, Number(event.target.value))}
                  />
                </div>
                <button type="button" className="link" data-testid="remove-item" onClick={() => removeItem(line.key)}>
                  Remove
                </button>
                <p className="line-total" data-testid="line-total">
                  {currency(line.unitPrice * line.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h2>Order summary</h2>
          {cart.totals.freeShippingRemaining > 0 && cart.shipping === 'standard' && (
            <p className="hint">
              Add {currency(cart.totals.freeShippingRemaining)} more for free standard shipping.
            </p>
          )}

          <div className="shipping-form">
            <label>
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={cart.shipping === 'standard'}
                data-testid="shipping-standard"
                onChange={() => setShipping('standard')}
              />{' '}
              Standard (3-5 days)
            </label>
            <label>
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={cart.shipping === 'express'}
                data-testid="shipping-express"
                onChange={() => setShipping('express')}
              />{' '}
              Express (1-2 days)
            </label>
          </div>

          <form
            className="promo-form"
            onSubmit={(event) => {
              event.preventDefault();
              setPromo(promoInput);
            }}
          >
            <input
              type="text"
              placeholder="Promo code"
              value={promoInput}
              data-testid="promo-input"
              onChange={(event) => setPromoInput(event.target.value)}
            />
            <button type="submit" data-testid="apply-promo">
              Apply
            </button>
          </form>

          <Totals totals={cart.totals} />
          <Link className="button primary block" to="/checkout" data-testid="checkout-link">
            Checkout
          </Link>
        </aside>
      </div>
    </>
  );
}
