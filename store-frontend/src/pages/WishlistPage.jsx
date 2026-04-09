import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi';
import { getWishlist, removeFromWishlist } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { resolveImageUrl } from '../utils/media';

export default function WishlistPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Please log in to view your wishlist.');
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await getWishlist(token);
        if (mounted) {
          setItems(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load wishlist.');
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
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      try {
        await removeFromWishlist(productId, token);
      } catch (err) {
        if (!err.message?.includes('Wishlist item not found')) {
          throw err;
        }
      }
      setItems((current) => current.filter((entry) => entry.product.id !== productId));
    } catch (err) {
      setError(err.message || 'Failed to remove wishlist item.');
    }
  };

  if (loading) {
    return <p className="loading-state page-container">Loading wishlist...</p>;
  }

  if (!token) {
    return (
      <div className="page-container content-box empty-state">
        <p className="text-error">{error}</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Login</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Wishlist</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Saved for later</h1>
        <p className="section-copy">Keep your shortlisted products here and move back to the catalog anytime.</p>
      </section>

      <section className="content-box">
        {error && <p className="text-error">{error}</p>}

        {items.length === 0 ? (
          <div className="empty-state">
            <p>No wishlist items yet.</p>
            <Link to="/category/all" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Explore products
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map(({ product }) => (
              <li key={product.id} className="list-item">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={resolveImageUrl(product.imageUrl, 'https://placehold.co/220x260/F5E7D1/7C2D12?text=Product')}
                    alt={product.name}
                    className="cart-item-image"
                  />
                </Link>
                <div>
                  <p className="product-name">{product.name}</p>
                  <p className="section-copy" style={{ marginTop: '8px' }}>Saved product from your account wishlist.</p>
                </div>
                <div style={{ display: 'grid', gap: '12px', justifyItems: 'end' }}>
                  <span className="product-price">₹{product.price}</span>
                  <button type="button" className="btn btn-danger" onClick={() => handleRemove(product.id)}>
                    <HiOutlineTrash />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
