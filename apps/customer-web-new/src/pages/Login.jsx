import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await api('/api/auth/register', {
          method: 'POST',
          body: { name, email, password },
        });
      }

      const result = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (result.user.role !== 'customer') {
        setError('This is the customer site. Please use your customer account.');
        setLoading(false);
        return;
      }

      saveSession(result.user, result.token);
      onLogin(result.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <h2>{mode === 'login' ? 'Customer login' : 'Create your account'}</h2>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : mode === 'login'
            ? 'Log in'
            : 'Register'}
        </button>
      </form>

      <p className="muted">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setError('');
            setMode(mode === 'login' ? 'register' : 'login');
          }}
        >
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </a>
      </p>
    </div>
  );
}