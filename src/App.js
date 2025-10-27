import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";

import RegisterForm from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import DashboardLayout from "./DashboardLayout";
import ProfilePage from "./Profile";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./AdminDashboard";
import AccountantDashboard from "./AccountantDashboard";
import ManagerDashboard from "./ManagerDashboard";
import CEODashboard from "./CEODashboard";
import HRDashboard from "./HRDashboard";

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          {/* ---------- AUTH ROUTES ---------- */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            }
          />

          <Route
            path="/employee/dashboard"
            element={
              <DashboardLayout>
                <EmployeeDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/accountant/dashboard"
            element={
              <DashboardLayout>
                <AccountantDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/manager/dashboard"
            element={
              <DashboardLayout>
                <ManagerDashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/ceo/dashboard"
            element={
              <DashboardLayout>
                <CEODashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/hr/dashboard"
            element={
              <DashboardLayout>
                <HRDashboard />
              </DashboardLayout>
            }
          />

          {/* ---------- DEFAULT REDIRECTS ---------- */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
