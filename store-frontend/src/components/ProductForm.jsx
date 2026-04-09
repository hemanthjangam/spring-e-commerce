import React, { useEffect, useState } from "react";
import { API_BASE_URL, getAllCategories } from "../api";

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};

const ProductForm = ({ initialProduct, handleSubmit, isEdit }) => {
  const [product, setProduct] = useState(
    initialProduct || {
      name: "",
      price: "",
      description: "",
      categoryId: "",
      imageUrl: "",
    }
  );
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
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
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(buildImageUrl(initialProduct?.imageUrl));
    return undefined;
  }, [file, initialProduct]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
    setFile(null);
  }, [initialProduct]);

  const handleChange = (e) =>
    setProduct({ ...product, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const submitWrapper = (e) => {
    e.preventDefault();

    const productData = {
      ...product,
      price: parseFloat(product.price) || 0,
      categoryId: parseInt(product.categoryId) || 0,
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
    <form onSubmit={submitWrapper} className="stack-lg">
      <div>
        <p className="eyebrow">Admin workspace</p>
        <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
          {isEdit ? "Update product details" : "Create a new product"}
        </h2>
        <p className="text-secondary">
          Keep the product information short, accurate, and easy to scan in the
          storefront.
        </p>
      </div>

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
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          value={product.description || ''}
          onChange={handleChange}
          className="form-textarea"
          rows="5"
        />
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
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)'
            }}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="imageFile" className="form-label">{isEdit ? 'Replace Image' : 'Upload Image'}</label>
        <input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} className="form-input" required={!isEdit} />
        {isEdit && !file && product.imageUrl && (
          <p className="text-secondary" style={{ fontSize: "0.88rem", marginTop: "0.45rem" }}>
            Leave empty to keep the current product image.
          </p>
        )}
      </div>

      <button type="submit" className="btn btn-primary submit-button">
        {isEdit ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;
