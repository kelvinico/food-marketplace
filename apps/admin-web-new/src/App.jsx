import { useState } from 'react';
import { getToken, logout } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <Dashboard
      onLogout={() => {
        logout();
        setLoggedIn(false);
      }}
    />
  );
}