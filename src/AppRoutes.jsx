import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import OrderDay from "./components/OrderDay";
import ProductsFromSheet from './components/ProductsFromSheet';
import useRouteProgress from "./hooks/useRouteProgress";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./components/Calendar";
import RegisterAdmin from "./components/RegisterAdmin";
import DriedFood from "./components/ProductDriedFood";
import FreshFood from "./components/ProductFreshFood";
import SoftDrink from "./components/ProductSoftDrink";
import Snack from "./components/ProductSnack";
import Stationery from "./components/ProductStationery";
import ApproveStaff from "./components/ApproveStaff";
import UploadProducts from "./components/UploadProducts";

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
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="staff-management" element={<ApproveStaff />} />
        <Route path="register-admin" element={<RegisterAdmin />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        <Route path="upload-products" element={<UploadProducts />} />
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
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="register-admin" element={<RegisterAdmin />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        {/* เพิ่ม route ลูกอื่นๆ */}
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;

