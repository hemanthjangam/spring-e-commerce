/* ========================= src/pages/EditProduct.jsx (Refactored) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import { useAuth } from '../contexts/AuthContext.js';
import apiClient from '../api/apiClient.js';

export default function EditProduct() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role !== 'ADMIN') navigate('/');
  }, [role, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product for editing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = useCallback(async (formData) => {
    try {
      await apiClient.put(`/products/${id}`, formData);
      alert(`Success! Product updated.`);
      navigate(`/products/${id}`);
    } catch (err) {
      alert('Failed to update product: ' + (err.response?.data?.message || err.message));
    }
  }, [id, navigate]);

  if (role !== 'ADMIN') return null;
  if (loading) return <p className="text-secondary page-container">Loading product details...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;
  if (!product) return <p className="text-error page-container">Product not found.</p>;

  return (
    <div className="page-container">
      <h2 className="page-header">Edit Product: {product.name}</h2>
      <div className="content-box">
        <ProductForm
          initialProduct={product}
          handleSubmit={handleSubmit}
          isEdit={true}
        />
      </div>
    </div>
  );
}