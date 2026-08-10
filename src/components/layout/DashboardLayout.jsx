import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { api } from "../../lib/api";

export default function DashboardLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("user")||"{}"));
  useEffect(()=>{api("/auth/session").then(fresh=>{localStorage.setItem("user",JSON.stringify(fresh));setUser(fresh)}).catch(()=>{})},[]);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
