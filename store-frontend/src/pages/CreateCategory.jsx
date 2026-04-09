import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCategory } from '../api/apiClient';
import { extractApiErrorMessage } from '../utils/apiError';

export default function CreateCategory() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      navigate('/collections');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to create category.'));
    } finally {
      setSubmitting(false);
    }
  }, [name, file, navigate, setError, setSubmitting]);

  if (role !== 'ADMIN') return null;

  return (
    <div className="page-container">
      <section className="hero-card" style={{ marginBottom: "1.5rem" }}>
        <div>
          <p className="eyebrow">Catalog management</p>
          <h1 className="hero-title">Create a new collection</h1>
          <p className="hero-copy">
            Collections organise the storefront and power the category pages.
            Add a name and a strong visual so products feel grouped and clear.
          </p>
        </div>
      </section>

      <div className="content-box">
        <form onSubmit={handleSubmit} className="stack-lg">
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
              Collection details
            </h2>
            <p className="text-secondary">
              Use a simple category name customers can understand at a glance.
            </p>
          </div>

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
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--line)'
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
