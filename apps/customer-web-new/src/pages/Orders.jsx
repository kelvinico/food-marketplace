import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/orders')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p className="error">{error}</p>;
  if (orders.length === 0) return <p>You have no orders yet.</p>;

  return (
    <div>
      <h2>My orders</h2>
      <div className="order-list">
        {orders.map((order) => (
          <div className="card order-card" key={order.id}>
            <div className="order-header">
              <strong>Order #{order.id}</strong>
              <span className={`status-badge status-${order.status}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <p className="muted">
              {new Date(order.created_at).toLocaleString('en-NG')}
            </p>

            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.productId}>
                  {item.quantity} × {item.name} — ₦
                  {item.lineTotal.toLocaleString('en-NG')}
                </li>
              ))}
            </ul>

            <p className="price">
              Total: ₦{Number(order.total).toLocaleString('en-NG')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}