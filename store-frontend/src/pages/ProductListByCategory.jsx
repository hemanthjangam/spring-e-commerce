/* ========================= src/pages/ProductListByCategory.jsx (Refactored) ========================= */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getProductsByCategory } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api';

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
        console.error(err);
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
      <Link to="/" className="text-secondary" style={{ textDecoration: 'none', marginBottom: '15px', display: 'inline-block', fontWeight: 500 }}>&larr; Back to Collections</Link>
      <h1 className="page-header" style={{ marginBottom: '30px' }}>{categoryName.toUpperCase()}</h1>

      {products.length === 0 ? (
        <p className="text-secondary">No products found in this category.</p>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <div key={p.id} className="product-card">
              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <img
                  src={p.imageUrl ? `${API_BASE_URL}${p.imageUrl}` : 'https://placehold.co/400x300/F5F5F6/D4D5D9?text=PRODUCT'}
                  alt={p.name}
                  className="product-image"
                />
                <div className="product-info-box">
                    <p className="product-name">{p.name}</p>
                    <p className="product-price">
                        ₹{p.price}
                        <span className="discount">(25% OFF)</span>
                    </p>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{p.description ? p.description.substring(0, 40) + '...' : 'Best quality guaranteed.'}</p>
                </div>
              </Link>
              {/* Admin Edit Link */}
              {role === 'ADMIN' && token &&
                <div style={{ padding: '0 0.75rem 0.75rem 0.75rem' }}>
                    <Link to={`/products/${p.id}/edit`} className="secondary-button" style={{ width: '100%', padding: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
                        EDIT
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