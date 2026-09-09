/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Pencil, Plus, Search, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { can } from "../lib/permissions";
import { SelectField } from "./FormControls";
import { useToast } from "./toast";

const emptyForm = { from: "", to: "", load: "", freight: "", remarks: "" };

export default function BaseFreightMatrix() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try { const [rateRows, districtRows] = await Promise.all([api("/logistics/base-freight"), api("/logistics/districts")]); setRows(rateRows); setDistricts(districtRows); }
    catch (error) { toast(error.message, "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(event) {
    event.preventDefault();
    try {
      await api("/logistics/base-freight", { method: "POST", body: JSON.stringify(form) });
      setForm(emptyForm);
      setOpen(false);
      setEditing(false);
      await load();
      toast(editing ? "Freight rate updated and previous version retained." : "Freight rate saved.");
    } catch (error) { toast(error.message, "error"); }
  }

  function add() { setForm(emptyForm); setEditing(false); setOpen(true); }
  function edit(row) {
    setForm({ from: row.from_district, to: row.to_district, load: row.quantity_kg, freight: row.base_freight_per_kg, remarks: "Rate edited from Freight Rates" });
    setEditing(true);
    setOpen(true);
  }

  const filtered = useMemo(() => rows.filter(row =>
    row.from_district.toLowerCase().includes(fromSearch.trim().toLowerCase()) &&
    row.to_district.toLowerCase().includes(toSearch.trim().toLowerCase())
  ), [rows, fromSearch, toSearch]);
  const districtOptions = [...new Map(districts.filter(row=>row.is_active).sort((a,b)=>(b.state==="Unmapped")-(a.state==="Unmapped")).map(row => [row.name.toUpperCase(), { value: row.name, label: `${row.name} · ${row.state}${row.state_code ? ` (${row.state_code})` : ""}${row.pincodes?.length ? ` · ${row.pincodes.join(", ")}` : ""}` }])).values()].sort((a,b)=>a.label.localeCompare(b.label));

  return <section className="overflow-hidden rounded-xl border">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
      <div><h3 className="font-semibold">Freight Rates</h3><p className="text-xs text-muted-foreground">Base freight master · Rs/Kg · edits retain version history</p></div>
      <div className="flex gap-2">
        {can("create") && <button onClick={add} className="rounded bg-accent px-3 py-2 text-sm"><Plus className="mr-1 inline w-4" />Add Rate</button>}
        {can("create") && <Link to="/logistics/freight-upload" className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"><Upload className="mr-1 inline w-4" />Upload Excel</Link>}
      </div>
    </div>

    {open && <div className="border-b bg-card p-4"><div className="mb-3 flex items-center justify-between"><b>{editing ? "Edit Freight Rate" : "Add Freight Rate"}</b><button type="button" onClick={() => setOpen(false)}><X className="w-4" /></button></div><form onSubmit={save} className="grid gap-3 sm:grid-cols-5">
      <label><small className="mb-1 block">From District</small><SelectField value={form.from} onChange={value => setForm({...form,from:value})} options={districtOptions} placeholder="Select From" disabled={editing} loading={loading} searchPlaceholder="Search district, state or pincode…" required /></label>
      <label><small className="mb-1 block">To District</small><SelectField value={form.to} onChange={value => setForm({...form,to:value})} options={districtOptions.filter(option => option.value !== form.from)} placeholder="Select To" disabled={editing} loading={loading} searchPlaceholder="Search district, state or pincode…" required /></label>
      {[['Load (KG)','load','number'],['Freight (Rs/Kg)','freight','number'],['Reason','remarks','text']].map(([label,name,type]) => <label key={name}><small className="mb-1 block">{label}</small><input required={name !== "remarks"} readOnly={editing && name === 'load'} type={type} step={type === "number" ? "any" : undefined} value={form[name]} onChange={event => setForm({...form,[name]:event.target.value})} className="h-10 w-full rounded border bg-white px-3 read-only:bg-gray-100" /></label>)}
      <button className="rounded bg-primary px-4 py-2 text-white sm:col-span-5">{editing ? "Update Rate" : "Save Rate"}</button>
    </form></div>}

    <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
      <SearchBox label="Search From" value={fromSearch} set={setFromSearch} />
      <SearchBox label="Search To" value={toSearch} set={setToSearch} />
    </div>
    <div className="max-h-[52vh] overflow-auto">
      <table className="w-full min-w-[760px] text-sm"><thead className="sticky top-0 bg-card"><tr>{["From","To","Load (KG)","Freight (Rs/Kg)","Source","Action"].map(heading => <th key={heading} className="border-b p-3 text-left">{heading}</th>)}</tr></thead>
        <tbody>{filtered.map(row => <tr key={row.id} className="hover:bg-card/40"><td className="border-b p-3 font-medium">{row.from_district}</td><td className="border-b p-3 font-medium">{row.to_district}</td><td className="border-b p-3">{Number(row.quantity_kg).toLocaleString("en-IN")}</td><td className="border-b p-3">₹{row.base_freight_per_kg}</td><td className="border-b p-3">{row.source}</td><td className="border-b p-3">{can("update") ? <button onClick={() => edit(row)} className="inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs"><Pencil className="w-3.5" />Edit</button> : "—"}</td></tr>)}</tbody>
      </table>
      {loading ? <div className="grid min-h-40 place-items-center"><div className="text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-accent"/>Loading freight rates…</div></div> : !filtered.length && <p className="p-8 text-center text-muted-foreground">No freight rates match From and To.</p>}
    </div>
  </section>;
}

function SearchBox({label,value,set}) { return <label className="relative"><Search className="absolute left-3 top-3 w-4 text-muted-foreground" /><input value={value} onChange={event => set(event.target.value)} placeholder={`${label} district…`} className="h-10 w-full rounded border pl-9 pr-3" /></label>; }
