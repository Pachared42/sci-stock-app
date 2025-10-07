import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import OrderDay from "./components/OrderDay";
import ProductsFromSheet from "./components/ProductsFromSheet";
import useRouteProgress from "./hooks/useRouteProgress";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./components/Calendar";
import DriedFood from "./components/ProductDriedFood";
import FreshFood from "./components/ProductFreshFood";
import SoftDrink from "./components/ProductSoftDrink";
import Snack from "./components/ProductSnack";
import Stationery from "./components/ProductStationery";
import ApproveStaff from "./components/ApproveStaff";
import UploadProductsXlsx from "./components/UploadProductsXlsx";
import StockOutPage from "./components/StockOutPage";
import ProductAll from "./components/ProductAll";
import ProfileSettings from "./components/ProfileSettings";
import EmpolyeeData from "./components/EmpolyeeData";
import AdminData from "./components/AdminData";
import CalendarPageEmployee from "./components/CalendarEmployee";

function AppRoutes() {
  useRouteProgress();
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* สำหรับ Superadmin */}
      <Route
        path="/superadmin/*"
        element={
          <PrivateRoute allowedRoles={["superadmin"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sales-report" element={<ProductsFromSheet />} />
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="staff-management" element={<ApproveStaff />} />
        <Route path="all-products" element={<ProductAll />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        <Route path="upload-products" element={<UploadProductsXlsx />} />
        <Route path="stock-out" element={<StockOutPage />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
        <Route path="empolyee-data" element={<EmpolyeeData />} />
        <Route path="admin-data" element={<AdminData />} />
      </Route>

      {/* สำหรับ Admin */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sales-report" element={<ProductsFromSheet />} />
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="staff-management" element={<ApproveStaff />} />
        <Route path="all-products" element={<ProductAll />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        <Route path="upload-products" element={<UploadProductsXlsx />} />
        <Route path="stock-out" element={<StockOutPage />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
        <Route path="empolyee-data" element={<EmpolyeeData />} />
      </Route>

      {/* สำหรับ Employee */}
      <Route
        path="/employee/*"
        element={
          <PrivateRoute allowedRoles={["employee"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="calendar-employee" element={<CalendarPageEmployee />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;