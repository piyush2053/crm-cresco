import { useEffect, useState } from "react";
import {
  Inbox,
  Handshake,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Plus,
  FileText,
  UserPlus,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { api } from "../lib/api";
import { useToast } from "../components/toast";

const STATS = [
  {
    label: "Open Enquiries",
    value: "48",
    delta: "+12% this month",
    icon: Inbox,
    tone: "bg-primary/10 text-primary",
  },
  {
    label: "Active Deals",
    value: "17",
    delta: "+3 this week",
    icon: Handshake,
    tone: "bg-accent/10 text-accent",
  },
  {
    label: "Vendors",
    value: "62",
    delta: "8 pending approval",
    icon: Building2,
    tone: "bg-secondary/10 text-secondary",
  },
  {
    label: "Pipeline Value",
    value: "₹2.4Cr",
    delta: "+18% vs last month",
    icon: TrendingUp,
    tone: "bg-success/10 text-success",
  },
];

const ENQUIRIES = [
  {
    id: "ENQ-1042",
    company: "Vardhman Chemicals Pvt Ltd",
    chemical: "Sodium Hydroxide (Flakes)",
    qty: "25 MT",
    status: "New",
  },
  {
    id: "ENQ-1041",
    company: "Al Fahad Trading LLC, Dubai",
    chemical: "Titanium Dioxide (Rutile)",
    qty: "10 MT",
    status: "Quoted",
  },
  {
    id: "ENQ-1040",
    company: "Sunrise Polymers",
    chemical: "Polyvinyl Chloride Resin",
    qty: "40 MT",
    status: "In Progress",
  },
  {
    id: "ENQ-1039",
    company: "Al-Rashid Import Export, Jeddah",
    chemical: "Calcium Carbonate (Coated)",
    qty: "60 MT",
    status: "Won",
  },
  {
    id: "ENQ-1038",
    company: "Meridian Specialty Chem",
    chemical: "Citric Acid Monohydrate",
    qty: "15 MT",
    status: "Lost",
  },
];

const STATUS_STYLES = {
  New: "bg-secondary/10 text-secondary",
  Quoted: "bg-warning/10 text-warning",
  "In Progress": "bg-accent/10 text-accent",
  Won: "bg-success/10 text-success",
  Lost: "bg-error/10 text-error",
};

const QUICK_ACTIONS = [
  { label: "New Enquiry", icon: Plus },
  { label: "Add Client", icon: UserPlus },
  { label: "Generate Quote", icon: FileText },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const toast = useToast();
  // The dashboard only needs an initial snapshot; mutations refresh their own screens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { api("/reports/dashboard").then(setStats).catch((error) => toast(error.message, "error")); }, []);
  const statValues = stats ? [stats.totalEnquiries, stats.activeDeals, stats.totalVendors, "—"] : STATS.map(() => "…");
  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-semibold text-foreground">
            Welcome back, Piyush
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening across your trade desk today.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-accent text-accent-foreground text-sm font-cta font-medium shadow-card hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> New Enquiry
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, delta, icon: Icon, tone }, index) => (
          <div
            key={label}
            className="bg-card border border-border rounded-lg p-4 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-md grid place-items-center ${tone}`}
                style={{
                  clipPath:
                    "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
                }}
              >
                <Icon className="w-[18px] h-[18px]" />
              </div>
            </div>
            <p className="mt-3 font-headline text-2xl font-bold text-foreground">
              {statValues[index]}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent enquiries */}
        <div className="xl:col-span-2 bg-white border border-border rounded-lg shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-headline font-semibold text-foreground">
              Recent Enquiries
            </h3>
            <button className="text-sm text-secondary font-medium hover:underline">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Enquiry</th>
                  <th className="px-5 py-2.5 font-medium">Company</th>
                  <th className="px-5 py-2.5 font-medium">Chemical</th>
                  <th className="px-5 py-2.5 font-medium">Qty</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ENQUIRIES.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-card/60 transition"
                  >
                    <td className="px-5 py-3 font-accent text-xs text-secondary">
                      {row.id}
                    </td>
                    <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">
                      {row.company}
                    </td>
                    <td className="px-5 py-3 text-foreground/80">
                      {row.chemical}
                    </td>
                    <td className="px-5 py-3 font-accent text-foreground/80">
                      {row.qty}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions + pipeline */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border rounded-lg shadow-card p-5">
            <h3 className="font-headline font-semibold text-foreground mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground/80 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition"
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary rounded-lg shadow-card p-5 text-white">
            <h3 className="font-headline font-semibold mb-1">
              This Month's Pipeline
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Deals by stage across the trade desk
            </p>
            <div className="space-y-3">
              {[
                { stage: "Enquiry", pct: 100 },
                { stage: "Quoted", pct: 72 },
                { stage: "Negotiation", pct: 45 },
                { stage: "Closed Won", pct: 28 },
              ].map(({ stage, pct }) => (
                <div key={stage}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/70">{stage}</span>
                    <span className="font-accent text-white/50">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
