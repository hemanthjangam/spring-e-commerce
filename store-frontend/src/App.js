/* ========================= src/App.js (Finalized and Cleaned) ========================= */
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { getCartItemCount } from "./api";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";

// --- Import all page components from src/pages ---
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
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import ProfilePage from "./pages/ProfilePage";


// Extracted NavBar component
function NavBar({ handleLogout }) {
    const { token, role } = useAuth(); // Removed unused userName
    const { cartItemCount } = useCart();

    const userActionPath = token ? "/profile" : "/login";

    return (
        <nav className="nav-bar">
            <Link to="/" className="nav-brand">MSTORE</Link>

            <div className="nav-links-container">

                <Link to="/category/all" className="nav-link">SHOP</Link>
                {token && <Link to="/orders" className="nav-link">ORDERS</Link>}
                {token && role === "ADMIN" &&
                    <Link to="/products/new" className="nav-link admin-link" style={{color: 'var(--color-accent)'}}>
                        SELL
                    </Link>
                }

                {/* User/Cart Actions (Icon Group) */}
                <div className="nav-actions-group">

                    {/* User / Profile Action */}
                    <Link to={userActionPath} className="nav-action-link">
                        <span className="nav-action-icon">{token ? "👤" : "⏏"}</span>
                        <span>{token ? "Profile" : "Login"}</span>
                    </Link>

                    {/* Cart Action */}
                    <Link to="/cart" className="nav-action-link">
                        <span className="nav-action-icon">🛒</span>
                        <span>Bag</span>
                        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                    </Link>

                    {/* Wishlist Action */}
                    {token &&
                        <Link to="/wishlist" className="nav-action-link">
                            <span className="nav-action-icon">🤍</span>
                            <span>Wishlist</span>
                        </Link>
                    }

                    {/* Logout Button (if logged in) */}
                    {token && (
                         <button onClick={handleLogout} className="nav-logout-button">
                             Logout
                         </button>
                    )}
                </div>
            </div>
        </nav>
    );
}


function App() {
  // Initialize state directly from localStorage to handle hard reloads
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);

  // Sync state changes back to localStorage
  useEffect(() => {
    // Keep local storage in sync with React state
    if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
    if (role) localStorage.setItem("role", role); else localStorage.removeItem("role");
    if (userId) localStorage.setItem("userId", userId); else localStorage.removeItem("userId");
    if (userName) localStorage.setItem("userName", userName); else localStorage.removeItem("userName");
  }, [token, role, userId, userName]); // All state variables are used here (fixed warning)

  const handleLoginSuccess = useCallback(async (newUserId, loginToken) => {
    const anonymousCartId = localStorage.getItem("cartId");
    if (anonymousCartId) {
        const itemCount = await getCartItemCount(anonymousCartId, loginToken);
        if (itemCount > 0) {
            // Save anonymous cart ID associated with the new user ID
            localStorage.setItem(`savedCartId_${newUserId}`, anonymousCartId);
            localStorage.removeItem("cartId");
        } else {
            localStorage.removeItem("cartId");
        }
    }
  }, []);

  const handleLogout = () => {
    // Clear local state and localStorage for a clean logout
    setToken(null); setRole(null); setUserId(null); setUserName(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    // Note: Cart ID is left alone here to handle both anonymous and saved carts correctly in CartContext.
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
                {/* NavBar is rendered unconditionally outside of Routes (best practice) */}
                <NavBar handleLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<CategoryList />} />
                    <Route path="/category/:categoryId" element={<ProductListByCategory />} />
                    <Route path="/products/:id" element={<ProductDetails />} />

                    {/* Admin Routes */}
                    <Route path="/products/new" element={<CreateProduct />} />
                    <Route path="/products/:id/edit" element={<EditProduct />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* User Routes */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/orders" element={<OrderPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Checkout Status Routes */}
                    <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                    <Route path="/checkout-cancel" element={<CheckoutCancelPage />} />
                </Routes>
            </CartProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;