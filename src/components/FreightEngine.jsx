/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { SelectField } from "./FormControls";
import { useToast } from "./toast";
import { formatMoney } from "../lib/format";

const money = (value, perKg = false) => value === null || value === undefined
  ? "—"
  : formatMoney(value, perKg ? "/kg" : "");

const quantityLabel = (kg) => Number(kg) < 1000 ? `${Number(kg)} KG` : `${Number(kg) / 1000} MT`;

export default function FreightEngine({ lanes = [] }) {
  const [rates, setRates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [history, setHistory] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api("/logistics/base-freight"), api("/logistics/districts")]).then(([rateRows, districtRows]) => { setRates(rateRows); setDistricts(districtRows.filter(row => row.is_active)); }).catch(error => toast(error.message, "error")).finally(()=>setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const districtOptions = useMemo(() => districts.map(row => ({ value: row.id, label: row.name })).sort((a,b)=>a.label.localeCompare(b.label)), [districts]);
  const fromDistrict = useMemo(() => districts.find(row => String(row.id) === String(from)), [districts, from]);
  const toDistrict = useMemo(() => districts.find(row => String(row.id) === String(to)), [districts, to]);
  const routeRates = useMemo(() => rates
    .filter(rate => String(rate.from_district_id) === String(from) && String(rate.to_district_id) === String(to))
    .sort((a, b) => Number(a.quantity_kg) - Number(b.quantity_kg)), [rates, from, to]);

  useEffect(() => {
    if (!fromDistrict || !toDistrict) { setHistory([]); setLatestOrders([]); setHistoryLoading(false); return; }
    const lane = lanes.find(item =>
      String(item.pickup_district || "").toLowerCase() === fromDistrict.name.toLowerCase() &&
      String(item.delivery_district || "").toLowerCase() === toDistrict.name.toLowerCase()
    );
    setHistoryLoading(true);
    Promise.all([
      lane ? api(`/logistics/freight-engine/${lane.id}`).then(result => result.slabs || []).catch(() => []) : Promise.resolve([]),
      api(`/logistics/freight-engine/latest-order?from_district_id=${from}&to_district_id=${to}`).catch(() => [])
    ]).then(([shipmentHistory,orders]) => { setHistory(shipmentHistory); setLatestOrders(orders); }).finally(()=>setHistoryLoading(false));
  }, [from, to, lanes, fromDistrict, toDistrict]);

  function changeFrom(value) {
    setFrom(value);
    setTo("");
    setQuantity("");
  }

  function changeTo(value) {
    setTo(value);
    setQuantity("");
  }

  return <div>
    <div className="grid gap-4 rounded-xl border bg-card/30 p-5 md:grid-cols-3">
      <DistrictField label="From" value={from} setValue={changeFrom} options={districtOptions} placeholder="Select From district" loading={loading} />
      <DistrictField label="To" value={to} setValue={changeTo} options={districtOptions.filter(option => option.value !== from)} placeholder={from ? "Select To district" : "Select From first"} disabled={!from} loading={loading} />
      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</span>
        <select value={quantity} onChange={event => setQuantity(event.target.value)} disabled={!to||loading||!routeRates.length} className="h-11 w-full rounded-lg border bg-white px-3 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="">{from&&to&&!routeRates.length?"No available rates":"All available quantities"}</option>
          {routeRates.map(rate => <option key={rate.id} value={rate.quantity_kg}>{quantityLabel(rate.quantity_kg)}</option>)}
        </select>
      </label>
    </div>

    {from && to ? <div className="mt-5 overflow-hidden rounded-xl border">
      <div className="border-b bg-white px-5 py-4">
        <h3 className="font-semibold">Freight Matrix</h3>
        <p className="text-sm text-muted-foreground">{fromDistrict?.name} → {toDistrict?.name} · rates maintained in the Base Freight Master</p>
      </div>
      {!routeRates.length ? <div className="bg-amber-50 p-10 text-center"><p className="font-semibold text-amber-900">No Available Rates</p><p className="mt-1 text-sm text-amber-800">No freight rate is available in Freight Rates for the selected From and To districts.</p><Link to="/logistics?tab=freight-rates" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-900 underline underline-offset-4">Open Freight Rates <ExternalLink className="h-3.5 w-3.5"/></Link></div> : historyLoading ? <LoadingPanel text="Loading freight history…"/> : <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card"><tr>{["Quantity", "Base Freight", "Total Freight", "Last Price", "Weighted Average"].map(label => <th key={label} className="border-b p-3 text-left">{label}</th>)}</tr></thead>
          <tbody>{routeRates.map(rate => {
            const selected = quantity && Number(quantity) === Number(rate.quantity_kg);
            const freight = rate.base_freight_per_kg;
            const historical = history.find(item => Number(item.quantity_kg) === Number(rate.quantity_kg));
            const latestOrder = latestOrders.find(item => Number(item.quantity_kg) === Number(rate.quantity_kg));
            return <tr key={rate.id} className={selected ? "bg-accent/10" : "hover:bg-card/40"}>
              <td className="border-b p-3 font-semibold">{quantityLabel(rate.quantity_kg)}</td>
              <td className="border-b p-3">{money(rate.base_freight_per_kg, true)}</td>
              <td className="border-b p-3 font-medium">{money(Number(freight) * Number(rate.quantity_kg))}</td>
              <td className="border-b p-3"><LastOrderPrice order={latestOrder}/></td>
              <td className="border-b p-3">{money(historical?.weighted_average, true)}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
    </div> : loading ? <LoadingPanel text="Loading districts and freight rates…"/> : <div className="mt-5 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Select From and To districts to view the freight matrix.</div>}
  </div>;
}

function LastOrderPrice({order}) {
  if (!order) return "—";
  return <div className="group relative inline-block">
    <Link to={`/orders?transaction=${order.transaction_id}`} className="inline-flex items-center gap-1 rounded font-medium text-secondary underline decoration-dotted underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-accent" aria-label={`Open latest order ${order.order_number}`}>
      {money(order.freight_per_kg,true)}<ExternalLink className="h-3.5 w-3.5"/>
    </Link>
    <div role="tooltip" className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-64 translate-y-1 rounded-lg border bg-white p-3 text-xs font-normal text-foreground opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <div className="mb-2 flex items-center justify-between gap-2"><b>Latest matching order</b><span className="rounded bg-accent/10 px-2 py-0.5 text-accent-foreground">{order.status}</span></div>
      <dl className="grid grid-cols-[72px_1fr] gap-x-2 gap-y-1.5">
        <dt className="text-muted-foreground">Order</dt><dd className="font-medium">{order.order_number}</dd>
        <dt className="text-muted-foreground">Inquiry</dt><dd>{order.inquiry_number}</dd>
        <dt className="text-muted-foreground">Buyer</dt><dd>{order.buyer_name}</dd>
        <dt className="text-muted-foreground">Order date</dt><dd>{order.order_date ? new Date(`${order.order_date}T00:00:00`).toLocaleDateString("en-IN") : "—"}</dd>
        <dt className="text-muted-foreground">Quantity</dt><dd>{quantityLabel(order.quantity_kg)}</dd>
      </dl>
      <p className="mt-2 border-t pt-2 font-medium text-secondary">Click price to open this order <ExternalLink className="ml-1 inline h-3 w-3"/></p>
    </div>
  </div>;
}

function DistrictField({ label, value, setValue, options, placeholder, disabled = false, loading = false }) {
  return <label>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    <SelectField value={value} onChange={setValue} options={options} placeholder={placeholder} disabled={disabled} loading={loading} searchPlaceholder={`Search ${label.toLowerCase()} by district, state or pincode…`} />
  </label>;
}

function LoadingPanel({text}){return <div className="mt-5 grid min-h-36 place-items-center rounded-xl border border-dashed bg-card/20"><div className="text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-accent"/>{text}</div></div>}
