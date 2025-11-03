import React, { useState, useEffect } from "react";
import { getAllCategories, API_BASE_URL } from '../api';

const ProductForm = ({ initialProduct, handleSubmit, isEdit }) => {
  const [product, setProduct] = useState(initialProduct || {});
  const [file, setFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // Use the API function to get categories
        const cats = await getAllCategories();
        setCategories(cats || []);
        setErrorCategories(null);
      } catch (err) {
        setErrorCategories('Failed to load categories');
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEdit && initialProduct?.imageUrl) {
      setPreviewUrl(`${API_BASE_URL}${initialProduct.imageUrl}`); //
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else if (isEdit && initialProduct?.imageUrl) {
      setPreviewUrl(`${API_BASE_URL}${initialProduct.imageUrl}`);
    } else {
      setPreviewUrl(null);
    }
  }, [file, isEdit, initialProduct]); // Re-run this logic if the file or product changes

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
    setFile(null);
  }, [initialProduct]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const submitWrapper = (e) => {
    e.preventDefault();

    const productData = {
      ...product,
      price: parseFloat(product.price) || 0,
      categoryId: parseInt(product.categoryId) || 0,
      stock: parseInt(product.stock) || 0,
    };

    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file);
    } else if (!isEdit) {
      alert('Please select an image file for the new product.');
      return;
    }

    handleSubmit(formData);
  };

  return (
    <form onSubmit={submitWrapper}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">Product Name</label>
        <input id="name" name="name" value={product.name || ''} onChange={handleChange} required className="form-input" />
      </div>

      <div className="form-group">
        <label htmlFor="price" className="form-label">Price (₹)</label>
        <input id="price" name="price" type="number" value={product.price || ''} onChange={handleChange} required className="form-input" min="0" step="0.01" />
      </div>

      <div className="form-group">
        <label htmlFor="categoryId" className="form-label">Category</label>
        <select
          id="categoryId"
          name="categoryId"
          value={product.categoryId || ''}
          onChange={handleChange}
          required
          className="form-input"
        >
          <option value="" disabled>
            {loadingCategories ? 'Loading categories...' : 'Select a category'}
          </option>
          {errorCategories && <option value="" disabled>{errorCategories}</option>}

          {!loadingCategories && !errorCategories && categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="stock" className="form-label">Stock Quantity</label>
        <input id="stock" name="stock" type="number" value={product.stock || 0} onChange={handleChange} required className="form-input" min="0" />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea id="description" name="description" value={product.description || ''} onChange={handleChange} className="form-textarea" />
      </div>

      {previewUrl && (
        <div className="form-group">
          <label className="form-label">Image Preview</label>
          <img
            src={previewUrl}
            alt="Product Preview"
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
        <label htmlFor="imageFile" className="form-label">{isEdit ? 'Replace Image' : 'Upload Image'}</label>
        <input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} className="form-input" required={!isEdit} />
        {isEdit && !file && product.imageUrl && <p className="text-secondary" style={{fontSize: '0.8rem', marginTop: '5px'}}>Current image: {product.imageUrl}</p>}
      </div>

      <button type="submit" className="btn btn-primary submit-button">
        {isEdit ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;