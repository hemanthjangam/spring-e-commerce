import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api';
import { resolveImageUrl } from '../utils/media';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await searchProducts(query);
        if (mounted) {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Search failed.');
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
  }, [query]);

  if (loading) {
    return <p className="loading-state page-container">Searching products...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Search</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>
          {products.length ? `Results for "${query}"` : `No results for "${query}"`}
        </h1>
        <p className="section-copy">
          Search is wired to the backend `/products/search` endpoint and updates in the main navigation as well.
        </p>
      </section>

      {products.length === 0 ? (
        <section className="content-box empty-state">
          <p>Try another term, or browse the full catalog.</p>
          <Link to="/category/all" className="btn btn-primary" style={{ marginTop: '16px' }}>
            View all products
          </Link>
        </section>
      ) : (
        <section className="product-grid">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="product-card">
              <img
                src={resolveImageUrl(product.imageUrl, 'https://placehold.co/640x760/F5E7D1/7C2D12?text=Product')}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info-box">
                <p className="product-name">{product.name}</p>
                <p className="section-copy" style={{ marginTop: '10px' }}>{product.description}</p>
                <div className="product-meta">
                  <span className="badge">Search result</span>
                  <span className="product-price">₹{product.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
