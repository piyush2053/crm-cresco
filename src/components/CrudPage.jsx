import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import { api } from "../lib/api";
import { useToast } from "./toast";

const text = (value) => value ?? "—";

export default function CrudPage({ title, heading, description, endpoint, columns, fields, actionLabel }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const toast = useToast();

  async function load() {
    setLoading(true);
    try { setRows(await api(endpoint)); }
    catch (error) { toast(error.message, "error"); }
    finally { setLoading(false); }
  }
  // Fetch once on mount; later mutations explicitly refresh the collection.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search]);

  async function save(event) {
    event.preventDefault(); setSaving(true);
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === "" ? null : value]));
    fields.filter((field) => field.type === "number").forEach((field) => { if (payload[field.key] != null) payload[field.key] = Number(payload[field.key]); });
    try {
      await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
      toast(`${heading.slice(0, -1)} created successfully.`); setOpen(false); setForm({}); load();
    } catch (error) { toast(error.message, "error"); }
    finally { setSaving(false); }
  }
  async function remove(id) {
    if (!window.confirm("Remove this record?")) return;
    try { await api(`${endpoint}/${id}`, { method: "DELETE" }); toast("Record removed."); load(); }
    catch (error) { toast(error.message, "error"); }
  }

  return <DashboardLayout title={title}><div className="space-y-5">
    <section className="rounded-xl border border-border bg-white p-5 shadow-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold text-foreground">{heading}</h2><p className="text-sm text-muted-foreground">{description}</p></div>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground"><Plus className="w-4" />{actionLabel}</button>
    </section>
    <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="border-b border-border p-3"><div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." className="h-9 w-full rounded-md border border-input pl-9 pr-3 text-sm" /></div></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground"><tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">Loading records…</td></tr> : filtered.length ? filtered.map((row) => <tr key={row.id} className="border-t border-border hover:bg-card/70">{columns.map((column) => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-foreground/80">{text(row[column.key])}</td>)}<td className="px-4 py-3"><button onClick={() => remove(row.id)} className="rounded p-1.5 text-error hover:bg-error/10" aria-label="Delete record"><Trash2 className="w-4" /></button></td></tr>) : <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">No records found.</td></tr>}
      </tbody></table></div>
    </section>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-elevated"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-semibold">{actionLabel}</h3><button type="button" onClick={() => setOpen(false)}><X className="w-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field.key} className={field.full ? "sm:col-span-2" : ""}><span className="mb-1 block text-sm font-medium">{field.label}</span>{field.options ? <select required={field.required} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="h-10 w-full rounded-md border border-input px-3 text-sm"><option value="">Select {field.label}</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input required={field.required} type={field.type || "text"} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="h-10 w-full rounded-md border border-input px-3 text-sm" />}</label>)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-md border border-border px-4 text-sm">Cancel</button><button disabled={saving} className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground">{saving ? "Saving…" : "Save"}</button></div></form></div>}
  </div></DashboardLayout>;
}
