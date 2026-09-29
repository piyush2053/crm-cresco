import { useEffect } from "react";
import { Check, FileSpreadsheet, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function ExcelSampleModal({ title, description, headers, rows, rules, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-sample-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="flex max-h-[94dvh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
              <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="excel-sample-title" className="text-lg font-semibold text-primary sm:text-xl">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sample Excel preview" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid gap-3 md:grid-cols-2">
            {rules.map((rule) => (
              <div key={rule} className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-950">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card/70 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-primary">Sample worksheet</h3>
                <p className="text-xs text-muted-foreground">Scroll horizontally to view every Excel column.</p>
              </div>
              <span className="rounded-full border border-accent/20 bg-white px-2.5 py-1 text-xs font-medium text-accent">{headers.length} required headers</span>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-max border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    {headers.map((header) => (
                      <th key={header.name} className="max-w-64 border-b border-r px-3 py-3 align-top last:border-r-0">
                        <span className="block whitespace-nowrap font-semibold text-slate-800">{header.name}</span>
                        <span className={`mt-1 block whitespace-nowrap font-normal ${header.valueRule ? "text-amber-700" : "text-slate-400"}`}>
                          {header.valueRule || "Value may be blank"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`sample-${rowIndex}`} className="odd:bg-white even:bg-slate-50/70">
                      {headers.map((header) => (
                        <td key={header.name} className="max-w-64 border-b border-r px-3 py-3 align-top last:border-r-0">
                          <span className="block max-w-60 whitespace-normal break-words text-slate-700">{row[header.name] || <span className="text-slate-300">—</span>}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This is a view-only example. No file is downloaded, and your upload flow is unchanged.</p>
        </div>

        <footer className="flex justify-end border-t bg-card/30 px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="h-10 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Close</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
