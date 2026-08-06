import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, IndianRupee, PackageCheck, Truck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { api } from "../lib/api";
import { useToast } from "../components/toast";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const show = value => value === null || value === undefined ? "—" : value;
export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  useEffect(() => { api("/reports/dashboard").then(setData).catch(error => toast(error.message, "error")); }, [toast]);
  const cards = [
    { label: "Buyers", value: data?.totalBuyers, sub: `${data?.customers || 0} customers`, icon: Users, to: "/buyers" },
    { label: "Active Suppliers", value: data?.totalSuppliers, sub: `${data?.pricesExpiring || 0} prices expiring`, icon: Building2, to: "/suppliers" },
    { label: "Active Orders", value: data?.activeOrders, sub: `${data?.totalOrders || 0} total orders`, icon: PackageCheck, to: "/orders" },
    { label: "Logistics Shipments", value: data?.logisticsShipments, sub: `${data?.deliveriesDue || 0} deliveries due`, icon: Truck, to: "/logistics" },
    { label: "Order Value", value: money(data?.orderValue), sub: "Current order book", icon: IndianRupee, to: "/orders" },
    { label: "Finance Outstanding", value: money(data?.financeOutstanding), sub: `${data?.overduePayments || 0} overdue`, icon: IndianRupee, to: "/finance" }
  ];
  return <DashboardLayout title="Dashboard"><div className="space-y-6">
    <div><h2 className="text-xl font-semibold">Business Overview</h2><p className="text-sm text-muted-foreground">Live view across Buyer, Supplier, Orders, Logistics and Finance.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({ label, value, sub, icon: Icon, to }) => <button key={label} onClick={() => navigate(to)} className="rounded-xl border bg-white p-5 text-left shadow-card transition hover:border-accent"><div className="flex justify-between"><span className="grid h-10 w-10 place-items-center rounded bg-primary/10"><Icon className="w-5 text-primary" /></span><ArrowUpRight className="w-4 text-muted-foreground" /></div><p className="mt-3 text-2xl font-bold">{data ? show(value) : "…"}</p><p className="text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></button>)}</div>
    <div className="grid gap-4 xl:grid-cols-3"><section className="overflow-hidden rounded-xl border bg-white xl:col-span-2"><div className="flex justify-between border-b p-4"><h3 className="font-semibold">Recent Orders</h3><button onClick={() => navigate("/orders")} className="text-sm text-secondary">View all</button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Order", "Buyer", "Product / Grade", "Quantity", "Date", "Status"].map(label => <th key={label} className="border-b p-3 text-left text-xs text-muted-foreground">{label}</th>)}</tr></thead><tbody>{data?.recentOrders?.length ? data.recentOrders.map(order => <tr key={order.id} className="border-b"><td className="p-3 font-medium">{order.order_number}</td><td className="p-3">{order.buyer_name}</td><td className="p-3">{order.product_category} / {order.grade}</td><td className="p-3">{order.quantity_kg} Kg</td><td className="p-3">{order.order_date}</td><td className="p-3">{order.status}</td></tr>) : <tr><td colSpan="6" className="p-10 text-center text-muted-foreground">No orders created yet.</td></tr>}</tbody></table></div></section>
      <section className="rounded-xl border bg-primary p-5 text-white"><h3 className="font-semibold">Attention Required</h3><div className="mt-4 space-y-3">{[["Overdue payments", data?.overduePayments, "/finance"], ["Deliveries due this week", data?.deliveriesDue, "/orders"], ["Supplier prices expiring", data?.pricesExpiring, "/suppliers"]].map(([label, count, to]) => <button key={label} onClick={() => navigate(to)} className="flex w-full justify-between rounded bg-white/10 p-3 text-sm"><span>{label}</span><b>{count ?? "…"}</b></button>)}</div><button onClick={() => navigate("/reports")} className="mt-5 w-full rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">Open Reports</button></section></div>
  </div></DashboardLayout>;
}
