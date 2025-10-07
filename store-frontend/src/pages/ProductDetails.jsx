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
import { HiOutlineShoppingBag, HiOutlineHeart, HiHeart } from 'react-icons/hi';

export default function ProductDetails() {
  const { id } = useParams();
  const { token, role } = useAuth();
  const { cartId, setCartId, refreshCount } = useCart();

  // State Management
  const [product, setProduct] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // --- Data Fetching ---

  // Fetch main product details on component load
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product. Status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check wishlist status when product or token changes
  useEffect(() => {
    if (!token || !product) {
      setIsInWishlist(false);
      return;
    }
    const checkWishlist = async () => {
      try {
        const currentWishlist = await getWishlist(token);
        const isProductInWishlist = currentWishlist.some(item => item?.product?.id === product.id);
        setIsInWishlist(isProductInWishlist);
      } catch {
        setIsInWishlist(false); // Assume not in wishlist if fetch fails
      }
    };
    checkWishlist();
  }, [product, token]);


  // --- WebSocket for Live Inventory ---

  const topic = product ? `inventory/${product.id}` : null;
  const realTimeUpdate = useWebSocket(topic);

  useEffect(() => {
    // This is the robust check to prevent crashes from null or malformed messages
    if (
      realTimeUpdate &&
      product &&
      realTimeUpdate.productId === product.id &&
      realTimeUpdate.newStock !== null &&
      realTimeUpdate.newStock !== undefined
    ) {
      setProduct(prevProduct => ({ ...prevProduct, stock: realTimeUpdate.newStock }));
      setMessage(`Live inventory updated: ${realTimeUpdate.newStock} units left.`);
    }
  }, [realTimeUpdate, product]);


  // --- User Actions ---

  const handleAddToCart = useCallback(async () => {
    if (product.stock <= 0) {
      setError('This item is out of stock.');
      return;
    }
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        const newCart = await apiCreateCart(token);
        currentCartId = newCart.id;
        setCartId(currentCartId);
      }
      await apiAddToCart(currentCartId, product.id, 1, token);
      setMessage('Added to bag successfully!');
      refreshCount();
    } catch (err) {
      setError(err.message || 'Failed to add item to bag.');
    }
  }, [product, cartId, token, setCartId, refreshCount]);

  const handleWishlistToggle = useCallback(async () => {
    if (!token) {
      setError('Please log in to manage your wishlist.');
      return;
    }
    try {
      if (isInWishlist) {
        await apiRemoveFromWishlist(product.id, token);
        setMessage('Removed from your wishlist.');
      } else {
        await apiAddToWishlist(product.id, token);
        setMessage('Added to your wishlist!');
      }
      setIsInWishlist(!isInWishlist); // Toggle the state
    } catch (err) {
      setError(err.message || 'An error occurred while updating your wishlist.');
    }
  }, [product, token, isInWishlist]);


  // --- UI & Render ---

  // Effect to clear messages after a few seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  if (loading) {
    return <p className="text-secondary page-container">Loading product details...</p>;
  }

  if (!product) {
    return <p className="text-error page-container">{error || 'Product not found.'}</p>;
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="page-container">
      <div className="content-box" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Left Column: Image */}
        <div style={{ flex: '1 1 45%' }}>
          <img
            src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : 'https://placehold.co/500x500/F9FAFB/E5E7EB?text=Product'}
            alt={product.name}
            style={{ width: '100%', borderRadius: 'var(--border-radius)' }}
          />
        </div>

        {/* Right Column: Details & Actions */}
        <div style={{ flex: '1 1 55%' }}>

          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{product.name}</h1>
          <p className="text-secondary" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>{product.description}</p>

          <p className="product-price" style={{ fontSize: '2.5rem', margin: '1.5rem 0' }}>
            ₹{product.price}
            <span className="product-discount">(20% OFF)</span>
          </p>

          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            <strong>Availability:</strong>
            <span className={isOutOfStock ? 'text-error' : 'text-success'}>
              {isOutOfStock ? ' Out of Stock' : ` ${product.stock} units available`}
            </span>
          </p>

          {/* Action Messages */}
          {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          {message && <p className="text-success" style={{ marginBottom: '1rem' }}>{message}</p>}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleAddToCart}
              className={`btn btn-primary ${isOutOfStock ? 'btn-disabled' : ''}`}
              disabled={isOutOfStock}
              style={{ flex: 2, padding: '15px' }}
            >
              <HiOutlineShoppingBag />
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <button
              onClick={handleWishlistToggle}
              className="btn btn-secondary"
              disabled={!token}
              style={{ flex: 1, padding: '15px' }}
            >
              {isInWishlist ? <HiHeart style={{ color: 'var(--color-accent)' }} /> : <HiOutlineHeart />}
              Wishlist
            </button>
          </div>

          {/* Admin Edit Link */}
          {role === 'ADMIN' && (
            <Link to={`/products/${id}/edit`} className="btn btn-secondary" style={{ marginTop: '1rem', display: 'block' }}>
              Edit Product (Admin)
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}