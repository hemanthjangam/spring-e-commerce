/* ========================= src/pages/ProfilePage.jsx (FINAL STABLE) ========================= */
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
        let mounted = true;

        if (!token) {
            if (mounted) {
                setError("Login required to view your profile.");
                setLoading(false);
            }
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await apiClient.get('/profile');
                if (mounted) setProfile(data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                if (mounted) {
                    const status = err.response ? err.response.status : 0;
                    if (status === 401 || status === 403) {
                         setError("Session expired or access denied. Please log in again.");
                    } else {
                         setError(err.message || "Failed to load profile details.");
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [token, navigate]);

    if (!token) {
        return (
            <div className="page-container content-box">
                <p className="text-error">Please <Link to="/login" className="text-accent">log in</Link> to view your profile.</p>
            </div>
        );
    }

    if (loading) return <p className="text-secondary page-container">Loading profile details...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;

    const displayProfile = profile || { name: userName || 'Client', email: 'N/A', id: 'N/A' };

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <h2 className="page-header font-serif">Hello, {displayProfile.name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>

                {/* 1. Account Options (Vertical Menu) */}
                <div className="account-menu">
                    <h3 className="page-header" style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>My Account</h3>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><Link to="/orders" className="nav-link" style={{ display: 'block' }}>Order History</Link></li>
                        <li><Link to="/wishlist" className="nav-link" style={{ display: 'block' }}>Saved Items (Wishlist)</Link></li>
                        {/* Dummy links for features */}
                        <li><Link to="#" className="nav-link" onClick={() => alert('Feature coming soon!')} style={{ display: 'block' }}>Change Password</Link></li>
                        <li><Link to="#" className="nav-link" onClick={() => alert('Support line: +91 98765 43210')} style={{ display: 'block' }}>Customer Support</Link></li>
                        <li><button onClick={logout} className="primary-button small-button" style={{ marginTop: '1rem', width: '100%', textAlign: 'center', padding: '8px 15px' }}>LOG OUT</button></li>
                    </ul>
                </div>

                {/* 2. Personal Information (Details) */}
                <div className="personal-details">
                    <h3 className="page-header" style={{ fontSize: '1.2rem' }}>Personal Information</h3>
                    <div style={{ background: 'var(--color-background-light)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>

                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                            <strong className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>Full Name:</strong>
                            <span className="text-primary">{displayProfile.name}</span>
                        </div>

                        <div style={{ padding: '0.75rem 0' }}>
                            <strong className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>Email:</strong>
                            <span className="text-primary">{displayProfile.email}</span>
                        </div>
                    </div>

                    <h3 className="page-header" style={{ marginTop: '2rem', fontSize: '1.2rem' }}>Membership Details</h3>
                    <div style={{ background: 'var(--color-background-light)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
                         <div style={{ padding: '0.75rem 0' }}>
                            <strong className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>Client ID:</strong>
                            <span className="text-primary">{displayProfile.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}