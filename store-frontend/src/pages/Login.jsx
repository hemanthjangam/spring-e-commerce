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
    e.preventDefault(); setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res.data?.token;
      if (!token) throw new Error('Login failed');

      // Decode & Set Auth State
      const payload = JSON.parse(atob(token.split('.')[1]));
      const newUserId = payload.sub;

      setToken(token); setRole(payload.role); setUserId(newUserId); setUserName(payload.name);

      // Handle Cart Merge (if anonymous cart exists)
      if (onLoginSuccess) await onLoginSuccess(newUserId, token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <form onSubmit={submit} className="form-container content-box">
      <h2 className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>LOG IN</h2>
      {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input id="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input id="password" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
      </div>

      <button type="submit" className="primary-button submit-button" style={{ marginTop: '1rem' }}>LOG IN</button>
      <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        New User? <Link to="/register" className="text-accent">Create Account</Link>
      </p>
    </form>
  );
}