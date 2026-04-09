import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCartItemCount } from '../api';

const CartContext = createContext({
  cartId: null,
  cartItemCount: 0,
  setCartId: () => {},
  refreshCount: () => {},
  resetCart: () => {},
});

export const CartProvider = ({ children }) => {
  const { token, userId } = useAuth();

  const localKey = userId ? `savedCartId_${userId}` : 'cartId';
  const initialCartId = localStorage.getItem(localKey);

  const [cartId, setCartId] = useState(initialCartId);
  const [cartItemCount, setCartItemCount] = useState(0);

  const resetCart = useCallback(() => {
    localStorage.removeItem(localKey);
    setCartId(null);
    setCartItemCount(0);
  }, [localKey]);

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
      if (error?.message?.includes('Cart not found')) {
        resetCart();
      } else {
        setCartItemCount(0);
      }
    }
  }, [cartId, token, resetCart]);

  useEffect(() => {
    if (cartId) {
      refreshCount();
    }
  }, [cartId, refreshCount]);

  useEffect(() => {
    if (cartId) {
      localStorage.setItem(localKey, cartId);
    } else {
      localStorage.removeItem(localKey);
    }
  }, [cartId, localKey]);

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
    resetCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
