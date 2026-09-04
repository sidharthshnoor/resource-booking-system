import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CreateAccount from './pages/auth/CreateAccount';
import Landing from './pages/Landing';

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

          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/create-account" element={<CreateAccount />} />
          </Route>

          {/* User Protected Routes */}
          <Route path="/app" element={<UserLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="resources" element={<BrowseResources />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="calendar" element={<MyCalendar />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="resources" element={<ResourceManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="activity" element={<ActivityLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
