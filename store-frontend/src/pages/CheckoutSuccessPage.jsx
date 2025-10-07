/* ========================= src/pages/CheckoutSuccessPage.jsx (Minimalist) ========================= */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  const query = new URLSearchParams(useLocation().search);
  const orderId = query.get('orderId');
  return (
    <div className="page-container content-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <h2 className="page-header text-success" style={{ fontSize: '2.5rem' }}>ORDER PLACED SUCCESSFULLY ✅</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Thank you for your purchase. We are processing your order now.</p>
      {orderId && <p className="text-secondary">Order ID: <strong className="text-accent">#{orderId}</strong></p>}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/orders" className="secondary-button">VIEW ORDERS</Link>
        <Link to="/" className="primary-button">CONTINUE SHOPPING</Link>
      </div>
    </div>
  );
}