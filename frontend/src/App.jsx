import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserAdd from './pages/UserAdd';
import DepartmentManagement from './pages/DepartmentManagement';
import Monitoring from './pages/Monitoring';
import TestList from './pages/TestList';
import TestInterface from './pages/TestInterface';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Sidebar />}
      <div className={user ? "main-content" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/users/add" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserAdd />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <DepartmentManagement />
            </ProtectedRoute>
          } />

          <Route path="/monitoring" element={
            <ProtectedRoute allowedRoles={['super_admin', 'monitoring', 'dept_head']}>
              <Monitoring />
            </ProtectedRoute>
          } />

          <Route path="/tests" element={
            <ProtectedRoute allowedRoles={['employee', 'dept_head', 'super_admin']}>
              <TestList />
            </ProtectedRoute>
          } />

          <Route path="/test/:id" element={
            <ProtectedRoute allowedRoles={['employee', 'dept_head']}>
              <TestInterface />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
