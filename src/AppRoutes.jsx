import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import DashboardContent from "./components/DashboardContent";
import ProductsFromSheet from './components/ProductsFromSheet';
import useRouteProgress from "./hooks/useRouteProgress";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./components/Calendar";

function AppRoutes() {
  useRouteProgress();
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* nested routes สำหรับ admin */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sales-report" element={<ProductsFromSheet />} />
        <Route path="sales-day" element={<DashboardContent />} />
        {/* เพิ่ม route ลูกอื่นๆ ได้ตามต้องการ */}
      </Route>

      <Route
        path="/superadmin/*"
        element={
          <PrivateRoute allowedRoles={["superadmin"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* nested routes สำหรับ superadmin */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sales-report" element={<ProductsFromSheet />} />
        <Route path="sales-day" element={<DashboardContent />} />
        {/* เพิ่ม route ลูกอื่นๆ */}
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;

