import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { ToastContext } from "./toast";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [sessionExpired,setSessionExpired]=useState(false);
  const showToast = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);
  useEffect(()=>{
    const offlineHandler=event=>showToast(event.detail?.message||"Backend server unavailable.","error");
    const sessionHandler=event=>{showToast(event.detail?.message||"Your session has expired. Please login again to restart the session.","error");setSessionExpired(true)};
    window.addEventListener("crm:api-offline",offlineHandler);
    window.addEventListener("crm:session-expired",sessionHandler);
    return()=>{
      window.removeEventListener("crm:api-offline",offlineHandler);
      window.removeEventListener("crm:session-expired",sessionHandler);
    };
  },[showToast]);
  return <ToastContext.Provider value={showToast}>{children}
    {sessionExpired&&<div className="fixed inset-0 z-[200] grid place-items-center bg-primary/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-elevated"><XCircle className="mx-auto mb-3 h-10 w-10 text-error"/><h2 className="text-lg font-semibold">Session expired</h2><p className="mt-2 text-sm text-muted-foreground">Please log in again to continue securely.</p><button onClick={()=>{setSessionExpired(false);window.location.assign("/login")}} className="mt-5 w-full rounded bg-accent px-4 py-2 font-medium">Log in again</button></div></div>}
    <div className="fixed right-4 top-4 z-[100] w-[min(360px,calc(100vw-2rem))] space-y-2">
      {toasts.map((toast) => <div key={toast.id} className={`flex items-center gap-3 rounded-lg border bg-white p-3 shadow-elevated ${toast.type === "error" ? "border-error/30" : "border-success/30"}`}>
        {toast.type === "error" ? <XCircle className="w-5 text-error" /> : <CheckCircle2 className="w-5 text-success" />}
        <p className="flex-1 text-sm text-foreground">{toast.message}</p>
        <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}><X className="w-4 text-muted-foreground" /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}
