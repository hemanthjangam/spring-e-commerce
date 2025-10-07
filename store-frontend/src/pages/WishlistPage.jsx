/* ========================= src/pages/WishlistPage.jsx (Refactored) ========================= */
import React, { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { getWishlist, removeFromWishlist } from "../api";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const { token } = useAuth();
  const [wishlistEntries, setWishlistEntries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
        setError("Login is required to view your saved items.");
        setWishlistEntries([]);
        setLoading(false);
        return;
    }

    const fetchWishlist = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await getWishlist(token);
        setWishlistEntries(data || []);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
        setError(err.message || 'Failed to load wishlist.');
        setWishlistEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId, token);
      setWishlistEntries((prev) =>
        prev.filter((entry) => entry?.product?.id !== productId)
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to remove item.');
    }
  };

  if (loading) return <p className="text-secondary page-container">Loading wishlist...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;
  if (!token) return <p className="text-secondary page-container">Please log in to view your wishlist.</p>;

  const productsInWishlist = wishlistEntries.filter(entry => entry?.product);

  return (
    <div className="page-container content-box" style={{ maxWidth: '900px' }}>
      <h2 className="page-header">MY WISHLIST ({productsInWishlist.length})</h2>
      {productsInWishlist.length === 0 ? (
          <p className="text-secondary">Your wishlist is empty. <Link to="/category/all" className="text-accent">Start adding items!</Link></p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {productsInWishlist.map((entry) => {
              const product = entry.product;

              return (
                  <li key={product.id} className="list-item">
                      <Link to={`/products/${product.id}`} className="nav-link" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, color: 'var(--color-text-dark)', textTransform: 'none' }}>
                          <img
                              src={product.imageUrl ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${product.imageUrl}` : 'https://placehold.co/80x100/F5F5F6/D4D5D9?text=ITEM'}
                              alt={product.name}
                              className="cart-item-image"
                              style={{ width: '80px', height: '100px', marginRight: '1.5rem' }}
                          />
                          <div style={{ flexGrow: 1 }}>
                              <span className="product-name" style={{ fontSize: '1.1rem' }}>{product.name}</span>
                              <span className="product-price text-accent" style={{ display: 'block', fontSize: '1.2rem' }}>₹{product.price}</span>
                          </div>
                      </Link>
                      <button onClick={() => handleRemove(product.id)} className="secondary-button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>REMOVE</button>
                  </li>
              );
          })}
        </ul>
      )}
    </div>
  );
};