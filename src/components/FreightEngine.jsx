/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { api } from "../lib/api";
import { SelectField } from "./FormControls";
import { useToast } from "./toast";

const money = (value, perKg = false) => value === null || value === undefined
  ? "—"
  : `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: perKg ? 2 : 0, maximumFractionDigits: perKg ? 4 : 0 })}${perKg ? "/kg" : ""}`;

const quantityLabel = (kg) => Number(kg) < 1000 ? `${Number(kg)} KG` : `${Number(kg) / 1000} MT`;

export default function FreightEngine({ lanes = [] }) {
  const [rates, setRates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api("/logistics/base-freight"), api("/logistics/districts")]).then(([rateRows, districtRows]) => { setRates(rateRows); setDistricts(districtRows.filter(row => row.is_active)); }).catch(error => toast(error.message, "error")).finally(()=>setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const districtOptions = useMemo(() => [...new Map([...districts].sort((a,b)=>(b.state==="Unmapped")-(a.state==="Unmapped")).map(row => [row.name.toUpperCase(), { value: row.name, label: row.name }])).values()].sort((a,b)=>a.label.localeCompare(b.label)), [districts]);
  const routeRates = useMemo(() => rates
    .filter(rate => rate.from_district === from && rate.to_district === to)
    .sort((a, b) => Number(a.quantity_kg) - Number(b.quantity_kg)), [rates, from, to]);

  useEffect(() => {
    const lane = lanes.find(item =>
      String(item.pickup_district || "").toLowerCase() === from.toLowerCase() &&
      String(item.delivery_district || "").toLowerCase() === to.toLowerCase()
    );
    if (!lane) { setHistory([]); setHistoryLoading(false); return; }
    setHistoryLoading(true);
    api(`/logistics/freight-engine/${lane.id}`).then(result => setHistory(result.slabs || [])).catch(() => setHistory([])).finally(()=>setHistoryLoading(false));
  }, [from, to, lanes]);

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
        <select value={quantity} onChange={event => setQuantity(event.target.value)} disabled={!to||loading} className="h-11 w-full rounded-lg border bg-white px-3 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="">All available quantities</option>
          {routeRates.map(rate => <option key={rate.id} value={rate.quantity_kg}>{quantityLabel(rate.quantity_kg)}</option>)}
        </select>
      </label>
    </div>

    {from && to ? <div className="mt-5 overflow-hidden rounded-xl border">
      <div className="border-b bg-white px-5 py-4">
        <h3 className="font-semibold">Freight Matrix</h3>
        <p className="text-sm text-muted-foreground">{from} → {to} · rates maintained in the Base Freight Master</p>
      </div>
      {historyLoading ? <LoadingPanel text="Loading freight history…"/> : routeRates.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card"><tr>{["Quantity", "Base Freight", "Freight", "Total Freight", "Last Price", "Weighted Average"].map(label => <th key={label} className="border-b p-3 text-left">{label}</th>)}</tr></thead>
          <tbody>{routeRates.map(rate => {
            const selected = quantity && Number(quantity) === Number(rate.quantity_kg);
            const freight = rate.base_freight_per_kg;
            const historical = history.find(item => Number(item.quantity_kg) === Number(rate.quantity_kg));
            return <tr key={rate.id} className={selected ? "bg-accent/10" : "hover:bg-card/40"}>
              <td className="border-b p-3 font-semibold">{quantityLabel(rate.quantity_kg)}</td>
              <td className="border-b p-3">{money(rate.base_freight_per_kg, true)}</td>
              <td className="border-b p-3">{money(freight, true)}</td>
              <td className="border-b p-3 font-medium">{money(Number(freight) * Number(rate.quantity_kg))}</td>
              <td className="border-b p-3">{money(historical?.last_booked, true)}</td>
              <td className="border-b p-3">{money(historical?.weighted_average, true)}</td>
            </tr>;
          })}</tbody>
        </table>
      </div> : <p className="p-10 text-center text-muted-foreground">No base freight rate is available for this route.</p>}
    </div> : loading ? <LoadingPanel text="Loading districts and freight rates…"/> : <div className="mt-5 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Select From and To districts to view the freight matrix.</div>}
  </div>;
}

function DistrictField({ label, value, setValue, options, placeholder, disabled = false, loading = false }) {
  return <label>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    <SelectField value={value} onChange={setValue} options={options} placeholder={placeholder} disabled={disabled} loading={loading} searchPlaceholder={`Search ${label.toLowerCase()} by district, state or pincode…`} />
  </label>;
}

function LoadingPanel({text}){return <div className="mt-5 grid min-h-36 place-items-center rounded-xl border border-dashed bg-card/20"><div className="text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-accent"/>{text}</div></div>}
