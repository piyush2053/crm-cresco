import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SelectField({ name, value, defaultValue = "", onChange, options = [], placeholder = "Select an option", required = false, disabled = false, loading = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const root = useRef(null);
  useEffect(() => {
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const currentValue = value === undefined ? internalValue : value;
  const selected = options.find((option) => String(option.value) === String(currentValue));
  const choose = (nextValue) => { if (value === undefined) setInternalValue(nextValue); onChange?.(nextValue); setOpen(false); };
  return <div ref={root} className={`relative ${className}`}>
    {name && <input type="hidden" name={name} value={currentValue ?? ""} />}
    <button type="button" disabled={disabled||loading} onClick={() => setOpen((current) => !current)} onKeyDown={event=>{if(event.key==="Escape")setOpen(false);if(event.key==="ArrowDown"){event.preventDefault();setOpen(true)}}} aria-haspopup="listbox" aria-expanded={open} aria-required={required} aria-busy={loading} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 text-left text-sm transition hover:border-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-card disabled:opacity-60">
      <span className={selected ? "text-foreground" : "text-muted-foreground"}>{loading?"Loading options…":selected?.label || placeholder}</span>{loading?<LoaderCircle className="w-4 animate-spin text-accent"/>:<ChevronDown className={`w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />}
    </button>
    {open && <div role="listbox" className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-white p-1 shadow-elevated">
      {!options.length&&<p className="px-3 py-2 text-sm text-muted-foreground">No options available</p>}
      {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={String(option.value) === String(currentValue)} onClick={() => choose(option.value)} className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-card focus:bg-card focus:outline-none">
        {option.label}{String(option.value) === String(currentValue) && <Check className="w-4 text-accent" />}
      </button>)}
    </div>}
  </div>;
}

export function DateField({ value, onChange, required = false }) {
  return <div className="relative"><input required={required} type="date" value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20" /><CalendarDays className="pointer-events-none absolute right-3 top-3 w-4 text-secondary" /></div>;
}

const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const readDate = value => { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); };
const prettyDate = value => value ? readDate(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

export function DateRangeField({ start, end, onChange, className = "" }) {
  const initial = start ? readDate(start) : new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [pickingEnd, setPickingEnd] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const days = [];
  const firstWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  for (let index = 0; index < firstWeekday; index += 1) days.push(null);
  for (let day = 1; day <= count; day += 1) days.push(new Date(view.getFullYear(), view.getMonth(), day));
  function select(date) {
    const value = isoDate(date);
    if (!pickingEnd) {
      onChange(value, "");
      setPickingEnd(true);
      return;
    }
    const nextStart = value < start ? value : start;
    const nextEnd = value < start ? start : value;
    onChange(nextStart, nextEnd);
    setPickingEnd(false);
    setOpen(false);
  }
  const previous = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const next = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
  return <div ref={root} className={`relative ${className}`}>
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 text-left text-sm transition hover:border-secondary focus:outline-none focus:ring-2 focus:ring-primary/20">
      <span className={start ? "text-foreground" : "text-muted-foreground"}>{start ? `${prettyDate(start)}${end ? `  →  ${prettyDate(end)}` : "  →  Select end date"}` : "Select date range"}</span><CalendarDays className="w-4 text-secondary" />
    </button>
    {open && <div className="absolute left-0 z-40 mt-1 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-white p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between"><button type="button" onClick={previous} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-card"><ChevronLeft className="w-4" /></button><b className="text-sm">{view.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</b><button type="button" onClick={next} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-card"><ChevronRight className="w-4" /></button></div>
      <div className="grid grid-cols-7 text-center">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <span key={day} className="py-2 text-[11px] font-semibold text-muted-foreground">{day}</span>)}{days.map((date, index) => {
        if (!date) return <span key={`blank-${index}`} />;
        const value = isoDate(date), edge = value === start || value === end, within = start && end && value > start && value < end, today = value === isoDate(new Date());
        return <button type="button" key={value} onClick={() => select(date)} className={`h-9 text-xs transition ${edge ? "rounded-lg bg-primary font-semibold text-white" : within ? "bg-primary/10 text-primary" : "rounded-lg hover:bg-card"} ${today && !edge ? "font-bold ring-1 ring-inset ring-accent" : ""}`}>{date.getDate()}</button>;
      })}</div>
      <div className="mt-3 flex items-center justify-between border-t pt-3"><p className="text-xs text-muted-foreground">{pickingEnd ? "Select end date" : "Select start date"}</p><button type="button" onClick={() => { const today = new Date(), value = isoDate(today); setView(new Date(today.getFullYear(), today.getMonth(), 1)); onChange(value, value); setPickingEnd(false); setOpen(false); }} className="text-xs font-medium text-secondary">Today</button></div>
    </div>}
  </div>;
}

export function ToggleField({ name, defaultChecked = false, label }) {
  return <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" /><span className="relative h-5 w-9 rounded-full bg-muted transition peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-4" />{label}</label>;
}
