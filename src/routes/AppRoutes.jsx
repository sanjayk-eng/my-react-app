import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/auth/PrivateRoute.jsx';
import Layout from '../components/layout/Layout.jsx';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignupPage from '../pages/auth/SignupPage.jsx';

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';

// Profile
import ProfilePage from '../pages/profile/ProfilePage.jsx';

// Clinics
import ClinicsListPage from '../pages/clinics/ClinicsListPage.jsx';
import AddClinicPage from '../pages/clinics/AddClinicPage.jsx';
import EditClinicPage from '../pages/clinics/EditClinicPage.jsx';
import ClinicSettingsPage from '../pages/clinics/ClinicSettingsPage.jsx';
import ClinicUsersPage from '../pages/clinics/ClinicUsersPage.jsx';
import AddClinicUserPage from '../pages/clinics/AddClinicUserPage.jsx';
import EditClinicUserPage from '../pages/clinics/EditClinicUserPage.jsx';
import IncomeManagementPage from '../pages/clinics/IncomeManagementPage.jsx';
import ExpenseManagementPage from '../pages/clinics/ExpenseManagementPage.jsx';
import ExpenseHeadPage from '../pages/clinics/ExpenseHeadPage.jsx';
import BasReportPage from '../pages/clinics/BasReportPage.jsx';

// 404 Page
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Test Page
import TestUserManagementPage from '../pages/TestUserManagementPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* Clinic Routes */}
      <Route path="/clinics" element={
        <PrivateRoute>
          <Layout>
            <ClinicsListPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/add" element={
        <PrivateRoute>
          <Layout>
            <AddClinicPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/edit" element={
        <PrivateRoute>
          <Layout>
            <EditClinicPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/settings" element={
        <PrivateRoute>
          <Layout>
            <ClinicSettingsPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/users" element={
        <PrivateRoute>
          <Layout>
            <ClinicUsersPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/users/add" element={
        <PrivateRoute>
          <Layout>
            <AddClinicUserPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/users/:userId/edit" element={
        <PrivateRoute>
          <Layout>
            <EditClinicUserPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/income" element={
        <PrivateRoute>
          <Layout>
            <IncomeManagementPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/expenses" element={
        <PrivateRoute>
          <Layout>
            <ExpenseManagementPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/expenses-head" element={
        <PrivateRoute>
          <Layout>
            <ExpenseHeadPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/clinics/:id/bas" element={
        <PrivateRoute>
          <Layout>
            <BasReportPage />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* Test Page */}
      <Route path="/test-users" element={
        <PrivateRoute>
          <Layout>
            <TestUserManagementPage />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;