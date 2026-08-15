import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Logistics from "./pages/Logistics";
import Orders from "./pages/Orders";
import Finance from "./pages/Finance";
import Profile from "./pages/Profile";
import Monitoring from "./pages/Monitoring";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailNotifications from "./pages/EmailNotifications";
import WebsiteProducts from "./pages/WebsiteProducts";

const secure = (page, module) => <ProtectedRoute module={module}>{page}</ProtectedRoute>;
const hasStoredSession = () => Boolean(localStorage.getItem("token") || localStorage.getItem("refreshToken"));

function HomeRedirect() {
  return <Navigate to={hasStoredSession() ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={secure(<Dashboard />, "dashboard")} />
        <Route path="/buyers" element={secure(<Clients />, "buyers")} />
        <Route path="/suppliers" element={secure(<Vendors />, "suppliers")} />
        <Route path="/logistics" element={secure(<Logistics />, "logistics")} />
        <Route path="/orders" element={secure(<Orders />, "orders")} />
        <Route path="/reports" element={secure(<Reports />, "reports")} />
        <Route path="/website-products" element={secure(<WebsiteProducts />, "website_products")} />
        <Route path="/settings" element={secure(<Settings />, "settings")} />
        <Route path="/settings/email-notifications" element={secure(<EmailNotifications />, "settings")} />
        <Route path="/settings/:section" element={secure(<Settings />, "settings")} />
        <Route path="/finance" element={secure(<Finance />, "finance")} />
        <Route path="/profile" element={secure(<Profile />)} />
        <Route path="/monitoring" element={secure(<Monitoring />)} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
