import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories, getProductsByCategory } from '../api';
import { resolveImageUrl } from '../utils/media';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          getAllCategories(),
          getProductsByCategory(null),
        ]);

        if (!mounted) {
          return;
        }

        setCategories(categoryData || []);
        setProducts(productData || []);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load the storefront.');
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

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const spotlightProduct = featuredProducts[0];

  if (loading) {
    return <p className="loading-state page-container">Loading storefront...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '28px' }}>
      <section className="content-box hero-card split-hero">
        <div className="hero-copy">
          <span className="eyebrow">Modern Storefront</span>
          <h1 className="hero-title">Curated essentials for everyday living.</h1>
          <p className="hero-description">
            Browse a clean catalog, save products to your wishlist, manage your cart,
            and review real order history using the same backend APIs that power the app.
          </p>

          <div className="hero-actions">
            <Link to="/category/all" className="btn btn-primary">Shop All Products</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>

          <div className="stat-grid">
            <article className="stat-card">
              <p className="stat-card-label">Categories</p>
              <p className="stat-card-value">{categories.length}</p>
            </article>
            <article className="stat-card">
              <p className="stat-card-label">Live Products</p>
              <p className="stat-card-value">{products.length}</p>
            </article>
            <article className="stat-card">
              <p className="stat-card-label">Demo Login</p>
              <p className="stat-card-value" style={{ fontSize: '1.1rem' }}>demo@store.local</p>
            </article>
          </div>
        </div>

        <div className="hero-aside">
          {spotlightProduct && (
            <article className="summary-card featured-product">
              <span className="eyebrow">Spotlight</span>
              <img
                src={resolveImageUrl(spotlightProduct.imageUrl, 'https://placehold.co/640x760/F5E7D1/7C2D12?text=Featured+Product')}
                alt={spotlightProduct.name}
                className="product-image"
                style={{ borderRadius: '24px' }}
              />
              <div>
                <h2 className="page-header" style={{ marginBottom: '10px', fontSize: '1.6rem' }}>
                  {spotlightProduct.name}
                </h2>
                <p className="section-copy">{spotlightProduct.description}</p>
                <p className="product-price">₹{spotlightProduct.price}</p>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="eyebrow">Catalog</span>
          <h2 className="page-header" style={{ marginTop: '14px', fontSize: '1.35rem' }}>Structured product browsing</h2>
          <p className="section-copy">Browse by collection, search instantly, and open detailed product pages with cart and wishlist actions.</p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">Account</span>
          <h2 className="page-header" style={{ marginTop: '14px', fontSize: '1.35rem' }}>Real auth-backed flows</h2>
          <p className="section-copy">Login, profile, wishlist, order history, and checkout all run against the Spring Boot backend.</p>
        </article>
        <article className="feature-card">
          <span className="eyebrow">Admin</span>
          <h2 className="page-header" style={{ marginTop: '14px', fontSize: '1.35rem' }}>Simple catalog management</h2>
          <p className="section-copy">Seeded admin access is ready for creating categories and products with multipart image uploads.</p>
        </article>
      </section>

      <section className="content-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'end', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow">Collections</span>
            <h2 className="page-header" style={{ marginTop: '12px' }}>Shop by category</h2>
          </div>
          <Link to="/category/all" className="btn btn-ghost">View full catalog</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              state={{ categoryName: category.name }}
              className="category-card"
            >
              <img
                src={resolveImageUrl(category.imageUrl, 'https://placehold.co/640x700/EEE2CF/52606D?text=Collection')}
                alt={category.name}
                className="category-image"
              />
              <div className="category-info-box">
                <p className="category-name">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'end', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow">Featured</span>
            <h2 className="page-header" style={{ marginTop: '12px' }}>Popular picks from the seeded catalog</h2>
          </div>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
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
                  <span className="badge">Category #{product.categoryId}</span>
                  <span className="product-price">₹{product.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
