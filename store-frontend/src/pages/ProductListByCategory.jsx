/* ========================= src/pages/ProductListByCategory.jsx (Refactored) ========================= */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getProductsByCategory, API_BASE_URL } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function ProductListByCategory() {
  const { categoryId } = useParams();
  const location = useLocation();
  const { token, role } = useAuth();

  const categoryName = location.state?.categoryName || (categoryId === 'all' ? 'All Products' : 'Category Products');
  const filterId = useMemo(() => (categoryId === 'all' ? null : categoryId), [categoryId]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null);
    (async () => {
      try {
        const data = await getProductsByCategory(filterId);
        if (mounted) setProducts(data || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load products.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [filterId]);

  if (loading) return <p className="text-secondary page-container">Loading products...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;

  return (
    <div className="page-container">
      <Link to="/" className="text-secondary" style={{ textDecoration: 'none', marginBottom: '15px', display: 'inline-block', fontWeight: 500 }}>
        &larr; Back to Collections
      </Link>
      <h1 className="page-header">{categoryName}</h1>

      {products.length === 0 ? (
        <p className="text-secondary">No products found in this category.</p>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <div key={p.id} className="product-card">
              <Link to={`/products/${p.id}`}>
                <img
                  src={p.imageUrl ? `${API_BASE_URL}${p.imageUrl}` : 'https://placehold.co/400x300/F9FAFB/E5E7EB?text=Product'}
                  alt={p.name}
                  className="product-image"
                />
                <div className="product-info-box">
                  <p className="product-name">{p.name}</p>
                  <p className="product-price">
                    ₹{p.price}
                    <span className="product-discount">(25% OFF)</span>
                  </p>
                </div>
              </Link>
              {role === 'ADMIN' && token &&
                <div style={{ padding: '0 16px 16px' }}>
                  <Link to={`/products/${p.id}/edit`} className="btn btn-secondary" style={{ width: '100%' }}>
                    Edit
                  </Link>
                </div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}