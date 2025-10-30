/* ========================= src/components/NavBar.jsx (Live Suggestions) ========================= */
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineLogin, HiOutlineSearch } from 'react-icons/hi';

import { useDebounce } from '../hooks/useDebounce'; // <-- 1. Import the hook
import { searchProducts, API_BASE_URL } from '../api'; // <-- 2. Import search API

const NavBar = () => {
    const { token } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();

    // --- State for Search Suggestions ---
    const [searchQuery, setSearchQuery] = useState(''); // Live value from input
    const [suggestions, setSuggestions] = useState([]); // API results
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 300); // Debounced value (300ms delay)
    const searchRef = useRef(null); // Ref to the search bar container

    // --- Effect to fetch suggestions ---
    useEffect(() => {
        if (debouncedQuery) {
            (async () => {
                try {
                    const results = await searchProducts(debouncedQuery);
                    setSuggestions(results || []);
                    setIsSuggestionsOpen(true);
                } catch (error) {
                    console.error("Failed to fetch search suggestions:", error);
                    setSuggestions([]);
                    setIsSuggestionsOpen(false);
                }
            })();
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    }, [debouncedQuery]); // This effect runs only when the *debounced* query changes

    // --- Handlers ---

    // Handles pressing "Enter"
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/search?q=${searchQuery.trim()}`);
            setSearchQuery('');
            setIsSuggestionsOpen(false);
        }
    };

    // Handles typing in the input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Close dropdown when a suggestion is clicked
    const handleSuggestionClick = () => {
        setSearchQuery('');
        setIsSuggestionsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="nav-bar">
            {/* --- Left Side --- */}
            <div className="nav-left">
                <Link to="/" className="nav-brand">MSTORE</Link>
                <div className="nav-links-container">
                    <NavLink to="/category/all" className="nav-link">Shop</NavLink>
                </div>
            </div>

            {/* --- Center: Search Bar --- */}
            <div className="nav-search-container" ref={searchRef}> {/* 3. Wrapper for suggestions */}
                <div className="nav-search-bar">
                    <HiOutlineSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchSubmit}
                        onFocus={() => setIsSuggestionsOpen(suggestions.length > 0)}
                    />
                </div>

                {/* --- 4. Live Suggestions Dropdown --- */}
                {isSuggestionsOpen && suggestions.length > 0 && (
                    <ul className="search-suggestions">
                        {suggestions.slice(0, 5).map(product => ( // Show top 5
                            <li key={product.id} className="suggestion-item">
                                <Link
                                    to={`/products/${product.id}`}
                                    className="suggestion-link"
                                    onClick={handleSuggestionClick}
                                >
                                    <img
                                        src={`${API_BASE_URL}${product.imageUrl}`}
                                        alt={product.name}
                                        className="suggestion-image"
                                    />
                                    <span className="suggestion-name">{product.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* --- Right Side --- */}
            <div className="nav-actions-group">
                <Link to={token ? "/profile" : "/login"} className="nav-action-link">
                    {token ? <HiOutlineUser className="nav-action-icon" /> : <HiOutlineLogin className="nav-action-icon" />}
                    <span>{token ? 'Profile' : 'Login'}</span>
                </Link>

                {token &&
                    <Link to="/wishlist" className="nav-action-link">
                        <HiOutlineHeart className="nav-action-icon" />
                        <span>Wishlist</span>
                    </Link>
                }

                <Link to="/cart" className="nav-action-link">
                    <HiOutlineShoppingBag className="nav-action-icon" />
                    {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                    <span>Bag</span>
                </Link>
            </div>
        </nav>
    );
};

export default NavBar;