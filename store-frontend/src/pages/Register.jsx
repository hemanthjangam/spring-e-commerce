import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { extractApiErrorMessage } from '../utils/apiError';

export default function Register() {
  const navigate = useNavigate();
  const { setRole, setToken, setUserId, setUserName, onLoginSuccess } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/users', { name, email, password });
      const loginResponse = await apiClient.post('/auth/login', { email, password });
      const token = loginResponse.data?.token;
      if (!token) {
        throw new Error('Registration succeeded but login failed.');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      setToken(token);
      setRole(payload.role);
      setUserId(payload.sub);
      setUserName(payload.name);

      if (onLoginSuccess) {
        await onLoginSuccess(payload.sub, token);
      }

      navigate('/');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-box form-container">
        <span className="eyebrow">Register</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Create a customer account</h1>
        <p className="section-copy" style={{ marginBottom: '20px' }}>
          Register against the live Spring Boot backend and continue directly into the storefront.
        </p>

        <form onSubmit={submit} className="form-grid">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full name</label>
            <input id="name" className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" type="email" className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>

          {error && <p className="text-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="section-copy" style={{ marginTop: '18px' }}>
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
