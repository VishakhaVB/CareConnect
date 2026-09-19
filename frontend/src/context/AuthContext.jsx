import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import { orphanagesApi } from '../api/orphanages';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orphanage, setOrphanage] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('careconnect_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('careconnect_token');
    setToken(null);
    setUser(null);
    setOrphanage(null);
  }, []);

  const loadUserData = useCallback(async () => {
    const currentToken = localStorage.getItem('careconnect_token');
    if (!currentToken) {
      setUser(null);
      setOrphanage(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await usersApi.getMe();
      setUser(userData);

      // Check if user has an associated orphanage profile (only if not donor role)
      if (userData.role !== 'donor') {
        try {
          const orph = await orphanagesApi.getMyOrphanage();
          setOrphanage(orph);
        } catch (err) {
          // 404 or 403 means user does not have an orphanage profile yet
          setOrphanage(null);
        }
      } else {
        setOrphanage(null);
      }
    } catch (err) {
      // 401 or network error
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    loadUserData();
  }, [loadUserData, logout]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('careconnect_token', res.access_token);
    setToken(res.access_token);
    await loadUserData();
    return res;
  };

  const register = async (data) => {
    return await authApi.register(data);
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  const value = {
    user,
    orphanage,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
    isDonor: user?.role === 'donor' || user?.role === 'both',
    isVolunteer: user?.role === 'volunteer' || user?.role === 'both',
    isAdmin: user?.role === 'admin',
    isBoth: user?.role === 'both',
    hasOrphanage: Boolean(orphanage),
    isOrphanageOwner: Boolean(orphanage),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
