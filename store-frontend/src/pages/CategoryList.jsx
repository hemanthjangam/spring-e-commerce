import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../api';
import { resolveImageUrl } from '../utils/media';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getAllCategories();
        if (mounted) {
          setCategories(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load collections.');
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
  }, []);

  if (loading) {
    return <p className="loading-state page-container">Loading collections...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Collections</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Browse by curated departments</h1>
        <p className="section-copy" style={{ maxWidth: '60ch' }}>
          Each collection maps directly to the backend category API, so this page stays useful
          when you seed more catalog data or create categories from the admin panel.
        </p>
      </section>

      <section className="category-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            state={{ categoryName: category.name }}
            className="category-card"
          >
            <img
              src={resolveImageUrl(category.imageUrl, 'https://placehold.co/640x720/EEE2CF/52606D?text=Collection')}
              alt={category.name}
              className="category-image"
            />
            <div className="category-info-box">
              <p className="category-name">{category.name}</p>
              <p className="section-copy" style={{ marginTop: '8px', color: 'var(--ink-soft)' }}>
                Open the collection and review every seeded product in that segment.
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
