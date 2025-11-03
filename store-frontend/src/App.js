import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getCartItemCount } from "./api";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import './App.css'; // Make sure this import is here

import NavBar from "./components/NavBar";

import CategoryList from "./pages/CategoryList";
import ProductListByCategory from "./pages/ProductListByCategory";
import ProductDetails from "./pages/ProductDetails";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrderPage from "./pages/OrderPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage"; // <-- Typo fixed
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage"; // <-- 1. IMPORT NEW PAGE
import CreateCategory from "./pages/CreateCategory";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);

  useEffect(() => {
    if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
    if (role) localStorage.setItem("role", role); else localStorage.removeItem("role");
    if (userId) localStorage.setItem("userId", userId); else localStorage.removeItem("userId");
    if (userName) localStorage.setItem("userName", userName); else localStorage.removeItem("userName");
  }, [token, role, userId, userName]);

  const handleLoginSuccess = useCallback(async (newUserId, loginToken) => {
    const anonymousCartId = localStorage.getItem("cartId");
    if (anonymousCartId) {
      const itemCount = await getCartItemCount(anonymousCartId, loginToken);
      if (itemCount > 0) {
        localStorage.setItem(`savedCartId_${newUserId}`, anonymousCartId);
        localStorage.removeItem("cartId");
      } else {
        localStorage.removeItem("cartId");
      }
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
  };

  const authContextValue = {
    token, role, userId, userName,
    setToken, setRole, setUserId, setUserName,
    onLoginSuccess: handleLoginSuccess,
    logout: handleLogout
  };

  return (
    <Router>
      <AuthProvider value={authContextValue}>
        <CartProvider>
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<CategoryList />} />
              <Route path="/search" element={<SearchPage />} /> {/* <-- 2. ADD NEW ROUTE */}
              <Route path="/category/:categoryId" element={<ProductListByCategory />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/products/new" element={<CreateProduct />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
              <Route path="/categories/new" element={<CreateCategory />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout-cancel" element={<CheckoutCancelPage />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;