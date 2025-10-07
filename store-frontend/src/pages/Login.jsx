/* ========================= src/pages/Login.jsx (Refactored) ========================= */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

export default function Login() {
  const { setToken, setRole, setUserId, setUserName, onLoginSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res.data?.token;
      if (!token) throw new Error('Login failed');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const newUserId = payload.sub;

      setToken(token);
      setRole(payload.role);
      setUserId(newUserId);
      setUserName(payload.name);

      if (onLoginSuccess) await onLoginSuccess(newUserId, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={submit} className="form-container content-box">
        <h2 className="page-header" style={{ textAlign: 'center', border: 'none' }}>Log In</h2>
        {error && <p className="text-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
        </div>

        <button type="submit" className="btn btn-primary submit-button">Log In</button>
        <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          New here? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>Create an Account</Link>
        </p>
      </form>
    </div>
  );
}