import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function OrderFlowList({open,masters}) {
  const [filters,setFilters]=useState({stage:'',buyer:'',supplier:'',delayed:false,today:false}),[rows,setRows]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[stages,setStages]=useState([]);
  useEffect(()=>{
    let active=true;
    const params=new URLSearchParams(Object.entries(filters).filter(([,v])=>v!==''));
    Promise.all([api(`/orders/flows?${params}`),api('/orders/flow-metadata')]).then(([r,m])=>{if(active){setRows(r);setStages(m.stages);setError('');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[filters]);
  const update=(key,value)=>{setLoading(true);setFilters({...filters,[key]:value});};
  return <div className="p-3"><div className="mb-3 flex flex-wrap items-center gap-3"><select aria-label="Stage" value={filters.stage} onChange={e=>update('stage',e.target.value)} className="h-9 rounded border px-2"><option value="">All stages</option>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><input aria-label="Buyer" placeholder="Filter buyer" value={filters.buyer} onChange={e=>update('buyer',e.target.value)} className="h-9 rounded border px-2"/><select aria-label="Supplier" value={filters.supplier} onChange={e=>update('supplier',e.target.value)} className="h-9 rounded border px-2"><option value="">All suppliers</option>{masters.suppliers?.map(s=><option key={s.id} value={s.id}>{s.group_name}</option>)}</select>{[['delayed','Delayed orders'],['today',"Today's dispatches"]].map(([k,l])=><label key={k} className="text-sm"><input type="checkbox" checked={filters[k]} onChange={e=>update(k,e.target.checked)}/> {l}</label>)}</div>{error?<p role="alert" className="text-red-700">{error}</p>:loading?<p>Loading…</p>:rows.length===0?<p>No matching order flows.</p>:<div className="overflow-auto"><table className="w-full text-sm"><thead><tr>{['Order','Buyer','Material','Quantity kg','Stage','Status','Days in stage'].map(h=><th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.transaction_id} className={r.delayed?'bg-red-50':''}><td className="border p-2"><button onClick={()=>open(r.transaction_id)} className="underline">{r.order_no}</button></td>{[r.buyer_name,r.material,r.quantity_kg,stages.find(s=>s.id===r.current_stage)?.name||'Not started',r.status,r.days_in_stage].map((v,i)=><td key={i} className="border p-2">{v}</td>)}</tr>)}</tbody></table></div>}</div>;
}
