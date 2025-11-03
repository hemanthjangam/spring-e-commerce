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
      await apiClient.post('/users', { name, email, password });

      const loginRes = await apiClient.post('/auth/login', { email, password });
      const token = loginRes.data?.token;
      if (!token) throw new Error('Login failed after registration');

      const payload = JSON.parse(atob(token.split('.')[1]));
      const newUserId = payload.sub;

      setToken(token);
      setRole(payload.role);
      setUserId(newUserId);
      setUserName(payload.name);

      if (onLoginSuccess) await onLoginSuccess(newUserId, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={submit} className="form-container content-box">
        <h2 className="page-header" style={{ textAlign: 'center', border: 'none' }}>Create Account</h2>
        {error && <p className="text-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <div className="form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input id="name" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
        </div>

        <button type="submit" className="btn btn-primary submit-button">Create Account</button>
        <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>Log In</Link>
        </p>
      </form>
    </div>
  );
}