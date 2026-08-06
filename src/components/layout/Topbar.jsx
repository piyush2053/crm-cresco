/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { api } from "../../lib/api";

export default function Topbar({ title, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [notifications,setNotifications]=useState([]);
  const [unread,setUnread]=useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = (user.name || "User").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  async function loadNotifications(){try{const result=await api("/notifications");setNotifications(result.data);setUnread(result.unread)}catch{/* Auth refresh/logout handles unavailable sessions. */}}
  useEffect(()=>{loadNotifications();const timer=setInterval(loadNotifications,60000);return()=>clearInterval(timer)},[]);
  async function openNotification(item){if(!item.is_read){await api(`/notifications/${item.id}/read`,{method:"PUT"});setUnread(Math.max(0,unread-1))}setNotificationsOpen(false);if(item.link)navigate(item.link)}
  async function readAll(){await api("/notifications/read-all",{method:"PUT"});setNotifications(notifications.map(n=>({...n,is_read:true})));setUnread(0)}

  async function handleSignOut() {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="h-16 shrink-0 bg-white border-b border-border flex items-center gap-4 px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-foreground/60 hover:text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="font-headline font-semibold text-lg text-foreground hidden sm:block">
        {title}
      </h1>

      <div className="flex-1 max-w-md ml-0 sm:ml-4">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, buyers, enquiries..."
            className="w-full h-9 rounded-md bg-card border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative"><button onClick={()=>{setNotificationsOpen(v=>!v);setMenuOpen(false);if(!notificationsOpen)loadNotifications()}} className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-card text-foreground/60 hover:text-foreground transition">
          <Bell className="w-[18px] h-[18px]" />
          {unread>0&&<span className="absolute -right-1 -top-1 grid min-w-5 h-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{unread>99?"99+":unread}</span>}
        </button>{notificationsOpen&&<><div className="fixed inset-0 z-10" onClick={()=>setNotificationsOpen(false)}/><div className="absolute right-0 z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border bg-white shadow-elevated"><div className="flex items-center justify-between border-b p-3"><div><p className="font-semibold">Notifications</p><p className="text-xs text-muted-foreground">{unread} unread</p></div>{unread>0&&<button onClick={readAll} className="text-xs font-medium text-secondary">Mark all read</button>}</div><div className="max-h-96 overflow-y-auto">{notifications.length?notifications.map(n=><button key={n.id} onClick={()=>openNotification(n)} className={`block w-full border-b p-3 text-left hover:bg-card ${n.is_read?"opacity-65":"bg-accent/5"}`}><div className="flex justify-between gap-3"><p className="text-sm font-medium">{n.title}</p>{!n.is_read&&<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent"/>}</div><p className="mt-1 text-xs text-muted-foreground">{n.message}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p></button>):<p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>}</div></div></>}</div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-md hover:bg-card transition"
          >
            <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-xs font-cta font-semibold">
              {initials}
            </div>
            <span className="text-sm font-medium hidden md:block">
              {user.name || "User"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-elevated py-1 z-20">
                <button onClick={()=>{setMenuOpen(false);navigate("/profile")}} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-card">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
