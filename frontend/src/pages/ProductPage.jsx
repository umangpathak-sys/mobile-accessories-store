import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, currency } from '../api';
import { useCart } from '../CartContext.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, error: cartError, clearError } = useCart();

  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [deviceId, setDeviceId] = useState(searchParams.get('device') || '');
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    clearError();
    api
      .product(id)
      .then((data) => {
        setProduct(data);
        const defaults = {};
        data.options.forEach((option) => {
          if (option.required) defaults[option.id] = option.values[0].id;
        });
        setSelections(defaults);
      })
      .catch((err) => setLoadError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    return product.options.reduce((total, option) => {
      const value = option.values.find((candidate) => candidate.id === selections[option.id]);
      return total + (value ? value.priceDelta : 0);
    }, product.basePrice);
  }, [product, selections]);

  if (loadError) return <p className="error">{loadError}</p>;
  if (!product) return <p className="loading">Loading product…</p>;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const added = await addItem({ productId: product.id, deviceId, selections, quantity });
    setBusy(false);
    if (added) navigate('/cart');
  }

  return (
    <>
      <Link className="back" to="/">
        ← Back to catalog
      </Link>
      <section className="product">
        <img className="product-image" src={product.image} alt={product.name} />
        <div className="product-detail">
          <h1>{product.name}</h1>
          <p className="brand">
            {product.brand} · ★ {product.rating.toFixed(1)}
          </p>
          <p>{product.description}</p>

          {cartError && (
            <p className="error" data-testid="config-error">
              {cartError}
            </p>
          )}

          <form onSubmit={submit}>
            <label className="field">
              Device
              <select
                value={deviceId}
                required
                data-testid="device-select"
                onChange={(event) => setDeviceId(event.target.value)}
              >
                <option value="">Select your device</option>
                {product.compatibleDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </label>

            {product.options.map((option) => (
              <label className="field" key={option.id}>
                {option.name}
                {option.required ? '' : ' (optional)'}
                <select
                  value={selections[option.id] || ''}
                  required={option.required}
                  data-testid={`option-${option.id}`}
                  onChange={(event) =>
                    setSelections((current) => ({ ...current, [option.id]: event.target.value }))
                  }
                >
                  {!option.required && <option value="">No thanks</option>}
                  {option.values.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                      {value.priceDelta ? ` (+${currency(value.priceDelta)})` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label className="field qty">
              Quantity
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                data-testid="quantity"
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </label>

            <p className="price big">
              Price: <span data-testid="configured-price">{currency(unitPrice * (quantity || 1))}</span>
            </p>
            <button className="button primary" type="submit" disabled={busy} data-testid="add-to-cart">
              {busy ? 'Adding…' : 'Add to cart'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
