import { Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import OrderDay from "./components/OrderDay";
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
import ProductAll from "./components/ProductAll";
import ProfileSettings from "./components/ProfileSettings";
import OwnerData from "./components/OwnerData";
import CalendarPageEmployee from "./components/CalendarEmployee";
import FlexCost from "./components/FlexCost";
import StockOutCamera from "./components/StockOutCamera";

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
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="staff-management" element={<ApproveStaff />} />
        <Route path="all-products" element={<ProductAll />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        <Route path="upload-products" element={<UploadProductsXlsx />} />
        <Route path="camera-stockout" element={<StockOutCamera />} />
        <Route path="flex-cost" element={<FlexCost />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
        <Route path="owner-data" element={<OwnerData />} />
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
        <Route path="sales-day" element={<OrderDay />} />
        <Route path="staff-management" element={<ApproveStaff />} />
        <Route path="all-products" element={<ProductAll />} />
        <Route path="dried-category" element={<DriedFood />} />
        <Route path="fresh-category" element={<FreshFood />} />
        <Route path="drink-category" element={<SoftDrink />} />
        <Route path="snack-category" element={<Snack />} />
        <Route path="stationery-category" element={<Stationery />} />
        <Route path="upload-products" element={<UploadProductsXlsx />} />
        <Route path="camera-stockout" element={<StockOutCamera />} />
        <Route path="flex-cost" element={<FlexCost />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
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
        <Route path="camera-stockout" element={<StockOutCamera />} />
        <Route path="calendar-employee" element={<CalendarPageEmployee />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;