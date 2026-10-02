import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { addToCart } from '../cart.js';

export default function Products({ onCartChange }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    api('/api/products')
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(product) {
    const cart = addToCart(product);
    onCartChange(cart);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  }

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;
  if (products.length === 0) return <p>No products available yet.</p>;

  return (
    <div>
      <h2>Menu</h2>
      <div className="grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <h3>{product.name}</h3>
            <p className="muted">{product.description}</p>
            <p className="price">
              ₦{Number(product.price).toLocaleString('en-NG')}
            </p>
            <button onClick={() => handleAdd(product)}>
              {addedId === product.id ? 'Added!' : 'Add to cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}