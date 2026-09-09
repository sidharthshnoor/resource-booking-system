import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rbs_token');
      if (token) {
        try {
          const { user } = await authService.getMe();
          setUser(user);
        } catch (err) {
          console.error('Failed to load session:', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const { user } = await authService.login(credentials);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const { user } = await authService.register(userData);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
