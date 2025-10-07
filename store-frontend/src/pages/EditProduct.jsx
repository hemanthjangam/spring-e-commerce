/* ========================= src/pages/EditProduct.jsx (REWRITTEN - Simplified) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import { useAuth } from '../contexts/AuthContext.js';
import apiClient from '../api/apiClient.js';

export default function EditProduct() {
  const { role, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not ADMIN or not logged in
  useEffect(() => {
      if (!token || role !== 'ADMIN') navigate('/');
  }, [role, token, navigate]);

  useEffect(() => {
    let mounted = true;

    if (!token || role !== 'ADMIN') {
        if (mounted) { setLoading(false); setError("Access Denied. Admin privileges required."); }
        return;
    }

    (async () => {
      try {
        const { data } = await apiClient.get(`/products/${id}`);
        if (mounted) {
            setProduct({
                ...data,
                // Ensure number fields are stored as strings for input compatibility
                price: (data.price ?? 0).toString(),
                categoryId: (data.categoryId ?? 0).toString(),
                stock: (data.stock ?? 0).toString(),
                imageUrl: data.imageUrl || ''
            });
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
            if (err.response && err.response.status === 401) {
                // This message is shown before the global interceptor takes over
                setError('Unauthorized. Session expired. Please log in again.');
            } else {
                setError('Failed to fetch product for editing.');
            }
        }
      } finally { if (mounted) setLoading(false); }
    })();

    return () => { mounted = false; };
  }, [id, token, role]);

  const handleSubmit = useCallback(async (formData) => {
    if (!token || role !== 'ADMIN') {
        alert('Unauthorized action. Please log in as an Admin.');
        navigate('/login');
        return;
    }

    try {
      // Receives FormData from ProductForm and submits via apiClient
      await apiClient.put(`/products/${id}`, formData);
      alert(`Success! Piece updated.`);
      navigate(`/products/${id}`);
    } catch (err) {
      console.error(err);

      const status = err.response ? err.response.status : 0;

      if (status === 401 || status === 403) {
           alert('Update failed: Your session has expired. Please log in to continue.');
      } else {
          alert('Failed to update piece: ' + (err.response?.data?.message || err.message));
      }
    }
  }, [id, navigate, token, role]);

  if (!token || role !== 'ADMIN') return <p className="text-error page-container">Access Denied. Admin privileges required.</p>;
  if (loading) return <p className="text-secondary page-container">Loading piece details...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;
  if (!product) return <p className="text-error page-container">Piece not found.</p>;

  return (
    <div className="page-container">
      <h2 className="page-header font-serif">Edit Piece: {product.name}</h2>
      {product && <ProductForm
        initialProduct={product}
        handleSubmit={handleSubmit}
        isEdit={true}
      />}
    </div>
  );
}