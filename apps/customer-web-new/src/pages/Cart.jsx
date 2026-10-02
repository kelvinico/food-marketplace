import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal } from '../cart.js';
import { api, getUser } from '../api.js';

export default function Cart() {
  const [cart, setCart] = useState(getCart());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  function refresh(updated) {
    setCart(updated);
  }

  async function handleCheckout() {
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const order = await api('/api/orders', {
        method: 'POST',
        body: {
          vendorId: cart.vendorId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      });

      const payment = await api('/api/payments/initialize', {
        method: 'POST',
        body: { orderId: order.id },
      });

      clearCart();
      window.location.href = payment.checkoutUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <h2>Your cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Your cart</h2>

      <div className="cart-list">
        {cart.items.map((item) => (
          <div className="cart-row" key={item.productId}>
            <div>
              <strong>{item.name}</strong>
              <p className="muted">₦{item.price.toLocaleString('en-NG')} each</p>
            </div>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                refresh(updateQuantity(item.productId, Number(e.target.value)))
              }
              className="qty-input"
            />

            <button
              type="button"
              className="link-button"
              onClick={() => refresh(removeFromCart(item.productId))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <p className="price">Total: ₦{getCartTotal(cart).toLocaleString('en-NG')}</p>

      {error && <p className="error">{error}</p>}

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Placing order...' : 'Checkout and pay'}
      </button>
    </div>
  );
}