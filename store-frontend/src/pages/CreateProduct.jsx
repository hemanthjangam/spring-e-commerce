import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';
import { extractApiErrorMessage } from '../utils/apiError';

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
      alert('Failed to create product: ' + extractApiErrorMessage(err, 'Request failed'));
    }
  }, [navigate]);

  if (role !== 'ADMIN') return null;

  return (
    <div className="page-container">
      <section className="hero-card" style={{ marginBottom: "1.5rem" }}>
        <div>
          <p className="eyebrow">Catalog management</p>
          <h1 className="hero-title">Add a product to the storefront</h1>
          <p className="hero-copy">
            Create well-structured products with category, pricing, description,
            and a storefront image in one place.
          </p>
        </div>
      </section>

      <div className="content-box">
        <ProductForm handleSubmit={handleSubmit} isEdit={false} />
      </div>
    </div>
  );
}
