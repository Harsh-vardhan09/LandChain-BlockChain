import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LandExplorerPage from './pages/LandExplorerPage';
import LandDetailsPage from './pages/LandDetailsPage';
import RegisterLandPage from './pages/RegisterLandPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleGuard';

function App() {
  return (
    <Router>
      <WalletProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/explorer" element={<LandExplorerPage />} />
              <Route path="/lands/:landId" element={<LandDetailsPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    {/* <ProtectedRoute> */}
                      <DashboardPage />
                    {/* </ProtectedRoute> */}
                  </Layout>
                }
              />

              <Route
                path="/register-land"
                element={
                  <Layout>
                    <RoleRoute allowedRoles={['registrar', 'admin']}>
                      <RegisterLandPage />
                    </RoleRoute>
                  </Layout>
                }
              />

              <Route
                path="/transfer"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <TransferPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />

              <Route
                path="/transactions"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <TransactionHistoryPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />

              <Route
                path="/profile"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </Layout>
                }
              />

              <Route
                path="/admin"
                element={
                  <Layout>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminPanelPage />
                    </RoleRoute>
                  </Layout>
                }
              />

              {/* 404 route */}
              <Route
                path="/404"
                element={
                  <Layout>
                    <NotFoundPage />
                  </Layout>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;
