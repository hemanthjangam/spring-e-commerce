import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { extractApiErrorMessage } from '../utils/apiError';

export default function Login() {
  const navigate = useNavigate();
  const { setRole, setToken, setUserId, setUserName, onLoginSuccess } = useAuth();

  const [email, setEmail] = useState('demo@store.local');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const token = response.data?.token;
      if (!token) {
        throw new Error('Login failed.');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const activeUserId = payload.sub;

      setToken(token);
      setRole(payload.role);
      setUserId(activeUserId);
      setUserName(payload.name);

      if (onLoginSuccess) {
        await onLoginSuccess(activeUserId, token);
      }

      navigate('/');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-box form-container">
        <span className="eyebrow">Login</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Access your storefront account</h1>
        <p className="section-copy" style={{ marginBottom: '20px' }}>
          Demo user: <strong>demo@store.local</strong> / <strong>demo123</strong>
        </p>

        <form onSubmit={submit} className="form-grid">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>

          {error && <p className="text-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="section-copy" style={{ marginTop: '18px' }}>
          Need a new account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
