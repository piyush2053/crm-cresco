/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, LoaderCircle, LogOut, User } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../toast";

const sourceLabel={Buyer:"Buyer Directory",Supplier:"Supplier Directory",Order:"Orders",Inquiry:"Sales Inquiries",Commercial:"Finance Commercial Register","Logistics Lane":"Logistics Directory",User:"User Directory","Master Data":"Settings Master Data",Report:"Reports Library"};

export default function Topbar({ title, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [notifications,setNotifications]=useState([]);
  const [unread,setUnread]=useState(0);
  const [search,setSearch]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const navigate = useNavigate();
  const toast=useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = (user.name || "User").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  async function loadNotifications(){try{const result=await api("/notifications");setNotifications(result.data);setUnread(result.unread)}catch{/* Auth refresh/logout handles unavailable sessions. */}}
  useEffect(()=>{loadNotifications();const timer=setInterval(loadNotifications,60000);return()=>clearInterval(timer)},[]);
  useEffect(()=>{const term=search.trim();if(term.length<2){setSearchResults([]);setSearching(false);return}const controller=new AbortController(),timer=setTimeout(async()=>{setSearching(true);try{const rows=await api(`/search?q=${encodeURIComponent(term)}&limit=5`,{signal:controller.signal});setSearchResults(rows);setSearchOpen(true)}catch(e){if(e.name!=="AbortError")setSearchResults([])}finally{if(!controller.signal.aborted)setSearching(false)}},250);return()=>{clearTimeout(timer);controller.abort()}},[search]);
  async function openNotification(item){if(!item.is_read){await api(`/notifications/${item.id}/read`,{method:"PUT"});setUnread(Math.max(0,unread-1))}setNotificationsOpen(false);if(item.link)navigate(item.link)}
  async function readAll(){await api("/notifications/read-all",{method:"PUT"});setNotifications(notifications.map(n=>({...n,is_read:true})));setUnread(0)}
  async function clearNotifications(){try{const result=await api("/notifications/clear",{method:"PUT"});setNotifications([]);setUnread(0);setNotificationsOpen(false);toast(result.message)}catch(error){toast(error.message,"error")}}

  async function handleSignOut() {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken, activitySessionId: localStorage.getItem("activitySessionId") }),
        });
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("activitySessionId");
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
            value={search}
            onChange={e=>{setSearch(e.target.value);setSearchOpen(true)}}
            onFocus={()=>search.trim().length>=2&&setSearchOpen(true)}
            onKeyDown={e=>{if(e.key==="Escape")setSearchOpen(false);if(e.key==="Enter"&&searchResults[0]){navigate(searchResults[0].path);setSearchOpen(false)}}}
            placeholder="Search buyers, orders, invoices, users..."
            className="w-full h-9 rounded-md bg-card border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
          />
          {searching&&<LoaderCircle className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-accent"/>}
          {searchOpen&&search.trim().length>=2&&<><button aria-label="Close search" className="fixed inset-0 z-20 cursor-default" onClick={()=>setSearchOpen(false)}/><div className="absolute left-0 right-0 top-11 z-40 max-h-[70vh] overflow-y-auto rounded-xl border bg-white p-2 shadow-elevated">{searchResults.length?searchResults.map((item,index)=><button key={`${item.type}-${item.id}-${index}`} onClick={()=>{navigate(item.path);setSearchOpen(false);setSearch("")}} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-card"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-xs font-bold text-accent">{item.type.slice(0,2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-accent">From {sourceLabel[item.type]||item.type}</span><span className="block truncate text-sm font-medium">{item.title}</span><span className="block truncate text-xs text-muted-foreground">{item.subtitle||item.type}</span></span><span className="rounded-full bg-card px-2 py-1 text-[10px] text-muted-foreground">{item.type}</span></button>):!searching&&<div className="p-8 text-center"><Search className="mx-auto mb-2 h-6 w-6 text-muted-foreground"/><p className="text-sm font-medium">No CRM records found</p><p className="text-xs text-muted-foreground">Try a buyer, order, invoice, user or reference number.</p></div>}</div></>}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative"><button onClick={()=>{setNotificationsOpen(v=>!v);setMenuOpen(false);if(!notificationsOpen)loadNotifications()}} className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-card text-foreground/60 hover:text-foreground transition">
          <Bell className="w-[18px] h-[18px]" />
          {unread>0&&<span className="absolute -right-1 -top-1 grid min-w-5 h-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{unread>99?"99+":unread}</span>}
        </button>{notificationsOpen&&<><div className="fixed inset-0 z-10" onClick={()=>setNotificationsOpen(false)}/><div className="absolute right-0 z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border bg-white shadow-elevated"><div className="flex items-center justify-between border-b p-3"><div><p className="font-semibold">Notifications</p><p className="text-xs text-muted-foreground">{unread} unread</p></div><div className="flex items-center gap-3">{unread>0&&<button onClick={readAll} className="text-xs font-medium text-secondary">Mark all read</button>}{notifications.length>0&&<button onClick={clearNotifications} className="text-xs font-medium text-error">Clear</button>}</div></div><div className="max-h-96 overflow-y-auto">{notifications.length?notifications.map(n=><button key={n.id} onClick={()=>openNotification(n)} className={`block w-full border-b p-3 text-left hover:bg-card ${n.is_read?"opacity-65":"bg-accent/5"}`}><div className="flex justify-between gap-3"><p className="text-sm font-medium">{n.title}</p>{!n.is_read&&<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent"/>}</div><p className="mt-1 text-xs text-muted-foreground">{n.message}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p></button>):<p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>}</div></div></>}</div>

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
