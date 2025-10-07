/* ========================= src/pages/ProfilePage.jsx (Refactored) ========================= */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';

export default function ProfilePage() {
    const { token, userName, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        (async () => {
            try {
                const { data } = await apiClient.get('/profile');
                setProfile(data);
            } catch (err) {
                setError("Session expired or access denied. Please log in again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [token, navigate]);

    if (loading) return <p className="text-secondary page-container">Loading profile details...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;

    const displayProfile = profile || { name: userName || 'User', email: 'N/A', id: 'N/A' };

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <h2 className="page-header">Hello, {displayProfile.name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
                <div className="account-menu">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>My Account</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><Link to="/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%'}}>Order History</Link></li>
                        <li><Link to="/wishlist" className="btn btn-secondary" style={{ justifyContent: 'flex-start', width: '100%'}}>Wishlist</Link></li>
                        <li><button onClick={logout} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>LOG OUT</button></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Personal Information</h3>
                    <div style={{ background: 'var(--color-background-light)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
                        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                            <strong className="text-secondary">Full Name:</strong>
                            <p className="text-primary" style={{margin: '0.25rem 0 0 0'}}>{displayProfile.name}</p>
                        </div>
                        <div style={{ paddingTop: '0.75rem' }}>
                            <strong className="text-secondary">Email:</strong>
                            <p className="text-primary" style={{margin: '0.25rem 0 0 0'}}>{displayProfile.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}