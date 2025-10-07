/* ========================= src/pages/CheckoutCancelPage.jsx (Refactored) ========================= */
import React from 'react';
import { Link } from 'react-router-dom';
import { HiXCircle } from 'react-icons/hi';

export default function CheckoutCancelPage() {
    return (
        <div className="page-container content-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
            <HiXCircle className="text-error" style={{ fontSize: '5rem' }} />
            <h2 className="page-header" style={{ border: 'none', marginTop: '1rem' }}>Payment Canceled</h2>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                Your order process was canceled. No charges have been made.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link to="/cart" className="btn btn-secondary">Return to Bag</Link>
                <Link to="/" className="btn btn-primary">Continue Shopping</Link>
            </div>
        </div>
    );
}