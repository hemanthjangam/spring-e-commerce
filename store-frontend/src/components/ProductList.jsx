/* ========================= src/components/ProductList.jsx (Minimalist) ========================= */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { useAuth } from '../contexts/AuthContext';

const ProductList = () => {
  const { token, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/products`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          setError(res.status === 401 ? "Unauthorized. Please login." : "Failed to fetch products.");
          return;
        }

        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Network error. Please try again.");
      } finally {
          setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  if (loading) return <p className="text-secondary page-container">Loading products...</p>;
  if (error) return <p className="text-error page-container">{error}</p>;
  if (!products.length) return <p className="text-secondary page-container">No products available.</p>;

  return (
    <div className="page-container content-box">
      <h2 className="page-header">ALL PRODUCTS (ADMIN VIEW)</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {products.map((product) => (
          <li key={product.id} className="list-item">
            <Link to={`/products/${product.id}`} className="nav-link">
              {product.name}
            </Link>
            {token && role === "ADMIN" && (
              <Link to={`/products/${product.id}/edit`}>
                <button className="secondary-button small-button">Edit</button>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;