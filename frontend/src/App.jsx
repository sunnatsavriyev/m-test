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
import TestCreate from './pages/TestCreate';
import TestInterface from './pages/TestInterface';
import Profile from './pages/Profile';
import ResultDetail from './pages/ResultDetail';
import TestHistory from './pages/TestHistory';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';

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

  const contentClass = user ? "main-content" : "";

  return (
    <div className="app">
      {user && <Sidebar />}
      <div className={contentClass}>
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

          <Route path="/test/create" element={
            <ProtectedRoute allowedRoles={['dept_head', 'super_admin']}>
              <TestCreate />
            </ProtectedRoute>
          } />

          <Route path="/test/:id" element={
            <ProtectedRoute allowedRoles={['employee', 'dept_head', 'super_admin']}>
              <TestInterface />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/result/:id" element={
            <ProtectedRoute>
              <ResultDetail />
            </ProtectedRoute>
          } />

          <Route path="/test/:id/history" element={
            <ProtectedRoute>
              <TestHistory />
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
