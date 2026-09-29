import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }

    if (role === 'STUDENT') {
      return <Navigate to="/student" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;