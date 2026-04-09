import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProductsByCategory } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { resolveImageUrl } from '../utils/media';

export default function ProductListByCategory() {
  const { categoryId } = useParams();
  const location = useLocation();
  const { role } = useAuth();

  const title = location.state?.categoryName || (categoryId === 'all' ? 'All Products' : 'Collection');
  const filterId = useMemo(() => (categoryId === 'all' ? null : categoryId), [categoryId]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getProductsByCategory(filterId);
        if (mounted) {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load products.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filterId]);

  if (loading) {
    return <p className="loading-state page-container">Loading products...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <Link to="/collections" className="btn btn-ghost" style={{ marginBottom: '18px' }}>
          Back to collections
        </Link>
        <span className="eyebrow">Catalog</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>{title}</h1>
        <p className="section-copy">
          {products.length} product{products.length === 1 ? '' : 's'} available in this view.
        </p>
      </section>

      {products.length === 0 ? (
        <section className="content-box empty-state">No products found in this collection.</section>
      ) : (
        <section className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <Link to={`/products/${product.id}`}>
                <img
                  src={resolveImageUrl(product.imageUrl, 'https://placehold.co/640x760/F5E7D1/7C2D12?text=Product')}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info-box">
                  <p className="product-name">{product.name}</p>
                  <p className="section-copy" style={{ marginTop: '10px' }}>{product.description}</p>
                  <div className="product-meta">
                    <span className="badge">Category #{product.categoryId}</span>
                    <span className="product-price">₹{product.price}</span>
                  </div>
                </div>
              </Link>
              {role === 'ADMIN' && (
                <div style={{ padding: '0 18px 18px' }}>
                  <Link to={`/products/${product.id}/edit`} className="btn btn-secondary" style={{ width: '100%' }}>
                    Edit Product
                  </Link>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
