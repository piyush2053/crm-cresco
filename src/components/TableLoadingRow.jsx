import { LoaderCircle } from "lucide-react";

export default function TableLoadingRow({ colSpan, label = "Loading records…" }) {
  return <tr>
    <td colSpan={colSpan} className="p-10">
      <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderCircle className="h-8 w-8 animate-spin text-accent" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </td>
  </tr>;
}
