import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobDetailPage from './pages/JobDetailPage';

// Protected Pages - Job Seeker
import SeekerDashboard from './pages/seekerDashboard';
import MyApplications from './pages/seekerMyApplications';
import ProfilePage from './pages/seekerProfilePage';

// Protected Pages - Employer
import EmployerDashboard from './pages/employerDashboard';
import EmployerCompanyManagement from './pages/employerCompanyManagement';
import PostJob from './pages/employerPostJob';
import ManageApplications from './pages/employerManageApplications';

// Protected Pages - Admin
import AdminDashboard from './pages/adminDashboard';
import UserManagement from './pages/adminUserManagement';
import AdminCompanyManagement from './pages/adminCompanyManagement';

// Special Pages
import PendingApproval from './pages/PendingApproval';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if employer account is pending approval
  if (user.role === 'employer' && !user.is_active) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="pending-approval" element={user ? <PendingApproval /> : <Navigate to="/login" />} />

        {/* Protected Routes - Job Seeker */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute requireRole={['seeker', 'admin']}>
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-applications"
          element={
            <ProtectedRoute requireRole={['seeker', 'admin']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Employer */}
        <Route
          path="employer/dashboard"
          element={
            <ProtectedRoute requireRole={['employer', 'admin']}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="employer/companies"
          element={
            <ProtectedRoute requireRole={['employer', 'admin']}>
              <EmployerCompanyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="employer/post-job"
          element={
            <ProtectedRoute requireRole={['employer', 'admin']}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="employer/applications"
          element={
            <ProtectedRoute requireRole={['employer', 'admin']}>
              <ManageApplications />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute requireRole={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute requireRole={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/companies"
          element={
            <ProtectedRoute requireRole={['admin']}>
              <AdminCompanyManagement />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
