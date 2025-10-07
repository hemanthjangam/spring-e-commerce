/* ========================= src/pages/CheckoutSuccessPage.jsx (Refactored) ========================= */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HiCheckCircle } from 'react-icons/hi';

export default function CheckoutSuccessPage() {
  const query = new URLSearchParams(useLocation().search);
  const orderId = query.get('orderId');

  return (
    <div className="page-container content-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <HiCheckCircle className="text-success" style={{ fontSize: '5rem' }} />
      <h2 className="page-header" style={{ border: 'none', marginTop: '1rem' }}>Order Placed Successfully!</h2>
      <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
        Thank you for your purchase. We are processing your order.
      </p>
      {orderId && <p className="text-secondary">Order ID: <strong style={{color: 'var(--color-text-dark)'}}>#{orderId}</strong></p>}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/orders" className="btn btn-secondary">View Orders</Link>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}