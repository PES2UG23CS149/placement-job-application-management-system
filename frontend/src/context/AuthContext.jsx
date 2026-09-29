import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Decode JWT payload
function getRoleFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );

    return payload.role || null;
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  );

  const [role, setRole] = useState(
    () => getRoleFromToken(localStorage.getItem('token'))
  );

  const login = (jwt) => {
    localStorage.setItem('token', jwt);

    setToken(jwt);
    setRole(getRoleFromToken(jwt));
  };

  const logout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        login,
        logout,
        isStudent: role === 'STUDENT',
        isAdmin: role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}