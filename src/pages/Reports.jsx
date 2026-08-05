import DashboardLayout from "../components/layout/DashboardLayout";
import { download } from "../lib/api";
import { useToast } from "../components/toast";

export default function Reports() {
  const toast = useToast();
  async function weeklyReport() { try { await download("/reports/weekly", "weekly-report.xlsx"); toast("Weekly report downloaded."); } catch (error) { toast(error.message, "error"); } }
  return <DashboardLayout title="Reports"><div className="space-y-5"><section className="rounded-xl border border-border bg-white p-5 shadow-card"><h2 className="text-lg font-semibold">Reports library</h2><p className="mt-1 text-sm text-muted-foreground">Generate exports for management and the trade desk.</p></section><section className="rounded-xl border border-border bg-white p-5 shadow-card"><h3 className="text-base font-semibold">Weekly CRM Report</h3><p className="mt-2 text-sm text-muted-foreground">An Excel summary of recent enquiries, pricing and pipeline status.</p><button onClick={weeklyReport} className="mt-4 h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Download Excel</button></section></div></DashboardLayout>;
}
