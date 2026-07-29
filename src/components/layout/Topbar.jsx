import { useState } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, User } from "lucide-react";

export default function Topbar({ title, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
            placeholder="Search leads, clients, enquiries..."
            className="w-full h-9 rounded-md bg-card border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-card text-foreground/60 hover:text-foreground transition">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-md hover:bg-card transition"
          >
            <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-xs font-cta font-semibold">
              PS
            </div>
            <span className="text-sm font-medium hidden md:block">
              Sourav Dhoti
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
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:bg-card">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5">
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
