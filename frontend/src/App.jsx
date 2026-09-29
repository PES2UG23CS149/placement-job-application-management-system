import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import StudentDrivesPage from './pages/StudentDrivesPage';
import StudentProfilePage from './pages/StudentProfilePage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminPlacementDrivesPage from './pages/AdminPlacementDrivesPage';
import AdminApplicantsPage from './pages/AdminApplicantsPage';

import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';


/* =========================================================
   ROLE REDIRECT
========================================================= */

function RoleRedirect() {
  const { role } = useAuth();

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'STUDENT') {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
}


/* =========================================================
   STUDENT HOME
========================================================= */

function StudentHome() {
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
}


/* =========================================================
   ADMIN HOME
========================================================= */

function AdminHome() {
  return (
    <AdminLayout>
      <AdminDashboardPage />
    </AdminLayout>
  );
}


/* =========================================================
   ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>

      {/* ==================== PUBLIC ==================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/"
        element={<RoleRedirect />}
      />


      {/* ==================== STUDENT ==================== */}

      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/drives"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <Layout>
              <StudentDrivesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/applications"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <Layout>
              <ApplicationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <Layout>
              <StudentProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* ==================== ADMIN ==================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminHome />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <AdminCompaniesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/drives"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <AdminPlacementDrivesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/applicants"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout>
              <AdminApplicantsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />


      {/* ==================== FALLBACK ==================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <ThemeProvider>

        <AuthProvider>

          <AppRoutes />

        </AuthProvider>

      </ThemeProvider>

    </BrowserRouter>
  );
}

export default App;