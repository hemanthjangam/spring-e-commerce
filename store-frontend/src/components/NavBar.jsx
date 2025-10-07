/* ========================= src/components/NavBar.jsx (New Component) ========================= */
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineLogin, HiOutlineLogout } from 'react-icons/hi';
import './NavBar.css'; // We'll create a dedicated CSS file for the navbar

const NavBar = ({ handleLogout }) => {
    const { token, role } = useAuth();
    const { cartItemCount } = useCart();

    return (
        <header className="nav-header">
            <nav className="nav-bar">
                <Link to="/" className="nav-brand">MSTORE</Link>

                <div className="nav-links">
                    <NavLink to="/category/all" className="nav-link">Shop</NavLink>
                    {token && <NavLink to="/orders" className="nav-link">Orders</NavLink>}
                    {token && role === "ADMIN" &&
                        <NavLink to="/products/new" className="nav-link admin-link">Sell</NavLink>
                    }
                </div>

                <div className="nav-actions">
                    <Link to={token ? "/profile" : "/login"} className="nav-action-item">
                        {token ? <HiOutlineUser /> : <HiOutlineLogin />}
                        <span>{token ? 'Profile' : 'Login'}</span>
                    </Link>

                    {token &&
                        <Link to="/wishlist" className="nav-action-item">
                            <HiOutlineHeart />
                            <span>Wishlist</span>
                        </Link>
                    }

                    <Link to="/cart" className="nav-action-item">
                        <div className="cart-icon-wrapper">
                            <HiOutlineShoppingBag />
                            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                        </div>
                        <span>Bag</span>
                    </Link>

                    {token && (
                        <button onClick={handleLogout} className="nav-action-item logout-btn">
                            <HiOutlineLogout />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default NavBar;