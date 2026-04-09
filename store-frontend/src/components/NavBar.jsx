import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineHeart,
  HiOutlineLogin,
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineUser,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchProducts } from '../api';
import { resolveImageUrl } from '../utils/media';

export default function NavBar() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { token, role } = useAuth();
  const { cartItemCount } = useCart();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const results = await searchProducts(debouncedQuery.trim());
        if (!mounted) {
          return;
        }

        setSuggestions(results || []);
        setOpen((results || []).length > 0);
      } catch (error) {
        if (mounted) {
          setSuggestions([]);
          setOpen(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const submitSearch = (event) => {
    if (event.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const closeSuggestions = () => {
    setQuery('');
    setOpen(false);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <span>Northstar</span> Store
        </Link>

        <div className="nav-links-container">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/collections" className="nav-link">Collections</NavLink>
          <NavLink to="/category/all" className="nav-link">Catalog</NavLink>
          {token && role === 'ADMIN' && (
            <>
              <NavLink to="/products/new" className="nav-link admin-link">New Product</NavLink>
              <NavLink to="/categories/new" className="nav-link admin-link">New Category</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="nav-search-container" ref={searchRef}>
        <div className="nav-search-bar">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search products, categories, essentials..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={submitSearch}
            onFocus={() => setOpen(suggestions.length > 0)}
          />
        </div>

        {open && (
          <ul className="search-suggestions">
            {suggestions.slice(0, 5).map((product) => (
              <li key={product.id}>
                <Link
                  to={`/products/${product.id}`}
                  className="suggestion-link"
                  onClick={closeSuggestions}
                >
                  <img
                    src={resolveImageUrl(product.imageUrl, 'https://placehold.co/120x140/EEE2CF/7C2D12?text=Item')}
                    alt={product.name}
                    className="suggestion-image"
                  />
                  <div>
                    <div className="suggestion-name">{product.name}</div>
                    <div className="text-secondary" style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                      ₹{product.price}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="nav-actions-group">
        <Link to="/category/all" className="nav-action-link">
          <HiOutlineSparkles className="nav-action-icon" />
          <span>Browse</span>
        </Link>

        {token ? (
          <>
            <Link to="/wishlist" className="nav-action-link">
              <HiOutlineHeart className="nav-action-icon" />
              <span>Wishlist</span>
            </Link>
            <Link to="/profile" className="nav-action-link">
              <HiOutlineUser className="nav-action-icon" />
              <span>Account</span>
            </Link>
          </>
        ) : (
          <Link to="/login" className="nav-action-link">
            <HiOutlineLogin className="nav-action-icon" />
            <span>Login</span>
          </Link>
        )}

        <Link to="/cart" className="nav-action-link">
          <HiOutlineShoppingBag className="nav-action-icon" />
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          <span>Cart</span>
        </Link>
      </div>
    </nav>
  );
}
