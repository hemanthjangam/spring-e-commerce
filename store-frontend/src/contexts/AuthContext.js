/* ========================= src/contexts/AuthContext.jsx (Logic Only) ========================= */
import React, { createContext, useContext } from 'react';

const AuthContext = createContext({
  token: null,
  role: null,
  userId: null,
  userName: null,
  setToken: () => {},
  setRole: () => {},
  setUserId: () => {},
  setUserName: () => {},
  onLoginSuccess: () => Promise.resolve(),
  logout: () => {},
});

export const AuthProvider = ({ children, value }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);