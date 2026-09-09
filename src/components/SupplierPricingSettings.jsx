import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function SupplierPricingSettings({ toast }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/suppliers/settings")
      .then(data => setValue(data.price_validity_hours))
      .catch(error => toast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function save(event) {
    event.preventDefault();
    const hours = Number(value);
    if (!Number.isInteger(hours) || hours < 1 || hours > 8760) {
      return toast("Enter whole hours between 1 and 8760.", "error");
    }
    setSaving(true);
    try {
      const result = await api("/suppliers/settings", {
        method: "PUT",
        body: JSON.stringify({ price_validity_hours: hours }),
      });
      setValue(result.price_validity_hours);
      toast("Supplier grade price validity updated.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return <section className="max-w-2xl rounded-xl border border-accent/30 bg-accent/5 p-5">
    <div className="mb-5">
      <span className="rounded bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-accent">Supplier Configuration</span>
      <h3 className="mt-3 text-lg font-semibold">Supplier Grade Price Validity (Hours)</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Controls how long a supplier&apos;s grade price remains valid after that grade rate is saved or updated. After this duration, the rate expires and is excluded from procurement pricing.</p>
    </div>
    <form onSubmit={save} className="flex flex-wrap items-end gap-3">
      <label className="block w-full max-w-xs">
        <span className="mb-1 block text-sm font-medium">Validity duration in hours</span>
        <input type="number" min="1" max="8760" step="1" required disabled={loading || saving} value={value} onChange={event => setValue(event.target.value)} className="h-11 w-full rounded border bg-white px-3 disabled:opacity-50" />
        <small className="mt-1 block text-muted-foreground">Example: 48 means each newly saved supplier grade rate is valid for 48 hours.</small>
      </label>
      <button disabled={loading || saving} className="h-11 rounded bg-accent px-5 font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Supplier Grade Validity"}</button>
    </form>
  </section>;
}
