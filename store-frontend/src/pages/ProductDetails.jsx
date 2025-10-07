/* ========================= src/pages/ProductDetails.jsx (FINAL FIX) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  addToCart as apiAddToCart,
  createCart as apiCreateCart,
  addToWishlist as apiAddToWishlist,
  getWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  API_BASE_URL
} from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import useWebSocket from '../utils/useWebSocket';

export default function ProductDetails() {
  const { id } = useParams();
  const { token, role } = useAuth();
  const { cartId, setCartId, refreshCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if the current product is in the user's wishlist
  const checkWishlistStatus = useCallback(async () => {
    if (!token || !product) return;
    try {
      const data = await getWishlist(token);
      const isPresent = data.some(item => item?.product?.id === product.id);
      setIsInWishlist(isPresent);
    } catch (e) {
      // If fetching the wishlist fails (e.g., 401), treat as not in wishlist
      setIsInWishlist(false);
    }
  }, [token, product]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // FIX: Use native fetch for public GET /products/{id}
        const res = await fetch(`${API_BASE_URL}/products/${id}`);

        if (!res.ok) {
            // Check for 404/500 etc. errors
            throw new Error(`Failed to fetch product details. Status: ${res.status}`);
        }

        const data = await res.json();
        if (mounted) setProduct(data);

      } catch (err) {
        console.error('Product fetch error', err);
        if (mounted) setError(err.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  // Re-check wishlist status whenever the product or token changes
  useEffect(() => {
    if (product && token) {
      checkWishlistStatus();
    }
  }, [product, token, checkWishlistStatus]);

  // WebSocket for inventory updates (uses useWebSocket from /utils)
  const topic = product ? `inventory/${product.id}` : null;
  const realTime = useWebSocket(topic);

  useEffect(() => {
    if (!realTime || !product) return;
    if (realTime.productId === product.id) {
      setProduct(prev => ({ ...prev, stock: realTime.newStock }));
      setMessage(`Live Inventory Updated: ${realTime.newStock} units remaining.`);
    }
  }, [realTime, product]);

  // Timeout for transient messages (success/stock updates)
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(null); setError(null); }, 4000);
    return () => clearTimeout(t);
  }, [message, error]);

  const ensureCart = useCallback(async () => {
    let currentCartId = cartId;
    const localKey = token ? `savedCartId_${localStorage.getItem('userId')}` : 'cartId';

    if (!currentCartId) {
      const created = await apiCreateCart(token || null);
      currentCartId = created?.id;
      if (currentCartId) {
        setCartId(currentCartId);
        localStorage.setItem(localKey, currentCartId);
      }
    }
    return currentCartId;
  }, [cartId, token, setCartId]);

  const handleAddToCart = useCallback(async () => {
    if (product?.stock !== undefined && product.stock <= 0) {
      setMessage('Item is out of stock.');
      return;
    }
    try {
      const currentCartId = await ensureCart();
      await apiAddToCart(currentCartId, product.id, 1, token || null);
      setMessage('Added to cart successfully.');
      refreshCount(token || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add to cart');
    }
  }, [product, ensureCart, token, refreshCount]);

  // Toggles item in the wishlist
  const handleWishlistToggle = useCallback(async () => {
    if (!token) { setError('Sign in to manage your wishlist.'); return; }

    setError(null);
    setMessage(null);

    if (isInWishlist) {
        try {
            await apiRemoveFromWishlist(product.id, token);
            setMessage('Item removed from your wishlist.');
            setIsInWishlist(false);
        } catch (err) {
            // The API functions handle 401/403 errors by throwing an error message
            setError(err.message || 'Failed to remove from wishlist');
        }
    } else {
        try {
            await apiAddToWishlist(product.id, token);
            setMessage('Item added to your wishlist.');
            setIsInWishlist(true);
        } catch (err) {
             // The API functions handle 409/401/403 errors by throwing an error message
            if (err.message.includes("Product is already in your wishlist")) {
                setMessage("Item is already in your wishlist!");
                setIsInWishlist(true);
            } else {
                setError(err.message || 'Failed to add to wishlist');
            }
        }
    }
  }, [product, token, isInWishlist]);

  if (loading) return <p className="text-secondary page-container">Loading product details...</p>;
  if (!product) return <p className="text-error page-container">Product not found.</p>;

  const currentStock = product.stock ?? 'N/A';
  const isOutOfStock = typeof currentStock === 'number' && currentStock <= 0;
  const low = typeof currentStock === 'number' && currentStock > 0 && currentStock <= 5;

  const stockClass = isOutOfStock ? 'text-error' : (low ? 'text-accent' : 'text-success');

  return (
    <div className="page-container content-box product-layout">
        {/* Left Column: Image and Actions */}
        <div className="product-image-container" style={{ flex: '1 1 40%' }}>
            <img
                src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : 'https://placehold.co/500x500/F5F5F6/D4D5D9?text=PRODUCT'}
                alt={product.name}
                className="product-main-image"
            />

            <div className="product-action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={handleAddToCart}
                    className={`primary-button cart-button ${isOutOfStock ? 'disabled-button' : ''}`}
                    disabled={isOutOfStock}
                    style={{ flex: 2, padding: '15px 0' }}
                >
                    {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
                </button>

                <button
                    onClick={handleWishlistToggle}
                    className="secondary-button wishlist-button"
                    disabled={!token} // Disable if not logged in
                    style={{ flex: 1, padding: '15px 0', borderColor: isInWishlist ? 'var(--color-primary)' : 'var(--color-secondary)', color: isInWishlist ? 'var(--color-primary)' : 'var(--color-secondary)' }}
                >
                    {isInWishlist ? '❤️ SAVED' : '🤍 WISHLIST'}
                </button>
            </div>

            {role === 'ADMIN' && token && (
                <Link to={`/products/${product.id}/edit`} className="secondary-button" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
                    EDIT PRODUCT (ADMIN)
                </Link>
            )}

        </div>

        {/* Right Column: Info and Price */}
        <div className="product-info" style={{ flex: '1 1 60%', padding: '0 1rem' }}>
            {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}
            {message && <p className="text-success" style={{ marginBottom: '1rem' }}>{message}</p>}

            <h1 className="product-name" style={{ fontSize: '1.8rem', fontWeight: 600 }}>{product.name}</h1>
            <p className="text-secondary" style={{ fontSize: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>Product Details & Availability</p>

            <p className="product-price" style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0' }}>
                ₹{product.price}
                <span className="discount">(20% OFF)</span>
            </p>

            <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                <strong style={{ color: 'var(--color-text-dark)' }}>Availability:</strong>
                <span className={stockClass}> {isOutOfStock ? 'OUT OF STOCK' : `${currentStock} units available`}</span>
            </p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.8rem' }}>PRODUCT DESCRIPTION</h3>
            <p className="text-secondary" style={{ lineHeight: 1.5 }}>{product.description}</p>
        </div>
    </div>
  );
}