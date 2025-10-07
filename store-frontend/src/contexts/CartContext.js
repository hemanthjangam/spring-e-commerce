/* ========================= src/contexts/CartContext.jsx (Logic Only) ========================= */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCartItemCount } from '../api';

const CartContext = createContext({
  cartId: null,
  cartItemCount: 0,
  setCartId: () => {},
  refreshCount: () => {},
});

export const CartProvider = ({ children }) => {
  const { token, userId } = useAuth();

  const localKey = userId ? `savedCartId_${userId}` : 'cartId';
  const initialCartId = localStorage.getItem(localKey);

  const [cartId, setCartId] = useState(initialCartId);
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCount = useCallback(async (tokenOverride, cartIdOverride) => {
    const currentToken = tokenOverride !== undefined ? tokenOverride : token;
    const currentCartId = cartIdOverride !== undefined ? cartIdOverride : cartId;

    if (!currentCartId) {
      setCartItemCount(0);
      return;
    }
    try {
      const count = await getCartItemCount(currentCartId, currentToken);
      setCartItemCount(count);
    } catch (error) {
      console.error("Failed to fetch cart item count:", error);
      setCartItemCount(0);
    }
  }, [cartId, token]);

  // Initial load of cart item count
  useEffect(() => {
    if (cartId) {
      refreshCount();
    }
  }, [cartId, refreshCount]);

  // Effect to update local storage when cartId changes
  useEffect(() => {
    if (cartId) {
      localStorage.setItem(localKey, cartId);
    } else {
      localStorage.removeItem(localKey);
    }
  }, [cartId, localKey]);

  // Effect to sync cartId when userId/token changes (i.e., on login/logout)
  useEffect(() => {
    const currentId = localStorage.getItem(localKey);
    setCartId(currentId);
    refreshCount(token || null, currentId);
  }, [token, userId, localKey, refreshCount]);

  const value = {
    cartId,
    cartItemCount,
    setCartId,
    refreshCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);