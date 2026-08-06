import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Module from "./pages/Module";
import Logistics from "./pages/Logistics";
import Orders from "./pages/Orders";

const secure = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={secure(<Dashboard />)} />
        <Route path="/buyers" element={secure(<Clients />)} />
        <Route path="/suppliers" element={secure(<Vendors />)} />
        <Route path="/logistics" element={secure(<Logistics />)} />
        <Route path="/orders" element={secure(<Orders />)} />
        <Route path="/reports" element={secure(<Reports />)} />
        <Route path="/settings" element={secure(<Settings />)} />
        <Route path="/finance" element={secure(<Module name="finance" />)} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
