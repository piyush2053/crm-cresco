import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ProtectedRoute({ children, module }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = 10 * 60 * 60 * 1000;
    const touch = () => localStorage.setItem("lastActivity", String(Date.now()));
    const heartbeat = (close = false, allowHidden = false) => {
      const activitySessionId = localStorage.getItem("activitySessionId");
      if (!activitySessionId || document.visibilityState === "hidden" && !close && !allowHidden) return;
      api("/auth/activity/heartbeat", {
        method: "POST",
        body: JSON.stringify({ activitySessionId, close })
      }).catch(() => {});
    };
    const onVisibility = () => heartbeat(false, true);
    if (!localStorage.getItem("lastActivity")) touch();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, touch, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    const heartbeatTimer = setInterval(() => heartbeat(false), 5 * 60 * 1000);
    const timeoutTimer = setInterval(() => {
      if (Date.now() - Number(localStorage.getItem("lastActivity") || 0) > timeout) {
        heartbeat(true);
        ["token", "refreshToken", "user", "lastActivity", "activitySessionId"].forEach(key => localStorage.removeItem(key));
        navigate("/login", { replace: true });
      }
    }, 60000);
    return () => {
      events.forEach(event => window.removeEventListener(event, touch));
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(heartbeatTimer);
      clearInterval(timeoutTimer);
    };
  }, [navigate]);

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace state={{ from: location }} />;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const allowed = !module || user.permissions?.modules?.[module] === true;
  return allowed ? children : <Navigate to="/dashboard" replace />;
}
