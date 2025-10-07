/* ========================= src/pages/CheckoutCancelPage.jsx (Minimalist) ========================= */
import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutCancelPage() {
    return (
        <div className="page-container content-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h2 className="page-header text-error" style={{ fontSize: '2.5rem' }}>PAYMENT CANCELED ❌</h2>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                Your order process was canceled. No charges have been made.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link
                    to="/cart"
                    className="secondary-button"
                >
                    RETURN TO BAG
                </Link>
                <Link
                    to="/"
                    className="primary-button"
                >
                    CONTINUE SHOPPING
                </Link>
            </div>
        </div>
    );
}