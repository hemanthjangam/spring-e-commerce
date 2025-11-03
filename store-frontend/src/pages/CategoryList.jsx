import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories, API_BASE_URL } from '../api';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllCategories();
        if (mounted) setCategories(data || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load categories');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p className="text-secondary page-container">Loading collections...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;

  return (
    <div className="page-container" style={{ paddingBottom: '50px' }}>
      <h1 className="page-header">Shop by Collection</h1>

      <div className="category-grid">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            state={{ categoryName: cat.name }}
            style={{ textDecoration: 'none' }}
          >
            <div className="category-card">
              <img
                src={cat.imageUrl ? `${API_BASE_URL}${cat.imageUrl}` : 'https://placehold.co/400x380/F9FAFB/E5E7EB?text=Collection'}
                alt={cat.name}
                className="category-image"
              />
              <div className="category-info-box">
                <strong className="category-name">{cat.name}</strong>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link to="/category/all" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1rem' }}>
          View All Products
        </Link>
      </div>
    </div>
  );
}