import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  const reference = searchParams.get('tx_ref');
  const flwStatus = searchParams.get('status');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setError('No payment reference found in the URL.');
      return;
    }

    if (flwStatus === 'cancelled') {
      setStatus('cancelled');
      return;
    }

    api(`/api/payments/verify/${reference}`)
      .then((result) => {
        setStatus(result.status === 'success' ? 'success' : 'failed');
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message);
      });
  }, [reference, flwStatus]);

  if (status === 'checking') {
    return (
      <div className="card form-card">
        <h2>Checking your payment...</h2>
        <p className="muted">This will just take a moment.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="card form-card">
        <h2>Payment successful</h2>
        <p>Thank you! Your order has been paid for and the vendor has been notified.</p>
        <Link to="/">Back to menu</Link>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="card form-card">
        <h2>Payment cancelled</h2>
        <p>You cancelled the payment. Your order is still saved if you'd like to try again.</p>
        <Link to="/">Back to menu</Link>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="card form-card">
        <h2>Payment failed</h2>
        <p>Something went wrong with the payment. Please try again.</p>
        <Link to="/">Back to menu</Link>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <h2>Something went wrong</h2>
      <p className="error">{error}</p>
      <Link to="/">Back to menu</Link>
    </div>
  );
}