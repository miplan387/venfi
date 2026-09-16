import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('venfi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('venfi_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('venfi_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
            localStorage.setItem('venfi_user', JSON.stringify(json.data.user));
          }
        } else {
          // Token expirado o inválido
          localStorage.removeItem('venfi_token');
          localStorage.removeItem('venfi_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Verificación de sesión sin conexión activa:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const authToken = data.data?.token || data.token;
        const authUser = data.data?.user || data.user || { email, username: email.split('@')[0] };

        setToken(authToken);
        setUser(authUser);
        localStorage.setItem('venfi_token', authToken);
        localStorage.setItem('venfi_user', JSON.stringify(authUser));
        return { success: true, user: authUser };
      } else {
        return { success: false, message: data.message || 'Credenciales incorrectas' };
      }
    } catch (err) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const authToken = data.data?.token || data.token;
        const authUser = data.data?.user || data.user || { username, email };

        setToken(authToken);
        setUser(authUser);
        localStorage.setItem('venfi_token', authToken);
        localStorage.setItem('venfi_user', JSON.stringify(authUser));
        return { success: true, user: authUser };
      } else {
        return { success: false, message: data.message || 'Error al registrar usuario' };
      }
    } catch (err) {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('venfi_token');
    localStorage.removeItem('venfi_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
