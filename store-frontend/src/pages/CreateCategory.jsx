import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCategory } from '../api/apiClient';

export default function CreateCategory() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); // Corrected typo: removed extra parens

  useEffect(() => {
    if (role !== 'ADMIN') navigate('/');
  }, [role, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('An image file is required.');
      return;
    }

    setSubmitting(true);

    const categoryDto = { name };
    const categoryBlob = new Blob([JSON.stringify(categoryDto)], {
      type: 'application/json'
    });

    const formData = new FormData();
    formData.append('category', categoryBlob); // Matches @RequestPart("category")
    formData.append('file', file);             // Matches @RequestPart("file")

    try {
      await createCategory(formData);
      alert('Success! Category created.');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  }, [name, file, navigate, setError, setSubmitting]);

  if (role !== 'ADMIN') return null;

  return (
    <div className="page-container">
      <h2 className="page-header">Add New Category (Admin Panel)</h2>
      <div className="content-box">
        <form onSubmit={handleSubmit}>
          {error && <p className="text-error" style={{ marginBottom: '15px' }}>{error}</p>}

          <div className="form-group">
            <label htmlFor="name" className="form-label">Category Name</label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {previewUrl && (
            <div className="form-group">
              <label className="form-label">Image Preview</label>
              <img
                src={previewUrl}
                alt="Category Preview"
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-border)'
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="imageFile" className="form-label">Category Image</label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-button" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  );
}