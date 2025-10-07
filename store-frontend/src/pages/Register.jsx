/* ========================= src/pages/Register.jsx (Refactored) ========================= */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

export default function Register() {
  const { setToken, setRole, setUserId, setUserName, onLoginSuccess } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 1. Register User
      await apiClient.post('/users', { name, email, password });

      // 2. Auto Login
      const loginRes = await apiClient.post('/auth/login', { email, password });
      const token = loginRes.data?.token;
      if (!token) throw new Error('Login failed after registration');

      // 3. Decode & Set Auth State
      const payload = JSON.parse(atob(token.split('.')[1]));
      const newUserId = payload.sub;

      setToken(token); setRole(payload.role); setUserId(newUserId); setUserName(payload.name);

      // 4. Handle Cart Merge (if anonymous cart exists)
      if (onLoginSuccess) await onLoginSuccess(newUserId, token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check details.');
    }
  };

  return (
    <form onSubmit={submit} className="form-container content-box">
      <h2 className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>SIGN UP</h2>
      {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <div className="form-group">
        <label htmlFor="name" className="form-label">Full Name</label>
        <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="form-input" />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" type="email" required className="form-input" />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required className="form-input" />
      </div>

      <button type="submit" className="primary-button submit-button" style={{ marginTop: '1rem' }}>CREATE ACCOUNT</button>
      <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" className="text-accent">Log In</Link>
      </p>
    </form>
  );
}