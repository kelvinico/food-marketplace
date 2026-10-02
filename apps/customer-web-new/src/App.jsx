import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Products from './pages/Products.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import PaymentResult from './pages/PaymentResult.jsx';
import { getUser, clearSession } from './api.js';
import { getCart } from './cart.js';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [cart, setCart] = useState(getCart());
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the cart count in the header up to date when moving between pages
  useEffect(() => {
    setCart(getCart());
  }, [location]);

  function handleLogout() {
    clearSession();
    setUser(null);
    navigate('/');
  }

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <header className="header">
        <Link to="/" className="brand">Bankyloolas</Link>
        <nav className="nav">
          <Link to="/cart">Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/orders">My orders</Link>
              <span>Hi, {user.name || user.email}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Products onCartChange={setCart} />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />}
          />
          <Route
            path="/orders"
            element={user ? <Orders /> : <Navigate to="/login" />}
          />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
      </main>
    </div>
  );
}