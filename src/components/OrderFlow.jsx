/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import crescoLogo from '../assets/logo-full.png';

const label = key => key.replaceAll('_', ' ').replace(/\b\w/g, c=>c.toUpperCase());
const today = () => new Date().toLocaleDateString('en-CA');
function defaults(schema) {
  return Object.fromEntries(Object.entries(schema).filter(([,v])=>v==='date'||v==='datetime').map(([k,v])=>[k,v==='date'?today():new Date().toISOString()]));
}
function localTime(value) {
  if(!value)return '';
  const date=new Date(value);
  return Number.isNaN(+date)?'':new Date(+date-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

function Fields({ schema, value, change, nested, masters, advance }) {
  return <div className="grid gap-3 sm:grid-cols-2">{Object.entries(schema).map(([key,type])=>{
    if(nested[type]) {
      const rows=value[key]||[{}];
      return <fieldset key={key} className="rounded border p-3 sm:col-span-2"><legend>{label(key)}</legend>{rows.map((row,index)=><div key={index} className="mb-3 rounded border p-3"><Fields schema={nested[type]} value={row} nested={nested} masters={masters} change={next=>change({...value,[key]:rows.map((r,i)=>i===index?next:r)})}/><button type="button" disabled={rows.length===1} onClick={()=>change({...value,[key]:rows.filter((_,i)=>i!==index)})} className="mt-2 rounded border px-2 py-1 text-sm">Remove</button></div>)}<button type="button" onClick={()=>change({...value,[key]:[...rows,{}]})} className="rounded border px-3 py-2">Add {type==='suppliers'?'supplier':type==='vehicles'?'vehicle':'invoice'}</button></fieldset>;
    }
    const update=e=>change({...value,[key]:type==='datetime'&&e.target.value?new Date(e.target.value).toISOString():e.target.value});
    const required=!String(type).endsWith('?')&&!(advance===false&&key==='mode');
    const options=key==='supplier_id'?(masters.suppliers||[]).map(s=>[s.id,s.group_name]):key==='transporter_id'?(masters.transporters||[]).map(s=>[s.id,s.company_name]):Array.isArray(type)?type.map(v=>[v,v]):null;
    const inputType=type==='date'?'date':type==='datetime'?'datetime-local':['positive','nonnegative','positive?'].includes(type)?'number':'text';
    return <label key={key} className="text-sm">{label(key)}{required?' *':''}{options?<select required={required} value={value[key]??''} onChange={update} className="mt-1 h-10 w-full rounded border bg-white px-2"><option value="">Select</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>:<input required={required} type={inputType} min={type==='positive'?0.0001:0} step="any" value={type==='datetime'?localTime(value[key]):value[key]??''} onChange={update} className="mt-1 h-10 w-full rounded border px-3"/>}</label>;
  })}</div>;
}

export default function OrderFlow({ id, masters, onActive }) {
  const [meta,setMeta]=useState(null),[flow,setFlow]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[editor,setEditor]=useState(null),[fields,setFields]=useState({}),[tab,setTab]=useState('Details'),[notice,setNotice]=useState(''),[command,setCommand]=useState('advance'),[reason,setReason]=useState('');
  const version=useRef(0),queue=useRef(Promise.resolve()),retry=useRef(null),draftTimer=useRef(null);
  const [recommendations,setRecommendations]=useState([]);
  async function load() {
    try { const [m,f]=await Promise.all([api('/orders/flow-metadata'),api(`/orders/${id}/flow`)]);setMeta(m);setFlow(f);if(f)onActive?.();version.current=f?.version||0;setError(''); }
    catch(e){setError(e.message);}finally{setLoading(false);}
  }
  useEffect(()=>{load();},[id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if(editor?.id!=='4')return;
    let active=true;
    api(`/orders/${id}/flow/suppliers`).then(rows=>{if(active)setRecommendations(rows);}).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;};
  },[id,editor?.id]);
  const current=meta?.stages.findIndex(s=>s.id===flow?.current_stage)??-1;
  const next=meta?.stages[current+1];
  const perms=flow?.permissions||meta?.permissions||{};
  const can=s=>perms.stages?perms.stages.includes(s):perms.update&&(perms.admin||perms.manager||perms.team);
  function open(stage,action='advance') {
    setCommand(action);setReason('');setError('');retry.current=null;
    let local;
    try { local=JSON.parse(sessionStorage.getItem(`order-flow-${id}-${stage.id}`)); }catch{local=null;}
    const draft=local||flow?.drafts?.find(d=>d.stage===stage.id)?.fields;
    const known=Object.fromEntries(Object.entries(flow?.data?.buyer_defaults||{}).filter(([key])=>key in stage.fields));
    setFields({...defaults(stage.fields),...known,...(flow?.data?.[stage.id]||{}),...(draft||{}),...(['1','3'].includes(stage.id)?{...(stage.id==='3'?{quantity_kg:flow.data.quantity_kg}:{}),delivered_price:flow.data.delivered_price}:{}),...(stage.id==='2'?{payment_terms:flow?.data?.payment_terms}: {})});setEditor(stage);
  }
  async function send(action,stage,data,why='') {
    const run=async()=>{
      const signature=JSON.stringify({action,stage,data,why});
      const body=retry.current?.signature===signature?retry.current.body:{action,stage,fields:data,reason:why,version:version.current,request_key:crypto.randomUUID()};
      retry.current={signature,body};
      try { const result=await api(`/orders/${id}/flow`,{method:'POST',body:JSON.stringify(body)});version.current=result.version;retry.current=null;return result; }
      catch(e){if(e.status)retry.current=null;throw e;}
    };
    const result=queue.current.then(run,run);queue.current=result.catch(()=>{});return result;
  }
  async function commit(action=command) {
    clearTimeout(draftTimer.current);
    setBusy(true);setError('');
    try {
      const submitted=editor?.id==='3A'&&reason?{...fields,override_reason:reason}:fields;
      await send(action,editor?.id,submitted,reason);
      if(action!=='draft')sessionStorage.removeItem(`order-flow-${id}-${editor?.id}`);
      setEditor(null);setNotice(action==='draft'?'Draft saved.':'Order saved.');await load();
    }catch(e){setError(e.message);if(e.status===409)await load();}finally{setBusy(false);}
  }
  useEffect(()=>{
    if(!editor||!['advance','edit'].includes(command)||busy)return;
    draftTimer.current=setTimeout(()=>{
      send('draft',editor.id,fields).then(()=>setNotice('Draft saved.')).catch(e=>setError(e.message));
    },1500);
    return()=>clearTimeout(draftTimer.current);
  },[fields,editor,command,busy]); // eslint-disable-line react-hooks/exhaustive-deps
  async function enroll(){setBusy(true);try{await send('enroll','0',{});await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function quotation(){
    const win=window.open('','_blank');
    if(!win){setError('Allow pop-ups to preview and print the quotation.');return;}
    try {const q=await api(`/orders/${id}/flow/quotation`);win.document.write(q.html.replaceAll('{{LOGO_URL}}',new URL(crescoLogo,window.location.origin).href));win.document.close();win.focus();}
    catch(e){win.close();setError(e.message);}
  }
  if(loading)return <p className="p-4">Loading order flow…</p>;
  if(!meta)return <p role="alert" className="p-4 text-red-700">{error}</p>;
  return <section className="space-y-4">
    {error&&<p role="alert" className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
    {notice&&<p role="status" className="text-sm text-green-700">{notice}</p>}
    {!flow?<div className="rounded border p-4"><p className="mb-3">This transaction uses the legacy workflow. Enrollment starts the stage checks from Enquiry Received.</p>{perms.update&&(perms.team||perms.manager)&&<button disabled={busy} onClick={enroll} className="rounded bg-accent px-4 py-2">Enable order flow</button>}</div>:<>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><b>{flow.order_no}</b><p>{flow.data.material} · {flow.data.grade} · {flow.data.quantity_kg} kg</p><span className="rounded bg-amber-50 px-2 py-1 text-sm">{flow.status}</span></div>{next&&flow.status!=='Cancelled'&&can(next.id)&&<button disabled={busy} onClick={()=>open(next)} className="rounded bg-accent px-4 py-2">{next.name}</button>}</div>
      <div className="flex gap-2 overflow-auto pb-2" aria-label="Order stages">{meta.stages.map((s,index)=><button key={s.id} disabled={index>current||!can(s.id)||(index<current&&!perms.manager)} onClick={()=>open(s,'edit')} className={`min-w-36 rounded border p-3 text-left text-sm ${index===current?'border-accent bg-amber-50':index<current?'bg-green-50':'bg-gray-50 text-gray-500'}`}>{index<=current?'✓ ':''}{s.id} · {s.name}</button>)}</div>
      {(flow.data.delivery_at_risk||flow.data.vehicle_late||flow.data.invoice_mismatch||flow.data.claim_required)&&<p role="alert" className="rounded bg-red-50 p-3 text-red-700">{[flow.data.delivery_at_risk&&'Delivery date at risk',flow.data.vehicle_late&&'Vehicle late',flow.data.invoice_mismatch&&'Invoice mismatch',flow.data.claim_required&&'Accounts claim required'].filter(Boolean).join(' · ')}</p>}
      <div className="flex border-b">{['Details','Timeline',...(perms.margin?['Margin']:[])].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 ${tab===t?'border-b-2 border-accent':''}`}>{t}</button>)}</div>
      {flow.data['2']&&<button onClick={quotation} className="rounded border px-3 py-2 text-sm">Preview quotation / print PDF</button>}
      {tab==='Details'&&flow.tasks?.length>0&&<ul className="space-y-1 text-sm">{flow.tasks.map(t=><li key={t.kind}>{t.kind} ? {t.assigned_role} ? {t.status}</li>)}</ul>}{tab==='Details'&&<div className="grid gap-3 text-sm sm:grid-cols-3">{[['Delivered price / kg',flow.data.delivered_price],['Order value incl. GST',flow.data.order_value],['Expected delivery',flow.data.expected_delivery],['Buyer invoice',flow.data.buyer_invoice?.number],['Available credit',flow.data.credit_check?.available]].map(([k,v])=><div key={k} className="rounded border p-3"><span className="text-muted-foreground">{k}</span><p>{v??'—'}</p></div>)}</div>}
      {tab==='Timeline'&&<div>{flow.timeline?.map(log=><div key={log.id} className="border-l-2 pb-3 pl-3"><b>{log.stage} · {log.action}</b><p className="text-xs">{log.actor_name} · {new Date(log.created_at).toLocaleString()}</p></div>)}</div>}
      {tab==='Margin'&&perms.margin&&<p>Margin per kg: ₹{flow.data.margin_per_kg??'Available after supplier confirmation'}</p>}
      {perms.update&&perms.manager&&flow.status!=='Delivered'&&<div className="flex gap-3"><button onClick={()=>{setEditor(meta.stages[Math.max(0,current-1)]);setFields({});setCommand('back');setReason('');}} className="rounded border px-3 py-2">Go back with reason</button><button onClick={()=>{setEditor(meta.stages[Math.max(0,current)]);setFields({});setCommand('cancel');setReason('');}} className="rounded border px-3 py-2">Cancel with reason</button>{perms.admin&&next&&<button onClick={()=>{setEditor(next);setFields({});setCommand('skip');setReason('');}} className="rounded border px-3 py-2">Admin skip next stage</button>}</div>}
    </>}
    {editor&&<div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"><form onSubmit={e=>{e.preventDefault();commit();}} className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6"><h3 className="mb-4 text-lg font-semibold">{command==='advance'||command==='edit'?editor.name:label(command)}</h3>{error&&<p role="alert" className="mb-3 text-red-700">{error}</p>}{editor.id==='4'&&recommendations.length>0&&<p className="mb-3 rounded bg-green-50 p-3 text-sm">Suggested suppliers: {recommendations.map(r=>r.group_name+' ('+r.warehouse_name+')').join(', ')}</p>}{editor.id==='3A'&&flow.data.credit_check&&!flow.data.credit_check.advance&&<p className="mb-3 rounded bg-amber-50 p-3 text-sm">Credit limit: ?{flow.data.credit_check.limit} ? Outstanding: ?{flow.data.credit_check.outstanding} ? Open orders: ?{flow.data.credit_check.open} ? Available: ?{flow.data.credit_check.available} ? Order: ?{flow.data.credit_check.value}. Confirm to re-run the check.</p>}{['back','cancel','skip'].includes(command)?null:<Fields schema={editor.id==='3A'&&flow.data.payment_terms!=='Advance'?{}:editor.fields} value={fields} change={nextFields=>{retry.current=null;setFields(nextFields);try{sessionStorage.setItem(`order-flow-${id}-${editor.id}`,JSON.stringify(nextFields));}catch{/* Server draft remains available. */}}} nested={meta.nestedSchemas} masters={{...masters,suppliers:[...recommendations,...(masters.suppliers||[]).filter(s=>!recommendations.some(r=>String(r.id)===String(s.id))) ]}} advance={flow?.data?.payment_terms==='Advance'}/>}{((command!=='advance'&&editor.id!=='3A')||(editor.id==='3A'&&perms.admin))&&<label className="mt-3 block text-sm">{editor.id==='3A'?'Admin override reason (if credit fails)':'Approval reason'}<input required={['back','cancel','skip'].includes(command)||command==='edit'&&editor.id!==flow.current_stage} value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 h-10 w-full rounded border px-3"/></label>}<div className="mt-5 flex gap-3"><button disabled={busy} className="rounded bg-accent px-4 py-2">{busy?'Saving…':'Confirm'}</button><button type="button" disabled={busy} onClick={()=>['back','cancel','skip'].includes(command)?setEditor(null):commit('draft')} className="rounded border px-4 py-2">Save draft & close</button></div></form></div>}
  </section>;
}
