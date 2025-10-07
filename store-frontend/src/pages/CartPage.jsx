/* ========================= src/pages/CartPage.jsx (Refactored) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getCart, createCart as apiCreateCart, updateCartItem, removeFromCart, initiateCheckout, API_BASE_URL } from '../api';
import { Link } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi';

export default function CartPage() {
  const { token } = useAuth();
  const { cartId, setCartId, refreshCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async (id) => {
    if (!id) {
      setLoading(false);
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getCart(id, token || null);
      setCart(data);
    } catch {
      setError('Failed to fetch your bag. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const ensureCart = useCallback(async () => {
    if (cartId) return cartId;
    const created = await apiCreateCart(token || null);
    if (created?.id) setCartId(created.id);
    return created?.id;
  }, [cartId, token, setCartId]);

  useEffect(() => {
    (async () => {
      const id = await ensureCart();
      fetchCart(id);
    })();
  }, [ensureCart, fetchCart]);

  const handleQuantity = async (productId, qty) => {
    const newQty = Math.max(1, parseInt(qty) || 1);
    try {
      await updateCartItem(cartId, productId, newQty, token || null);
      fetchCart(cartId);
      refreshCount(token || null);
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(cartId, productId, token || null);
      fetchCart(cartId);
      refreshCount(token || null);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!token) { setError('Please log in to proceed to checkout.'); return; }
    if (!cart?.items?.length) return;
    try {
      const res = await initiateCheckout(cartId, token);
      window.location.href = res.checkoutUrl;
    } catch (err) {
      setError(err.message || 'Checkout failed.');
    }
  };

  if (loading) return <p className="text-secondary page-container">Loading your bag...</p>;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="page-container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 66%' }}>
        <h2 className="page-header">Shopping Bag ({items.length})</h2>
        {error && <p className="text-error content-box" style={{ marginBottom: '1rem' }}>{error}</p>}

        {items.length === 0 ? (
          <div className="content-box">
            <p className="text-secondary">Your bag is empty. <Link to="/category/all" style={{ color: 'var(--color-primary)' }}>Start Shopping!</Link></p>
          </div>
        ) : (
          <div className="content-box">
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {items.map(it => (
                <li key={it.product.id} className="list-item">
                  <Link to={`/products/${it.product.id}`}>
                    <img src={`${API_BASE_URL}${it.product.imageUrl}`} alt={it.product.name} className="cart-item-image" />
                  </Link>
                  <div style={{ flexGrow: 1 }}>
                    <strong className="text-primary">{it.product.name}</strong>
                    <div className="text-secondary" style={{ fontSize: '0.9rem' }}>Unit Price: ₹{it.product.price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                      <label htmlFor={`qty-${it.product.id}`} className="text-secondary" style={{ marginRight: '10px' }}>Qty:</label>
                      <input id={`qty-${it.product.id}`} type="number" min="1" value={it.quantity} onChange={e => handleQuantity(it.product.id, e.target.value)} className="form-input" style={{ width: '70px' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>₹{it.totalPrice}</div>
                    <button onClick={() => handleRemove(it.product.id)} className="btn btn-icon" title="Remove Item"><HiOutlineTrash /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="content-box" style={{ flex: '1 1 33%', position: 'sticky', top: `calc(var(--nav-height) + 30px)` }}>
        <h3 className="page-header" style={{ fontSize: '1.2rem' }}>Price Details</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Bag Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <span className="text-success">Shipping (Free)</span>
          <span className="text-success">₹0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          <span>Total Payable</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {token ? (
          <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', padding: '15px' }} disabled={items.length === 0}>
            Proceed to Checkout
          </button>
        ) : (
          <p className="text-error" style={{ textAlign: 'center' }}>Please log in to proceed.</p>
        )}
      </div>
    </div>
  );
}