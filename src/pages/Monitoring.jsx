/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, LogIn, Trophy, TrendingUp, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { DateRangeField, SelectField } from "../components/FormControls";
import { api } from "../lib/api";
import { useToast } from "../components/toast";

const formatDuration = seconds => {
  const totalMinutes = Math.floor(Number(seconds || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};
const formatDate = value => value ? new Date(value).toLocaleString("en-IN") : "—";
const buildMonths = () => Array.from({ length: 24 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - index);
  return { value: date.toISOString().slice(0, 7), label: date.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) };
});
const monthRange = month => {
  const [year, monthNumber] = month.split("-").map(Number);
  return { start: `${month}-01`, end: new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10) };
};

const initials = name => (name || "User").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

function UsageTrend({ rows }) {
  const ordered = [...rows].reverse().slice(-62);
  const max = Math.max(1, ...ordered.map(row => Number(row.active_seconds || 0)));
  return <section className="rounded-xl border bg-white p-5">
    <div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold">Daily Usage Trend</h3><p className="text-xs text-muted-foreground">CRM time by active day</p></div><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="w-4" /></span></div>
    {ordered.length ? <div className="flex h-56 items-end gap-2 overflow-x-auto pb-1">{ordered.map(row => {
      const height = Math.max(8, Math.round(Number(row.active_seconds || 0) / max * 170));
      return <div key={row.activity_date} className="group flex min-w-10 flex-1 flex-col items-center justify-end"><div className="pointer-events-none mb-1 whitespace-nowrap rounded bg-primary px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">{formatDuration(row.active_seconds)}</div><div style={{ height }} className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-primary to-secondary transition-colors group-hover:from-secondary group-hover:to-accent"/><span className="mt-2 text-[10px] text-muted-foreground">{new Date(row.activity_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span></div>;
    })}</div> : <div className="grid h-56 place-items-center text-sm text-muted-foreground">No daily activity in this range.</div>}
  </section>;
}

function PeopleRanking({ rows }) {
  const max = Math.max(1, ...rows.map(row => Number(row.active_seconds || 0)));
  return <section className="rounded-xl border bg-white p-5">
    <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">People</h3><p className="text-xs text-muted-foreground">Time spent ranking</p></div><span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent"><Trophy className="w-4" /></span></div>
    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">{rows.length ? rows.map((row, index) => <article key={row.user_id} className="rounded-lg border p-3">
      <div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 && Number(row.active_seconds) > 0 ? "bg-accent text-white" : "bg-primary/10 text-primary"}`}>{initials(row.name)}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{row.name}</p><b className="whitespace-nowrap text-sm text-primary">{formatDuration(row.active_seconds)}</b></div><p className="truncate text-[11px] text-muted-foreground">{row.role_name || "No role"} · {row.session_count} sessions</p></div></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"><div style={{ width: `${Number(row.active_seconds || 0) / max * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" /></div>
    </article>) : <div className="grid h-48 place-items-center text-sm text-muted-foreground">No people activity found.</div>}</div>
  </section>;
}

export default function Monitoring() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const months = useMemo(() => buildMonths(), []);
  const [month, setMonth] = useState(months[0].value);
  const initialRange = monthRange(months[0].value);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!currentUser.is_admin) return;
    api("/users").then(setUsers).catch(error => toast(error.message, "error"));
  }, [currentUser.is_admin, toast]);

  useEffect(() => {
    if (!currentUser.is_admin) return;
    if (!startDate || !endDate) return;
    const params = new URLSearchParams({ month, start_date: startDate, end_date: endDate });
    if (userId) params.set("user_id", userId);
    setLoading(true);
    Promise.all([
      api(`/reports/user-time?${params}`),
      api(`/reports/user-time/sessions?${params}`),
      api(`/reports/user-time/daily?${params}`)
    ]).then(([summaryRows, sessionRows, dailyRows]) => {
      setSummary(summaryRows);
      setSessions(sessionRows);
      setDaily(dailyRows);
    }).catch(error => toast(error.message, "error")).finally(() => setLoading(false));
  }, [month, startDate, endDate, userId, currentUser.is_admin, toast]);

  if (!currentUser.is_admin) return <Navigate to="/dashboard" replace />;
  const totalSeconds = summary.reduce((sum, row) => sum + Number(row.active_seconds || 0), 0);
  const totalSessions = summary.reduce((sum, row) => sum + Number(row.session_count || 0), 0);
  const cards = [
    ["Users monitored", summary.length, Users],
    ["Total sessions", totalSessions, LogIn],
    ["Total CRM time", formatDuration(totalSeconds), Clock3],
    ["Average per user", formatDuration(summary.length ? totalSeconds / summary.length : 0), Activity]
  ];

  return <DashboardLayout title="Monitoring"><div className="space-y-5">
    <section className="rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">CRM Usage Monitoring</h2><p className="text-sm text-muted-foreground">Admin-only session time reporting. No pages, clicks or user actions are recorded.</p></section>
    <section className="rounded-xl border bg-white p-4"><div className="grid gap-4 md:grid-cols-3">
      <label><span className="mb-1 block text-xs font-medium text-muted-foreground">Report Month</span><SelectField value={month} onChange={value=>{setMonth(value);const next=monthRange(value);setStartDate(next.start);setEndDate(next.end)}} options={months} /></label>
      <label><span className="mb-1 block text-xs font-medium text-muted-foreground">Date Range</span><DateRangeField start={startDate} end={endDate} onChange={(start,end)=>{setStartDate(start);setEndDate(end)}} /></label>
      <label><span className="mb-1 block text-xs font-medium text-muted-foreground">User</span><SelectField value={userId} onChange={setUserId} placeholder="All users" options={[{ value: "", label: "All users" }, ...users.map(user => ({ value: user.id, label: `${user.name} · ${user.email}` }))]} /></label>
    </div></section>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <article key={label} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className="w-4 text-primary" /></div><p className="mt-3 text-2xl font-bold">{loading ? "…" : value}</p></article>)}</div>
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]"><UsageTrend rows={daily} /><PeopleRanking rows={summary} /></div>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-4"><h3 className="font-semibold">User Summary</h3><p className="text-xs text-muted-foreground">Aggregated time for the selected date range</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-card"><tr>{["User", "Role", "Sessions", "Time in CRM", "First login", "Last seen"].map(label => <th key={label} className="whitespace-nowrap p-3 text-left text-xs text-muted-foreground">{label}</th>)}</tr></thead><tbody>{summary.map(row => <tr key={row.user_id} className="border-t"><td className="p-3"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></td><td className="p-3">{row.role_name || "—"}</td><td className="p-3">{row.session_count}</td><td className="p-3 font-semibold text-primary">{formatDuration(row.active_seconds)}</td><td className="p-3">{formatDate(row.first_login_at)}</td><td className="p-3">{formatDate(row.last_seen_at)}</td></tr>)}</tbody></table>{!loading && !summary.length && <p className="p-8 text-center text-sm text-muted-foreground">No usage found for these filters.</p>}</div></section>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-4"><h3 className="font-semibold">Day-wise Usage</h3><p className="text-xs text-muted-foreground">Daily CRM time within the selected date range</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-card"><tr>{["Date", "Users", "Sessions", "Total CRM Time", "Average / Session"].map(label => <th key={label} className="whitespace-nowrap p-3 text-left text-xs text-muted-foreground">{label}</th>)}</tr></thead><tbody>{daily.map(row => <tr key={row.activity_date} className="border-t"><td className="p-3 font-medium">{new Date(row.activity_date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</td><td className="p-3">{row.user_count}</td><td className="p-3">{row.session_count}</td><td className="p-3 font-semibold text-primary">{formatDuration(row.active_seconds)}</td><td className="p-3">{formatDuration(Number(row.active_seconds || 0) / Math.max(1, row.session_count))}</td></tr>)}</tbody></table>{!loading && !daily.length && <p className="p-8 text-center text-sm text-muted-foreground">No day-wise usage found.</p>}</div></section>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-4"><h3 className="font-semibold">Session Details</h3><p className="text-xs text-muted-foreground">Login duration only; no activity-level tracking</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-card"><tr>{["User", "Login", "Last seen", "Logout", "Duration", "Status"].map(label => <th key={label} className="whitespace-nowrap p-3 text-left text-xs text-muted-foreground">{label}</th>)}</tr></thead><tbody>{sessions.map(row => <tr key={row.id} className="border-t"><td className="p-3"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></td><td className="p-3">{formatDate(row.login_at)}</td><td className="p-3">{formatDate(row.last_seen_at)}</td><td className="p-3">{formatDate(row.logout_at)}</td><td className="p-3 font-medium">{formatDuration(row.active_seconds)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${row.logout_at ? "bg-card text-muted-foreground" : "bg-success/10 text-success"}`}>{row.logout_at ? "Closed" : "Active"}</span></td></tr>)}</tbody></table>{loading && <p className="p-8 text-center text-sm text-muted-foreground">Loading monitoring data…</p>}{!loading && !sessions.length && <p className="p-8 text-center text-sm text-muted-foreground">No sessions found.</p>}</div></section>
  </div></DashboardLayout>;
}
