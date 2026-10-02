import { useEffect, useState } from 'react';
import { getStats, getOrders, getUsers, getPayments } from '../api';

const naira = (n) => '₦' + Number(n || 0).toLocaleString();
const date = (d) => new Date(d).toLocaleString();

function Overview({ stats }) {
  const sum = (rows) => rows.reduce((a, r) => a + r.count, 0);
  return (
    <div className="grid">
      <div className="card">
        <h3>Users</h3>
        <p className="big">{sum(stats.users)}</p>
        {stats.users.map((r) => (
          <p key={r.role}>{r.role}: {r.count}</p>
        ))}
      </div>
      <div className="card">
        <h3>Orders</h3>
        <p className="big">{sum(stats.orders)}</p>
        {stats.orders.map((r) => (
          <p key={r.status}>{r.status}: {r.count} ({naira(r.total)})</p>
        ))}
      </div>
      <div className="card">
        <h3>Payments</h3>
        <p className="big">{sum(stats.payments)}</p>
        {stats.payments.map((r) => (
          <p key={r.status}>{r.status}: {r.count} ({naira(r.total)})</p>
        ))}
      </div>
    </div>
  );
}

function Table({ headers, rows }) {
  if (!rows.length) return <p>Nothing here yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    const loaders = {
      overview: getStats,
      orders: getOrders,
      users: getUsers,
      payments: getPayments,
    };
    loaders[tab]()
      .then(setData)
      .catch((err) => {
        setError(err.message);
        if (/token|admin/i.test(err.message)) onLogout();
      });
  }, [tab]);

  function renderTab() {
    if (error) return <p className="error">{error}</p>;
    if (!data) return <p>Loading...</p>;
    if (tab === 'overview') return <Overview stats={data} />;
    if (tab === 'orders')
      return (
        <Table
          headers={['ID', 'Customer', 'Vendor', 'Total', 'Status', 'Date']}
          rows={data.map((o) => [
            o.id,
            o.customer_name || o.customer_email,
            o.vendor_name,
            naira(o.total),
            o.status,
            date(o.created_at),
          ])}
        />
      );
    if (tab === 'users')
      return (
        <Table
          headers={['ID', 'Name', 'Email', 'Role', 'Joined']}
          rows={data.map((u) => [u.id, u.name, u.email, u.role, date(u.created_at)])}
        />
      );
    return (
      <Table
        headers={['ID', 'Order', 'Reference', 'Amount', 'Status', 'Date']}
        rows={data.map((p) => [
          p.id,
          p.order_id,
          p.reference,
          naira(p.amount),
          p.status,
          date(p.created_at),
        ])}
      />
    );
  }

  return (
    <div className="dash">
      <header>
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout}>Log out</button>
      </header>
      <nav>
        {['overview', 'orders', 'users', 'payments'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <main>{renderTab()}</main>
    </div>
  );
}