import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';

import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CreateAccount from './pages/auth/CreateAccount';
import LegacyLoginRedirect from './pages/auth/LegacyLoginRedirect';
import Landing from './pages/Landing';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import OrganizationsList from './pages/super-admin/OrganizationsList';
import OrganizationCreate from './pages/super-admin/OrganizationCreate';
import OrganizationDetails from './pages/super-admin/OrganizationDetails';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import GlobalDashboard from './pages/super-admin/GlobalDashboard';

import Dashboard from './pages/user/Dashboard';
import BrowseResources from './pages/user/BrowseResources';
import MyBookings from './pages/user/MyBookings';
import MyCalendar from './pages/user/MyCalendar';

import AdminDashboard from './pages/admin/AdminDashboard';
import ResourceManagement from './pages/admin/ResourceManagement';
import BookingManagement from './pages/admin/BookingManagement';
import AdminCalendar from './pages/admin/AdminCalendar';
import UserManagement from './pages/admin/UserManagement';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Public password reset links are generated without an organization slug. */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public / Auth Routes */}
          <Route path="/org/:slug" element={<OrganizationProvider><Outlet /></OrganizationProvider>}>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="create-account" element={<CreateAccount />} />
            </Route>

            {/* User Protected Routes */}
            <Route path="app" element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="resources" element={<BrowseResources />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="calendar" element={<MyCalendar />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="resources" element={<ResourceManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="organizations" replace />} />
            <Route path="dashboard" element={<GlobalDashboard />} />
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/new" element={<OrganizationCreate />} />
            <Route path="organizations/:id" element={<OrganizationDetails />} />
          </Route>

          {/* Legacy Login Redirect */}
          <Route path="/login" element={<LegacyLoginRedirect />} />

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
