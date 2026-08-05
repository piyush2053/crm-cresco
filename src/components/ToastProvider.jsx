import { useCallback, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { ToastContext } from "./toast";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);
  return <ToastContext.Provider value={showToast}>{children}
    <div className="fixed right-4 top-4 z-[100] w-[min(360px,calc(100vw-2rem))] space-y-2">
      {toasts.map((toast) => <div key={toast.id} className={`flex items-center gap-3 rounded-lg border bg-white p-3 shadow-elevated ${toast.type === "error" ? "border-error/30" : "border-success/30"}`}>
        {toast.type === "error" ? <XCircle className="w-5 text-error" /> : <CheckCircle2 className="w-5 text-success" />}
        <p className="flex-1 text-sm text-foreground">{toast.message}</p>
        <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}><X className="w-4 text-muted-foreground" /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}
