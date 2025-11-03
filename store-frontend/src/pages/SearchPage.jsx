import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts, API_BASE_URL } from '../api'; // Make sure to import from api.js

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchProducts(query);
        setProducts(data || []);
      } catch (err) {
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  if (loading) return <p className="text-secondary page-container">Searching...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;

  return (
    <div className="page-container" style={{ paddingBottom: '50px' }}>
      <h1 className="page-header">
        {products.length > 0
          ? `Results for "${query}"`
          : `No results found for "${query}"`}
      </h1>

      {products.length > 0 ? (
        // Use the existing product-grid style from index.css
        <div className="product-grid">
          {products.map(prod => (
            <div key={prod.id} className="product-card">
              <Link to={`/products/${prod.id}`}>
                <img
                  src={prod.imageUrl ? `${API_BASE_URL}${prod.imageUrl}` : 'https://placehold.co/300/F9FAFB/E5E7EB?text=Product'}
                  alt={prod.name}
                  className="product-image"
                />
                <div className="product-info-box">
                  <strong className="product-name">{prod.name}</strong>
                  <span className="product-price">₹{prod.price}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-secondary">
          Try searching for something else, or <Link to="/category/all" style={{ color: 'var(--color-primary)' }}>view all products</Link>.
        </p>
      )}
    </div>
  );
}
