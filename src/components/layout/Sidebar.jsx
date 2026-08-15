import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Building2,
  BarChart3,
  Landmark,
  Truck,
  Settings,
  X,
  Activity,
  PackageSearch,
} from "lucide-react";
import logoFull from "../../assets/logo-full.png";
import logoIcon from "../../assets/logo-icon.png";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutGrid, module: "dashboard" }],
  },
  {
    label: "Directory",
    items: [
      { to: "/buyers", label: "Buyers", icon: Building2, module: "buyers" },
      { to: "/suppliers", label: "Suppliers", icon: Building2, module: "suppliers" },
      { to: "/website-products", label: "Website Products", icon: PackageSearch, module: "website_products" },
      { to: "/finance", label: "Finance", icon: Landmark, module: "finance" },
      { to: "/logistics", label: "Logistics", icon: Truck, module: "logistics" },
      { to: "/orders", label: "Orders", icon: LayoutGrid, module: "orders" },
      { to: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
      { to: "/monitoring", label: "Monitoring", icon: Activity, adminOnly: true },
      { to: "/settings", label: "Settings", icon: Settings, module: "settings" },
    ],
  },
];

export default function Sidebar({ open, onClose, user = {} }) {
  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-authority-charcoal/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-primary flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <img src={logoFull} alt="Cresco Global" className="h-7 w-auto" />
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-5 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="px-3 mb-2 text-[11px] font-accent uppercase tracking-widest text-white/35">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.filter(item => (!item.adminOnly || user.is_admin) && (!item.module || user.permissions?.modules?.[item.module] === true)).map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-accent transition-opacity ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Hexagon watermark signature */}
        <div className="relative px-5 py-5 border-t border-white/10 overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src={logoIcon}
              alt=""
              className="w-8 h-8 opacity-90"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">
                Cresco Global
              </p>
              <p className="text-[11px] text-white/40 truncate">
                CRM
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
