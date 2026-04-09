import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { token, userName, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Please log in to view your account.');
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { data } = await apiClient.get('/profile');
        if (mounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load your profile.');
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
  }, [token]);

  if (loading) {
    return <p className="loading-state page-container">Loading account...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  const displayProfile = profile || { name: userName || 'User', email: 'N/A' };

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Account</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Hello, {displayProfile.name}</h1>
        <p className="section-copy">Manage your profile, wishlist, and order history from one place.</p>
      </section>

      <section className="panel-grid">
        <aside className="dashboard-card account-menu">
          <Link to="/orders" className="btn btn-secondary">Order history</Link>
          <Link to="/wishlist" className="btn btn-secondary">Wishlist</Link>
          <button type="button" className="btn btn-primary" onClick={logout}>Log out</button>
        </aside>

        <article className="dashboard-card">
          <h2 className="page-header" style={{ fontSize: '1.35rem' }}>Personal information</h2>
          <div className="feature-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="summary-card">
              <p className="text-secondary">Full name</p>
              <p className="stat-card-value" style={{ fontSize: '1.35rem' }}>{displayProfile.name}</p>
            </div>
            <div className="summary-card">
              <p className="text-secondary">Email</p>
              <p className="stat-card-value" style={{ fontSize: '1.1rem' }}>{displayProfile.email}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
