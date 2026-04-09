import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi';
import {
  API_BASE_URL,
  addToCart as apiAddToCart,
  addToWishlist as apiAddToWishlist,
  createCart as apiCreateCart,
  getWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { resolveImageUrl } from '../utils/media';

export default function ProductDetails() {
  const { id } = useParams();
  const { token, role } = useAuth();
  const { cartId, setCartId, refreshCount, resetCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to load product details.');
        }

        const data = await response.json();
        if (mounted) {
          setProduct(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load product details.');
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
  }, [id]);

  useEffect(() => {
    if (!token || !product) {
      setIsInWishlist(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const items = await getWishlist(token);
        if (mounted) {
          setIsInWishlist(items.some((item) => item?.product?.id === product.id));
        }
      } catch (err) {
        if (mounted) {
          setIsInWishlist(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [product, token]);

  useEffect(() => {
    if (!message && !error) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [message, error]);

  const handleAddToCart = useCallback(async () => {
    if (!product) {
      return;
    }

    try {
      let activeCartId = cartId;
      if (!activeCartId) {
        const newCart = await apiCreateCart(token || null);
        activeCartId = newCart.id;
        setCartId(activeCartId);
      }

      try {
        await apiAddToCart(activeCartId, product.id, 1, token || null);
      } catch (err) {
        if (!err.message?.includes('Cart not found')) {
          throw err;
        }

        resetCart();
        const replacementCart = await apiCreateCart(token || null);
        activeCartId = replacementCart.id;
        setCartId(activeCartId);
        await apiAddToCart(activeCartId, product.id, 1, token || null);
      }

      await refreshCount(token || null, activeCartId);
      setMessage('Added to cart successfully.');
    } catch (err) {
      setError(err.message || 'Failed to add product to cart.');
    }
  }, [cartId, product, refreshCount, resetCart, setCartId, token]);

  const handleWishlistToggle = useCallback(async () => {
    if (!product) {
      return;
    }

    if (!token) {
      setError('Please log in to manage your wishlist.');
      return;
    }

    try {
      if (isInWishlist) {
        try {
          await apiRemoveFromWishlist(product.id, token);
        } catch (err) {
          if (!err.message?.includes('Wishlist item not found')) {
            throw err;
          }
        }
        setMessage('Removed from wishlist.');
        setIsInWishlist(false);
      } else {
        try {
          await apiAddToWishlist(product.id, token);
        } catch (err) {
          if (!err.message?.includes('already in wishlist')) {
            throw err;
          }
        }
        setMessage('Added to wishlist.');
        setIsInWishlist(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to update wishlist.');
    }
  }, [isInWishlist, product, token]);

  if (loading) {
    return <p className="loading-state page-container">Loading product details...</p>;
  }

  if (!product) {
    return <p className="text-error page-container">{error || 'Product not found.'}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box panel-grid" style={{ alignItems: 'start' }}>
        <div>
          <img
            src={resolveImageUrl(product.imageUrl, 'https://placehold.co/900x1080/F5E7D1/7C2D12?text=Product')}
            alt={product.name}
            className="product-image"
            style={{ borderRadius: '24px' }}
          />
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          <div className="badge-row">
            <span className="eyebrow">Product Detail</span>
            <span className="badge">Category #{product.categoryId}</span>
          </div>

          <div>
            <h1 className="page-header" style={{ marginBottom: '12px' }}>{product.name}</h1>
            <p className="section-copy">{product.description}</p>
          </div>

          <div className="summary-card">
            <p className="text-secondary" style={{ margin: 0 }}>Current price</p>
            <p className="stat-card-value" style={{ marginTop: '8px' }}>₹{product.price}</p>
            <p className="section-copy" style={{ marginTop: '8px' }}>
              Clean DTO-driven product view wired directly to the Spring Boot product endpoint.
            </p>
          </div>

          {message && <div className="metric-pill">{message}</div>}
          {error && <p className="text-error">{error}</p>}

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
              <HiOutlineShoppingBag />
              Add to Cart
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleWishlistToggle}>
              {isInWishlist ? <HiHeart /> : <HiOutlineHeart />}
              {isInWishlist ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          <div className="badge-row">
            <Link to="/category/all" className="btn btn-ghost">Continue shopping</Link>
            {role === 'ADMIN' && <Link to={`/products/${id}/edit`} className="btn btn-secondary">Edit product</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
