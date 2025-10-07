/* ========================= src/pages/CreateProduct.jsx (Refactored) ========================= */
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

export default function CreateProduct() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'ADMIN') navigate('/');
  }, [role, navigate]);

  const handleSubmit = useCallback(async (formData) => {
    try {
      await apiClient.post('/products', formData);
      alert(`Success! Product created.`);
      navigate('/category/all');
    } catch (err) {
      alert('Failed to create product: ' + (err.response?.data?.message || err.message));
    }
  }, [navigate]);

  if (role !== 'ADMIN') return null;

  return (
    <div className="page-container">
      <h2 className="page-header">Add New Product (Admin Panel)</h2>
      <div className="content-box">
        <ProductForm handleSubmit={handleSubmit} isEdit={false} />
      </div>
    </div>
  );
}