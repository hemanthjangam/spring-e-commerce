/* ========================= src/components/ProductForm.jsx (Refactored) ========================= */
import React, { useState, useEffect } from "react";

const ProductForm = ({ initialProduct, handleSubmit, isEdit }) => {
  const [product, setProduct] = useState(initialProduct || {});
  const [file, setFile] = useState(null);

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
        <label htmlFor="categoryId" className="form-label">Category ID</label>
        <input id="categoryId" name="categoryId" type="number" value={product.categoryId || ''} onChange={handleChange} required className="form-input" min="1" />
      </div>
      <div className="form-group">
        <label htmlFor="stock" className="form-label">Stock Quantity</label>
        <input id="stock" name="stock" type="number" value={product.stock || 0} onChange={handleChange} required className="form-input" min="0" />
      </div>
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea id="description" name="description" value={product.description || ''} onChange={handleChange} className="form-textarea" />
      </div>
      <div className="form-group">
        <label htmlFor="imageFile" className="form-label">{isEdit ? 'Replace Image' : 'Upload Image'}</label>
        <input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} className="form-input" required={!isEdit} />
        {isEdit && product.imageUrl && <p className="text-secondary" style={{fontSize: '0.8rem', marginTop: '5px'}}>Current image path: {product.imageUrl}</p>}
      </div>
      <button type="submit" className="btn btn-primary submit-button">
        {isEdit ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;