import { useEffect, useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "./toast";

export default function BaseFreightMatrix() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ from: "", to: "", load: "", freight: "", remarks: "" });
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function load() {
    try {
      setRows(await api("/logistics/base-freight"));
    } catch (error) {
      toast(error.message, "error");
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(event) {
    event.preventDefault();
    try {
      await api("/logistics/base-freight", { method: "POST", body: JSON.stringify(form) });
      setForm({ from: "", to: "", load: "", freight: "", remarks: "" });
      setOpen(false);
      await load();
      toast("Freight rate saved.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  const openAction = (detail) => window.dispatchEvent(new CustomEvent("crm:logistics-action", { detail }));
  const filtered = rows.filter((row) =>
    `${row.from_district} ${row.to_district} ${row.quantity_kg}`.toLowerCase().includes(search.toLowerCase()),
  );

  return <section className="unified-freight rounded-lg border">
    <div className="flex flex-wrap gap-2 border-b bg-muted/30 p-4">
      <button onClick={() => openAction("lane")} className="rounded border bg-white px-3 py-2 text-sm">Create Lane</button>
      <button onClick={() => openAction("shipment")} className="rounded border bg-white px-3 py-2 text-sm">Book Freight</button>
      <button onClick={() => openAction("quote")} className="rounded border bg-white px-3 py-2 text-sm">Record Quote</button>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
      <div>
        <h3 className="font-semibold">Freight Rates</h3>
        <p className="text-xs text-muted-foreground">Add one rate manually or upload many rates from Excel · Rs/Kg</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(!open)} className="rounded bg-accent px-3 py-2 text-sm"><Plus className="mr-1 inline w-4" />Add Rate</button>
        <Link to="/logistics/freight-upload" className="rounded border border-green-600 bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"><Upload className="mr-1 inline w-4" />Upload Excel</Link>
      </div>
    </div>

    {open && <form onSubmit={save} className="grid gap-3 border-b bg-card p-4 sm:grid-cols-5">
      {[["From District", "from", "text"], ["To District", "to", "text"], ["Load (KG)", "load", "number"], ["Freight (Rs/Kg)", "freight", "number"], ["Reason", "remarks", "text"]].map(([label, name, type]) => <label key={name}>
        <small className="mb-1 block">{label}</small>
        <input required={name !== "remarks"} type={type} step={type === "number" ? "any" : undefined} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="h-10 w-full rounded border bg-white px-3" />
      </label>)}
      <button className="rounded bg-primary px-4 py-2 text-white sm:col-span-5">Save Rate</button>
    </form>}

    <div className="p-3">
      <div className="relative mb-3"><Search className="absolute left-3 top-3 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search From, To or Load…" className="h-10 w-full rounded border pl-9" /></div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card"><tr>{["From", "To", "Load (KG)", "Freight (Rs/Kg)", "Source"].map((heading) => <th key={heading} className="border p-2 text-left">{heading}</th>)}</tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.id}><td className="border p-2 font-medium">{row.from_district}</td><td className="border p-2 font-medium">{row.to_district}</td><td className="border p-2">{Number(row.quantity_kg).toLocaleString("en-IN")}</td><td className="border p-2">₹{row.base_freight_per_kg}</td><td className="border p-2">{row.source}</td></tr>)}</tbody>
        </table>
        {!filtered.length && <p className="p-6 text-center text-muted-foreground">No freight rates found.</p>}
      </div>
    </div>
  </section>;
}
