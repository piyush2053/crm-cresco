/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { SelectField } from "./FormControls";

const types = ["pure", "prime", "standard", "market"];
const priceKey = (type) => `${type}_price`;

export default function SupplierGradePricing({ warehouse, initial, setRows, toast }) {
  const [rows, setLocal] = useState(initial);
  const [masters, setMasters] = useState([]);
  const [addingGrade, setAddingGrade] = useState(null);
  const [gradeChoice, setGradeChoice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => setLocal(initial), [initial]);
  useEffect(() => {
    api("/suppliers/grade-master").then(setMasters).catch((error) => toast(error.message, "error"));
  }, [toast]);
  useEffect(() => {
    setAddingGrade(null);
    setGradeChoice("");
    setCategoryName("");
  }, [warehouse.id]);

  async function reload() {
    const data = await api(`/suppliers/warehouses/${warehouse.id}/catalogue`);
    setLocal(data);
    setRows(data);
  }

  function change(id, field, value) {
    setLocal((current) => current.map((row) => (row.grade_id === id ? { ...row, [field]: value } : row)));
  }

  async function save(row, patch = {}) {
    const data = { ...row, ...patch };
    if (!data.active_rate_type) {
      data.active_rate_type = types.find((type) => data[priceKey(type)] !== "" && data[priceKey(type)] != null);
    }
    setSaving(row.grade_id);
    try {
      await api(`/suppliers/grades/${row.grade_id}/price`, {
        method: "PUT",
        body: JSON.stringify({
          ...Object.fromEntries(types.map((type) => [priceKey(type), data[priceKey(type)]])),
          active_rate_type: data.active_rate_type,
          remarks: data.remarks,
        }),
      });
      await reload();
      toast("Grade pricing auto-saved.");
    } catch (error) {
      toast(error.message, "error");
      await reload();
    } finally {
      setSaving(null);
    }
  }

  function activate(row, type) {
    if (row[priceKey(type)] === "" || row[priceKey(type)] == null) {
      toast(`Enter ${type} rate before activating it.`, "error");
      return;
    }
    change(row.grade_id, "active_rate_type", type);
    save(row, { active_rate_type: type });
  }

  async function addGrade() {
    if (!gradeChoice || !addingGrade) return;
    try {
      await api(`/suppliers/categories/${addingGrade}/grades`, {
        method: "POST",
        body: JSON.stringify({ master_grade_id: gradeChoice }),
      });
      setAddingGrade(null);
      setGradeChoice("");
      await reload();
      toast("Grade added.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return toast("Enter a product category name.", "error");
    setCreatingCategory(true);
    try {
      await api(`/suppliers/warehouses/${warehouse.id}/categories`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCategoryName("");
      await reload();
      toast("Product category added. You can now add grades to it.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this grade and its price history?")) return;
    try {
      await api(`/suppliers/grades/${id}`, { method: "DELETE" });
      await reload();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  const categories = [...new Map(rows.map((row) => [row.category_id, row.category_name])).entries()];

  return (
    <div>
      <form onSubmit={addCategory} className="mb-5 rounded border bg-card p-4">
        <div className="mb-2">
          <b>Product Categories</b>
          <p className="text-sm text-muted-foreground">Create a category for this warehouse first, then add grades from the Grade Master.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            maxLength={100}
            placeholder="e.g. TMT Bar, Cement"
            className="h-10 flex-1 rounded border px-3"
          />
          <button disabled={creatingCategory || !categoryName.trim()} className="rounded bg-primary px-4 text-white disabled:opacity-40">
            {creatingCategory ? <LoaderCircle className="mr-2 inline w-4 animate-spin" /> : <Plus className="mr-1 inline w-4" />}
            Add Category
          </button>
        </div>
      </form>

      {categories.length === 0 && (
        <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
          No product category is configured for this warehouse. Add a category above to enable the Add Grade option.
        </div>
      )}

      {categories.map(([categoryId, name]) => (
        <section className="mb-5 overflow-visible rounded border" key={categoryId}>
          <div className="flex justify-between bg-card p-3">
            <b>{name}</b>
            <button type="button" onClick={() => setAddingGrade(categoryId)} className="text-sm text-secondary">
              <Plus className="mr-1 inline w-4" />Add Grade
            </button>
          </div>
          {addingGrade === categoryId && (
            <div className="relative z-30 flex gap-2 border-t p-3">
              <div className="flex-1">
                <SelectField
                  value={gradeChoice}
                  onChange={setGradeChoice}
                  options={masters.filter((master) => !rows.some((row) => row.category_id === categoryId && String(row.master_grade_id) === String(master.value)))}
                  placeholder="Select grade from Settings…"
                  searchPlaceholder="Search grade…"
                />
              </div>
              <button type="button" disabled={!gradeChoice} onClick={addGrade} className="rounded bg-primary px-4 text-white disabled:opacity-40">Add Row</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead><tr>{["Grade", "Pure", "Prime", "Standard", "Market", "Remarks", "Status", "Actions"].map((label) => <th className="border p-2 text-left" key={label}>{label}</th>)}</tr></thead>
              <tbody>
                {rows.filter((row) => row.category_id === categoryId && row.grade_id).map((row) => (
                  <tr key={row.grade_id}>
                    <td className="border p-2 font-medium">{row.grade_name}</td>
                    {types.map((type) => (
                      <td className={row.active_rate_type === type ? "border bg-green-50 p-2" : "border p-2"} key={type}>
                        <div className="flex gap-2">
                          <input type="radio" name={`rate-${row.grade_id}`} checked={row.active_rate_type === type} onChange={() => activate(row, type)} />
                          <input type="number" min="0" step=".0001" value={row[priceKey(type)] ?? ""} onChange={(event) => change(row.grade_id, priceKey(type), event.target.value)} onBlur={() => save(row)} className="h-9 w-24 rounded border px-2" />
                        </div>
                      </td>
                    ))}
                    <td className="border p-2"><input value={row.remarks || ""} onChange={(event) => change(row.grade_id, "remarks", event.target.value)} onBlur={() => save(row)} className="h-9 min-w-36 rounded border px-2" /></td>
                    <td className="border p-2">{row.price_active ? `Active · ${row.active_rate_type}` : "Rate required"}</td>
                    <td className="border p-2">{saving === row.grade_id ? <LoaderCircle className="w-4 animate-spin" /> : <button type="button" onClick={() => remove(row.grade_id)} className="p-2 text-red-600"><Trash2 className="w-4" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
