import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      if (token && userData && token !== 'undefined' && token !== 'null') {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        console.log('Restored user session:', parsed.name, '| Token starts with:', token.substring(0, 20));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    if (!token || token === 'undefined') {
      console.error('Login called with invalid token!', token);
      return;
    }
    console.log('Saving token to localStorage, starts with:', token.substring(0, 20));
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
