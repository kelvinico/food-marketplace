const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('admin_token');
}

export function logout() {
  localStorage.removeItem('admin_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.user?.role !== 'admin') {
    throw new Error('This account is not an admin');
  }
  localStorage.setItem('admin_token', data.token);
  return data;
}

export const getStats = () => request('/api/admin/stats');
export const getOrders = () => request('/api/admin/orders');
export const getUsers = () => request('/api/admin/users');
export const getPayments = () => request('/api/admin/payments');
