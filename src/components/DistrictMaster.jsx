/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Search, X } from "lucide-react";
import { api } from "../lib/api";
import { can } from "../lib/permissions";

const empty = { name: "", state: "", state_code: "", pincodes: "" };

export default function DistrictMaster({ toast }) {
  const [rows, setRows] = useState([]), [search, setSearch] = useState(""), [form, setForm] = useState(null),[loading,setLoading]=useState(true);
  async function load(){setLoading(true);try{setRows(await api("/logistics/districts"))}catch(error){toast(error.message,"error")}finally{setLoading(false)}}
  useEffect(()=>{load()},[]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return rows.filter(row=>!q||`${row.name} ${row.state} ${row.state_code||""} ${(row.pincodes||[]).join(" ")}`.toLowerCase().includes(q))},[rows,search]);
  async function save(event){event.preventDefault();try{await api("/logistics/districts",{method:"POST",body:JSON.stringify(form)});toast("District added to District Master.");setForm(null);load()}catch(error){toast(error.message,"error")}}
  return <section className="mb-4 w-full overflow-hidden rounded-xl border border-accent/30">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-accent/5 p-4"><div><h3 className="font-semibold">District Master</h3><p className="text-xs text-muted-foreground">Controls all Logistics From and To dropdowns · {rows.length} districts</p></div>{can("create")&&<button onClick={()=>setForm({...empty})} className="rounded bg-accent px-3 py-2 text-sm"><Plus className="mr-1 inline w-4"/>Add District</button>}</div>
    <div className="border-b p-3"><label className="relative block"><Search className="absolute left-3 top-2.5 w-4 text-muted-foreground"/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search district, state, state code or pincode…" className="h-9 w-full rounded border pl-9 pr-3 text-sm"/></label></div>
    <div className="max-h-80 overflow-auto"><table className="w-full min-w-[650px] text-sm"><thead className="sticky top-0 bg-card"><tr>{["District","State / Union Territory","State Code","Pincodes","Status"].map(label=><th key={label} className="border-b p-3 text-left">{label}</th>)}</tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td className="border-b p-3 font-medium">{row.name}</td><td className="border-b p-3">{row.state}</td><td className="border-b p-3">{row.state_code||"—"}</td><td className="border-b p-3">{row.pincodes?.join(", ")||"—"}</td><td className="border-b p-3">{row.is_active?"Active":"Inactive"}</td></tr>)}</tbody></table>{loading?<div className="grid min-h-40 place-items-center"><div className="text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-accent"/>Loading districts…</div></div>:!filtered.length&&<p className="p-8 text-center text-muted-foreground">No districts found.</p>}</div>
    {form&&<div className="border-t bg-card p-4"><div className="mb-3 flex justify-between"><b>Add District</b><button onClick={()=>setForm(null)}><X className="w-4"/></button></div><form onSubmit={save} className="grid gap-3 sm:grid-cols-4">{[["District Name","name","e.g. INDORE"],["State","state","e.g. Madhya Pradesh"],["State Code","state_code","e.g. MP"],["Pincodes","pincodes","Comma-separated"]].map(([label,name,placeholder])=><label key={name}><small className="mb-1 block">{label}</small><input required={["name","state"].includes(name)} value={form[name]} onChange={event=>setForm({...form,[name]:event.target.value})} placeholder={placeholder} className="h-10 w-full rounded border px-3"/></label>)}<button className="rounded bg-primary px-4 py-2 text-white sm:col-span-4">Save District</button></form></div>}
  </section>
}
