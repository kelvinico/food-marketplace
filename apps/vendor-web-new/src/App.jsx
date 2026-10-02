import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import { getUser, clearSession } from './api.js';

export default function App() {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    setUser(null);
    navigate('/');
  }

  return (
    <div>
      <header className="header">
        <Link to="/" className="brand">Bankyloolas Vendor</Link>
        <nav className="nav">
          {user && (
            <>
              <span>Hi, {user.name || user.email}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={user ? <Orders /> : <Login onLogin={setUser} />}
          />
        </Routes>
      </main>
    </div>
  );
}