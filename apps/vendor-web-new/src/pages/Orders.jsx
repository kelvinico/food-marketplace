import { useEffect, useState } from 'react';
import { api } from '../api.js';

const NEXT_STATUS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

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
  const [updatingId, setUpdatingId] = useState(null);

  function loadOrders() {
    api('/api/orders')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadOrders, []);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    setError('');

    try {
      await api(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p>Loading orders...</p>;
  if (error && orders.length === 0) return <p className="error">{error}</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      <h2>Incoming orders</h2>
      {error && <p className="error">{error}</p>}

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

            <div className="action-row">
              {NEXT_STATUS[order.status].map((next) => (
                <button
                  key={next}
                  onClick={() => handleStatusChange(order.id, next)}
                  disabled={updatingId === order.id}
                >
                  {updatingId === order.id
                    ? 'Updating...'
                    : `Mark as ${STATUS_LABELS[next]}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}