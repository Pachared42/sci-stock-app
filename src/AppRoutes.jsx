import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import DashboardContent from "./components/DashboardContent";
import ProductsFromSheet from './components/ProductsFromSheet';

function AppRoutes() {
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
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="orders" element={<ProductsFromSheet />} />
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
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="orders" element={<ProductsFromSheet />} />
        {/* เพิ่ม route ลูกอื่นๆ */}
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;

