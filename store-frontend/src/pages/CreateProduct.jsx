/* ========================= src/pages/CreateProduct.jsx (REWRITTEN - Simplified) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

export default function CreateProduct() {
  const { role, token } = useAuth();
  const navigate = useNavigate();
  const [initialProduct] = useState({ name: '', price: '', categoryId: '', description: '', imageUrl: '', stock: 0 });

  // Redirect if not ADMIN or not logged in
  useEffect(() => { if (!token || role !== 'ADMIN') navigate('/'); }, [role, token, navigate]);

  const handleSubmit = useCallback(async (formData) => {
    if (!token || role !== 'ADMIN') {
        alert('Unauthorized action. Please log in as an Admin.');
        navigate('/login');
        return;
    }

    try {
      // Receives FormData from ProductForm and submits via apiClient
      await apiClient.post('/products', formData);
      alert(`Success! Product created.`);
      navigate('/category/all');
    } catch (err) {
      console.error(err);
      // The 401/403 errors will be handled by apiClient.js, but this catches other failures
      alert('Failed to create product: ' + (err.response?.data?.message || err.message));
    }
  }, [navigate, token, role]);

  if (!token || role !== 'ADMIN') return <p className="text-error page-container">Access Denied. Admin privileges required.</p>;

  return (
    <div className="page-container">
      <h2 className="page-header">ADD NEW PRODUCT (ADMIN)</h2>
      <ProductForm
        initialProduct={initialProduct}
        handleSubmit={handleSubmit}
        isEdit={false}
      />
    </div>
  );
}