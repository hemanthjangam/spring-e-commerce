/* ========================= src/pages/CartPage.jsx (Refactored) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getCart, createCart as apiCreateCart, updateCartItem, removeFromCart, initiateCheckout } from '../api';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { token, userId } = useAuth();
  const { cartId: contextCartId, setCartId, refreshCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const localKey = userId ? `savedCartId_${userId}` : 'cartId';

  const fetchCart = useCallback(async (idToFetch) => {
    setLoading(true); setError(null);
    try {
      const data = await getCart(idToFetch, token || null);
      setCart(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch cart');
    } finally { setLoading(false); }
  }, [token]);

  const ensureCart = useCallback(async () => {
    let current = contextCartId || localStorage.getItem(localKey);
    if (!current) {
      const created = await apiCreateCart(token || null);
      current = created?.id;
      if (current) { setCartId(current); localStorage.setItem(localKey, current); }
    }
    return current;
  }, [contextCartId, localKey, setCartId, token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = await ensureCart();
      if (!mounted) return;
      if (id) await fetchCart(id);
      else setLoading(false);
    })();
    return () => { mounted = false; };
  }, [ensureCart, fetchCart]);

  const getCurrentCartId = () => contextCartId || localStorage.getItem(localKey);

  const handleQuantity = async (productId, qty) => {
    setError(null); setMessage(null);
    const newQty = Math.max(1, parseInt(qty) || 1);
    try {
      await updateCartItem(getCurrentCartId(), productId, newQty, token || null);
      await fetchCart(getCurrentCartId());
      refreshCount(token || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    setError(null); setMessage(null);
    try {
      await removeFromCart(getCurrentCartId(), productId, token || null);
      await fetchCart(getCurrentCartId());
      refreshCount(token || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!token) { setError('Login required to checkout'); return; }
    if (!cart || !cart.items || cart.items.length === 0) { setError('Cart is empty'); return; }
    setError(null); setMessage('Redirecting to checkout...');
    try {
      const res = await initiateCheckout(getCurrentCartId(), token);
      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Checkout failed.');
      setMessage(null);
    }
  };

  if (loading) return <p className="text-secondary page-container">Loading cart...</p>;

  const items = cart?.items || [];
  const subtotal = items.reduce((s, it) => s + (parseFloat(it.totalPrice || 0)), 0);

  return (
    <div className="page-container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

      {/* Left Column: Cart Items */}
      <div style={{ flex: '2 1 66%' }}>
        <h2 className="page-header">SHOPPING BAG ({items.length})</h2>
        {error && <p className="text-error content-box" style={{ marginBottom: '1rem' }}>{error}</p>}
        {message && <p className="text-success content-box" style={{ marginBottom: '1rem' }}>{message}</p>}

        {items.length === 0 ? (
          <div className="content-box">
            <p className="text-secondary">Your bag is empty. <Link to="/category/all" className="text-accent">Start Shopping</Link>.</p>
          </div>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {items.map(it => (
              <li key={it.product.id} className="list-item" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                <Link to={`/products/${it.product.id}`} style={{ display: 'flex' }}>
                    <img
                        src={it.product.imageUrl ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${it.product.imageUrl}` : 'https://placehold.co/90x120/f0f0f0/ccc?text=ITEM'}
                        alt={it.product.name}
                        className="cart-item-image"
                    />
                </Link>
                <div style={{ flexGrow: 1 }}>
                    <strong className="cart-item-name">{it.product.name}</strong>
                    <div className="text-secondary" style={{ fontSize: '0.9rem' }}>Unit Price: ₹{it.product.price}</div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                        <div className="text-secondary">Qty:</div>
                        <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={e => handleQuantity(it.product.id, e.target.value)}
                            className="form-input"
                            style={{ width: '60px', padding: '6px', fontSize: '1rem' }}
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-accent" style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{it.totalPrice}</div>
                  <button onClick={() => handleRemove(it.product.id)} className="secondary-button" style={{ padding: '6px 10px', fontSize: '0.75rem', marginTop: '10px' }}>
                    REMOVE
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Column: Price Details */}
      <div className="content-box" style={{ flex: '1 1 33%', position: 'sticky', top: '7rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>PRICE DETAILS</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Bag Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <span className="text-success">Shipping (Free)</span>
            <span className="text-success">₹0.00</span>
        </div>

        <div className="cart-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                <span>Total Payable</span>
                <span className="text-accent">₹{subtotal.toFixed(2)}</span>
            </div>

            {token ? (
              <button onClick={handleCheckout} className="primary-button submit-button" style={{ width: '100%', padding: '15px' }}>
                  PROCEED TO CHECKOUT
              </button>
            ) : (
              <p className="text-error" style={{ textAlign: 'center', fontSize: '0.9rem' }}>Please log in to proceed.</p>
            )}
        </div>
      </div>
    </div>
  );
}