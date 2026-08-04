import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const CartContext = createContext(null);

const EMPTY = { items: [], shipping: 'standard', promoCode: null, totals: { itemCount: 0 } };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setCart(await api.cart());
  }, []);

  useEffect(() => {
    let active = true;
    api
      .cart()
      .then((data) => active && setCart(data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(async (action) => {
    setError(null);
    try {
      setCart(await action());
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      error,
      clearError: () => setError(null),
      refresh,
      addItem: (item) => run(() => api.addItem(item)),
      updateItem: (key, quantity) => run(() => api.updateItem(key, quantity)),
      removeItem: (key) => run(() => api.removeItem(key)),
      setPromo: (code) => run(() => api.setPromo(code)),
      setShipping: (shipping) => run(() => api.setShipping(shipping)),
    }),
    [cart, error, refresh, run]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
