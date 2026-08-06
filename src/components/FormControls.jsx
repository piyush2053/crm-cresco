import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SelectField({ name, value, defaultValue = "", onChange, options = [], placeholder = "Select an option", required = false, disabled = false, className = "" }) {
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
    <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} onKeyDown={event=>{if(event.key==="Escape")setOpen(false);if(event.key==="ArrowDown"){event.preventDefault();setOpen(true)}}} aria-haspopup="listbox" aria-expanded={open} aria-required={required} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 text-left text-sm transition hover:border-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-card disabled:opacity-60">
      <span className={selected ? "text-foreground" : "text-muted-foreground"}>{selected?.label || placeholder}</span><ChevronDown className={`w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
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

export function ToggleField({ name, defaultChecked = false, label }) {
  return <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" /><span className="relative h-5 w-9 rounded-full bg-muted transition peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-4" />{label}</label>;
}
