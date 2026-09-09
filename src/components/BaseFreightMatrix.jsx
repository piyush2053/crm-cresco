/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { LoaderCircle, Pencil, Plus, Upload, X } from "lucide-react";
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
  const [appliedSearch, setAppliedSearch] = useState(null);
  const [searchDirty, setSearchDirty] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const toast = useToast();

  async function load(filters = {}) {
    setLoading(true);
    try { const query = new URLSearchParams(Object.entries(filters).filter(([,value])=>value.trim())).toString(); const [rateRows, districtRows] = await Promise.all([api(`/logistics/base-freight${query?`?${query}`:""}`), api("/logistics/districts")]); const normalizedFrom=(filters.from||"").trim().toLowerCase(),normalizedTo=(filters.to||"").trim().toLowerCase();setRows(rateRows.filter(row=>(!normalizedFrom||row.from_district.toLowerCase()===normalizedFrom)&&(!normalizedTo||row.to_district.toLowerCase()===normalizedTo))); setDistricts(districtRows); }
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
      await load({from:fromSearch,to:toSearch});
      toast(editing ? "Freight rate updated and previous version retained." : "Freight rate saved.");
    } catch (error) { toast(error.message, "error"); }
  }

  function add() { setForm(emptyForm); setEditing(false); setOpen(true); }
  function edit(row) {
    setForm({ from: row.from_district, to: row.to_district, load: row.quantity_kg, freight: row.base_freight_per_kg, remarks: "Rate edited from Freight Rates" });
    setEditing(true);
    setOpen(true);
  }

  const districtOptions = [...new Map(districts.filter(row=>row.is_active).sort((a,b)=>(b.state==="Unmapped")-(a.state==="Unmapped")).map(row => [row.name.toUpperCase(), { value: row.name, label: row.name }])).values()].sort((a,b)=>a.label.localeCompare(b.label));

  async function searchRates(event){event.preventDefault();const filters={from:fromSearch,to:toSearch};await load(filters);setAppliedSearch(filters);setSearchDirty(false)}
  function clearSearch(){setFromSearch("");setToSearch("");setAppliedSearch(null);setSearchDirty(false);load()}

  return <section className="overflow-visible rounded-xl border">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
      <div><h3 className="font-semibold">Frieght Rates Configs</h3><p className="text-xs text-muted-foreground">Base freight master · Rs/Kg · edits retain version history</p></div>
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

    <form onSubmit={searchRates} className="grid gap-3 border-b p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
      <SelectField value={fromSearch} onChange={value=>{setFromSearch(value);setToSearch("");setSearchDirty(true)}} options={districtOptions} placeholder="Select From district" loading={loading} searchPlaceholder="Search From district…" />
      <SelectField value={toSearch} onChange={value=>{setToSearch(value);setSearchDirty(true)}} options={districtOptions.filter(option=>option.value!==fromSearch)} placeholder={fromSearch?"Select To district":"Select From first"} disabled={!fromSearch} loading={loading} searchPlaceholder="Search To district…" />
      <button disabled={loading} className="h-10 rounded bg-primary px-5 text-sm font-medium text-white disabled:opacity-60">{loading?<LoaderCircle className="mx-auto w-4 animate-spin"/>:"Search"}</button>
      <button type="button" disabled={loading||(!fromSearch&&!toSearch)} onClick={clearSearch} className="h-10 rounded border px-4 text-sm disabled:opacity-40">Clear</button>
    </form>
    {appliedSearch&&!searchDirty&&<div className="flex items-center gap-2 border-b bg-card/30 px-4 py-2 text-xs"><span className="text-muted-foreground">Searched results:</span><span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-medium">{appliedSearch.from||"Any From"} → {appliedSearch.to||"Any To"}<button type="button" onClick={clearSearch} className="ml-1 rounded-full hover:bg-white" aria-label="Clear searched results"><X className="h-3.5 w-3.5"/></button></span></div>}
    {searchDirty&&<div className="border-b bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">District selection changed. Click <b>Search</b> to load matching freight rates.</div>}
    <div className="max-h-[52vh] overflow-auto">
      <table className="w-full min-w-[760px] text-sm"><thead className="sticky top-0 bg-card"><tr>{["From","To","Load (KG)","Freight (Rs/Kg)","Source","Action"].map(heading => <th key={heading} className="border-b p-3 text-left">{heading}</th>)}</tr></thead>
        <tbody>{!searchDirty&&rows.map(row => <tr key={row.id} className="hover:bg-card/40"><td className="border-b p-3 font-medium">{row.from_district}</td><td className="border-b p-3 font-medium">{row.to_district}</td><td className="border-b p-3">{Number(row.quantity_kg).toLocaleString("en-IN")}</td><td className="border-b p-3">₹{row.base_freight_per_kg}</td><td className="border-b p-3">{row.source}</td><td className="border-b p-3">{can("update") ? <button onClick={() => edit(row)} className="inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs"><Pencil className="w-3.5" />Edit</button> : "—"}</td></tr>)}</tbody>
      </table>
      {loading ? <div className="grid min-h-40 place-items-center"><div className="text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-accent"/>Loading freight rates…</div></div> : !searchDirty&&!rows.length && <div className="p-10 text-center"><p className="font-medium">No results for selected districts</p><p className="mt-1 text-sm text-muted-foreground">No freight rate is configured for {appliedSearch?.from||"the selected From district"} → {appliedSearch?.to||"the selected To district"}.</p></div>}
    </div>
  </section>;
}
