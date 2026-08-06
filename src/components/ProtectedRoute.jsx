import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate=useNavigate();
  useEffect(()=>{const timeout=10*60*60*1000;const touch=()=>localStorage.setItem("lastActivity",String(Date.now()));if(!localStorage.getItem("lastActivity"))touch();const events=["mousedown","keydown","scroll","touchstart"];events.forEach(e=>window.addEventListener(e,touch,{passive:true}));const timer=setInterval(()=>{if(Date.now()-Number(localStorage.getItem("lastActivity")||0)>timeout){localStorage.removeItem("token");localStorage.removeItem("refreshToken");localStorage.removeItem("user");localStorage.removeItem("lastActivity");navigate("/login",{replace:true})}},60000);return()=>{events.forEach(e=>window.removeEventListener(e,touch));clearInterval(timer)}},[navigate]);
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
