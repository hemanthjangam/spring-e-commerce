import React, { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { getWishlist, removeFromWishlist, API_BASE_URL } from "../api";
import { Link } from "react-router-dom";
import { HiOutlineTrash } from "react-icons/hi";

export default function WishlistPage() {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your wishlist.");
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist(token);
        setWishlist(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId, token);
      setWishlist(prev => prev.filter(entry => entry.product.id !== productId));
    } catch (err) {
      setError(err.message || 'Failed to remove item.');
    }
  };

  if (loading) return <p className="text-secondary page-container">Loading your wishlist...</p>;
  if (!token) return <p className="text-error page-container">Please <Link to="/login" style={{ color: 'var(--color-primary)' }}>log in</Link> to view your wishlist.</p>;

  return (
    <div className="page-container content-box" style={{ maxWidth: '900px' }}>
      <h2 className="page-header">My Wishlist ({wishlist.length})</h2>
      {error && <p className="text-error">{error}</p>}

      {wishlist.length === 0 ? (
        <p className="text-secondary">Your wishlist is empty. <Link to="/category/all" style={{ color: 'var(--color-primary)' }}>Explore products!</Link></p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {wishlist.map(({ product }) => (
            <li key={product.id} className="list-item">
              <Link to={`/products/${product.id}`} style={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={`${API_BASE_URL}${product.imageUrl}`}
                  alt={product.name}
                  className="cart-item-image"
                />
                <div style={{ flexGrow: 1 }}>
                  <span className="text-primary" style={{ fontWeight: '600' }}>{product.name}</span>
                  <span className="product-price" style={{ display: 'block', fontSize: '1.2rem' }}>₹{product.price}</span>
                </div>
              </Link>
              <button onClick={() => handleRemove(product.id)} className="btn btn-icon" title="Remove from Wishlist"><HiOutlineTrash /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};