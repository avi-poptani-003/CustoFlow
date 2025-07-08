import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import DashboardLayout from "./components/common/DashboardLayout"; // This includes the Navbar
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import SiteVisits from "./pages/SiteVisits";
import TeamManagement from "./pages/TeamManagement";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute, GuestRoute } from "./components/common/ProtectedRoute";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import ChangePassword from "./pages/ChangePassword";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />
        </Route>

        {/* Protected Routes with Navbar via DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/leads" element={<Leads />} />
            <Route path="/dashboard/properties" element={<Properties />} />
            <Route
              path="/dashboard/properties/:id"
              element={<PropertyDetail />}
            />
            <Route path="/dashboard/properties/add" element={<AddProperty />} />
            <Route
              path="/dashboard/properties/edit/:id"
              element={<EditProperty />}
            />
            <Route path="/dashboard/site-visits" element={<SiteVisits />} />
            <Route path="/dashboard/team" element={<TeamManagement />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
