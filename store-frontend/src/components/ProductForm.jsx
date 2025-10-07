/* ========================= src/components/ProductForm.jsx (FINAL FIX) ========================= */
import React, { useState, useEffect } from "react";

// The parent components (Create/EditProduct) will pass the initial product state
const ProductForm = ({ initialProduct, handleSubmit, isEdit }) => {
  // Use state internally for form data
  const [product, setProduct] = useState(initialProduct || {});
  // Use state internally for the file object
  const [file, setFile] = useState(null);

  // Sync internal state if initialProduct prop changes (e.g., product details load for editing)
  useEffect(() => {
    // Only update if a product object is actually passed
    if (initialProduct) {
        setProduct(initialProduct);
    }
    setFile(null); // Clear file input on component load
  }, [initialProduct]);

  // Handles changes for all non-file inputs
  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  // Handles file selection
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const submitWrapper = (e) => {
      e.preventDefault();

      // 1. Prepare clean product data object
      const productData = {
          // Send all fields, ensuring correct types for backend (though Spring handles some conversion)
          imageUrl: isEdit ? product.imageUrl : null, // Preserve existing URL if editing and no new file chosen
          ...product,
          price: parseFloat(product.price) || 0,
          categoryId: parseInt(product.categoryId) || 0,
          stock: parseInt(product.stock) || 0,
      };

      // 2. Build FormData object for multipart submission
      const formData = new FormData();

      // Append the product DTO as a JSON blob under the key 'product'
      formData.append('product', new Blob([JSON.stringify(productData)], {
          type: 'application/json'
      }));

      // Append the file under the key 'file'
      if (file) {
          formData.append('file', file);
      } else if (!isEdit) {
          // If creating and no file is chosen, prevent submission (fallback to 'required' attribute)
          alert('Please select an image file.');
          return;
      }

      // 3. Pass FormData to the parent handler
      handleSubmit(formData);
  };

  if (!product) return <p>Loading form data...</p>;

  return (
    <form onSubmit={submitWrapper} className="form-container content-box">
      <div className="form-group">
        <label htmlFor="name" className="form-label">Piece Name</label>
        <input
          id="name"
          name="name"
          placeholder="Signature Gold Watch"
          value={product.name || ''}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="price" className="form-label">Price (₹)</label>
        <input
          id="price"
          name="price"
          type="number"
          placeholder="999.00"
          value={product.price || ''}
          onChange={handleChange}
          required
          className="form-input"
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label htmlFor="categoryId" className="form-label">Collection ID</label>
        <input
          id="categoryId"
          name="categoryId"
          type="number"
          placeholder="101"
          value={product.categoryId || ''}
          onChange={handleChange}
          required
          className="form-input"
          min="1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="stock" className="form-label">Stock Quantity</label>
        <input
          id="stock"
          name="stock"
          type="number"
          placeholder="50"
          value={product.stock || 0}
          onChange={handleChange}
          required
          className="form-input"
          min="0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="A description focusing on craftsmanship and quality..."
          value={product.description || ''}
          onChange={handleChange}
          className="form-textarea"
        />
      </div>

      {/* FILE INPUT */}
      <div className="form-group">
        <label htmlFor="imageFile" className="form-label">{isEdit ? 'Replace Image' : 'Upload Image'}</label>
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="form-input"
          required={!isEdit} // File is required only for creation
        />
        {/* Display current image URL as a fallback/info for editing */}
        {isEdit && product.imageUrl && <p className="text-secondary" style={{fontSize: '0.8rem', marginTop: '5px'}}>Current: {product.imageUrl}</p>}
      </div>


      <button type="submit" className="primary-button submit-button">
        {isEdit ? 'Update Piece Details' : 'Create New Piece'}
      </button>
    </form>
  );
};

export default ProductForm;