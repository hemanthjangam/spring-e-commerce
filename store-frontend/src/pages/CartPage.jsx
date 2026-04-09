import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  createCart as apiCreateCart,
  getCart,
  initiateCheckout,
  removeFromCart,
  updateCartItem,
} from '../api';
import { resolveImageUrl } from '../utils/media';

export default function CartPage() {
  const { token } = useAuth();
  const { cartId, setCartId, refreshCount, resetCart } = useCart();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async (id) => {
    if (!id) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getCart(id, token || null);
      setCart(data);
      setError(null);
    } catch (err) {
      if (err.message?.includes('Cart not found')) {
        resetCart();
        const created = await apiCreateCart(token || null);
        if (created?.id) {
          setCartId(created.id);
          const freshCart = await getCart(created.id, token || null);
          setCart(freshCart);
          setError(null);
          return;
        }
      }

      setError(err.message || 'Failed to load your cart.');
    } finally {
      setLoading(false);
    }
  }, [resetCart, setCartId, token]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      let activeCartId = cartId;
      if (!activeCartId) {
        const created = await apiCreateCart(token || null);
        activeCartId = created?.id;
        if (mounted && activeCartId) {
          setCartId(activeCartId);
        }
      }

      if (mounted) {
        await fetchCart(activeCartId);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [cartId, fetchCart, setCartId, token]);

  const handleQuantity = async (productId, quantity) => {
    const nextQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    try {
      await updateCartItem(cartId, productId, nextQuantity, token || null);
      await fetchCart(cartId);
      await refreshCount(token || null, cartId);
    } catch (err) {
      setError(err.message || 'Failed to update cart quantity.');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(cartId, productId, token || null);
      await fetchCart(cartId);
      await refreshCount(token || null, cartId);
    } catch (err) {
      setError(err.message || 'Failed to remove the item.');
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      setError('Please log in to continue to checkout.');
      return;
    }

    if (!cart?.items?.length) {
      return;
    }

    try {
      setCheckingOut(true);
      const response = await initiateCheckout(cartId, token);
      window.location.href = response.checkoutUrl;
    } catch (err) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return <p className="loading-state page-container">Loading your cart...</p>;
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((total, item) => total + Number(item.totalPrice || 0), 0);

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Cart</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Your bag</h1>
        <p className="section-copy">Review your items, adjust quantity, and continue to checkout.</p>
      </section>

      <section className="panel-grid">
        <div className="content-box">
          {error && <p className="text-error">{error}</p>}

          {items.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <Link to="/category/all" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Browse products
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((item) => (
                <li key={item.product.id} className="list-item">
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={resolveImageUrl(item.product.imageUrl, 'https://placehold.co/220x260/F5E7D1/7C2D12?text=Product')}
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                  </Link>

                  <div>
                    <p className="product-name">{item.product.name}</p>
                    <p className="section-copy" style={{ marginTop: '8px' }}>Unit price: ₹{item.product.price}</p>
                    <div style={{ marginTop: '14px', maxWidth: '120px' }}>
                      <label htmlFor={`qty-${item.product.id}`} className="form-label">Quantity</label>
                      <input
                        id={`qty-${item.product.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => handleQuantity(item.product.id, event.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px', justifyItems: 'end' }}>
                    <span className="product-price">₹{item.totalPrice}</span>
                    <button type="button" className="btn btn-danger" onClick={() => handleRemove(item.product.id)}>
                      <HiOutlineTrash />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="summary-card" style={{ height: 'fit-content' }}>
          <span className="eyebrow">Summary</span>
          <h2 className="page-header" style={{ marginTop: '14px', fontSize: '1.45rem' }}>Price details</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Items</span>
              <strong>{items.reduce((total, item) => total + item.quantity, 0)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Shipping</span>
              <strong className="text-success">Free</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <span className="product-name">Total payable</span>
              <span className="product-price">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '22px' }}
            onClick={handleCheckout}
            disabled={!items.length || checkingOut}
          >
            {checkingOut ? 'Redirecting...' : 'Proceed to checkout'}
          </button>

          {!token && (
            <p className="section-copy" style={{ marginTop: '14px' }}>
              Login is required before checkout.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}
