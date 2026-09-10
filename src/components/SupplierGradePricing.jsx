/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { SelectField } from "./FormControls";

const types = ["pure", "prime", "standard", "market"];
const priceKey = (type) => `${type}_price`;

export default function SupplierGradePricing({ warehouse, initial, setRows, toast }) {
  const [rows, setLocal] = useState(initial);
  const [masters, setMasters] = useState({ categories: [], grades: [] });
  const [addingGrade, setAddingGrade] = useState(null);
  const [gradeChoice, setGradeChoice] = useState("");
  const [categoryChoice, setCategoryChoice] = useState("");
  const [saving, setSaving] = useState(null);
  const [adding, setAdding] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(null);

  useEffect(() => setLocal(initial), [initial]);
  useEffect(() => {
    api("/suppliers/catalogue-master").then(setMasters).catch((error) => toast(error.message, "error"));
  }, [toast]);
  useEffect(() => {
    setAddingGrade(null);
    setGradeChoice("");
    setCategoryChoice("");
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

  async function activateAll(categoryId, type) {
    const categoryRows = rows.filter((row) => row.category_id === categoryId && row.grade_id);
    const missing = categoryRows.filter((row) => row[priceKey(type)] === "" || row[priceKey(type)] == null);
    if (missing.length) return toast(`${type[0].toUpperCase() + type.slice(1)} rate is blank for: ${missing.map((row) => row.grade_name).join(", ")}.`, "error");
    setBulkSaving(`${categoryId}-${type}`);
    try {
      const result = await api(`/suppliers/categories/${categoryId}/active-rate`, {
        method: "PUT",
        body: JSON.stringify({ active_rate_type: type }),
      });
      await reload();
      toast(result.message);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBulkSaving(null);
    }
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

  async function addFirstGrade() {
    if (!categoryChoice || !gradeChoice) return;
    const categoryMaster = masters.categories.find((item) => String(item.value) === String(categoryChoice));
    if (!categoryMaster) return toast("Select a category from Product Category Master.", "error");
    setAdding(true);
    try {
      let category = rows.find((row) => row.category_name === categoryMaster.label);
      if (!category) {
        category = await api(`/suppliers/warehouses/${warehouse.id}/categories`, {
          method: "POST",
          body: JSON.stringify({ name: categoryMaster.label }),
        });
      }
      await api(`/suppliers/categories/${category.category_id || category.id}/grades`, {
        method: "POST",
        body: JSON.stringify({ master_grade_id: gradeChoice }),
      });
      setCategoryChoice("");
      setGradeChoice("");
      setAddingGrade(null);
      await reload();
      toast("Grade added.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setAdding(false);
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
      {categories.length === 0 && (
        <div className="mb-5 rounded border border-dashed p-5">
          <div className="flex items-center justify-between gap-3">
            <div><b>No grades configured</b><p className="text-sm text-muted-foreground">Add the first grade for this warehouse from configured masters.</p></div>
            <button type="button" onClick={() => setAddingGrade("first")} className="text-sm text-secondary"><Plus className="mr-1 inline w-4" />Add Grade</button>
          </div>
          {addingGrade === "first" && <div className="relative z-30 mt-4 grid gap-3 border-t pt-4 sm:grid-cols-[1fr_1fr_auto]">
            <SelectField value={categoryChoice} onChange={setCategoryChoice} options={masters.categories} placeholder="Select product category…" searchPlaceholder="Search product category…" />
            <SelectField value={gradeChoice} onChange={setGradeChoice} options={masters.grades} placeholder="Select grade…" searchPlaceholder="Search grade…" />
            <button type="button" disabled={adding || !categoryChoice || !gradeChoice} onClick={addFirstGrade} className="rounded bg-primary px-4 text-white disabled:opacity-40">{adding && <LoaderCircle className="mr-2 inline w-4 animate-spin" />}Add Row</button>
          </div>}
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
                  options={masters.grades.filter((master) => !rows.some((row) => row.category_id === categoryId && String(row.master_grade_id) === String(master.value)))}
                  placeholder="Select grade from Settings…"
                  searchPlaceholder="Search grade…"
                />
              </div>
              <button type="button" disabled={!gradeChoice} onClick={addGrade} className="rounded bg-primary px-4 text-white disabled:opacity-40">Add Row</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead><tr><th className="border p-2 text-left">Grade</th>{types.map((type) => {const categoryRows=rows.filter((row)=>row.category_id===categoryId&&row.grade_id),allSelected=categoryRows.length>0&&categoryRows.every((row)=>row.active_rate_type===type),busy=bulkSaving===`${categoryId}-${type}`;return <th className="border p-2 text-left" key={type}><label className="flex cursor-pointer items-center gap-2" title={`Set ${type} as active rate for all grades in ${name}`}><input type="radio" name={`all-rates-${categoryId}`} checked={allSelected} disabled={!!bulkSaving} onChange={()=>activateAll(categoryId,type)}/>{busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<span className="capitalize">{type}</span>}</label></th>})}<th className="border p-2 text-left">Remarks</th><th className="border p-2 text-left">Status</th><th className="border p-2 text-left">Actions</th></tr></thead>
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
