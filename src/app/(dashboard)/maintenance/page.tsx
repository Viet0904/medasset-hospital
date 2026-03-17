"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Wrench, Plus, Save, X } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function MaintenancePage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [form, setForm] = useState({ assetId: "", title: "", description: "", maintenanceType: "PREVENTIVE", cost: "", startDate: "", endDate: "", status: "IN_PROGRESS" });
  const [error, setError] = useState("");

  const load = () => fetch("/api/maintenance").then((r) => r.json()).then(setLogs).finally(() => setLoading(false));
  useEffect(() => { load(); fetch("/api/assets?limit=100").then((r) => r.json()).then((d) => setAssets(d.assets || [])); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, performedById: (session?.user as any)?.id }),
    });
    if (res.ok) { load(); setShowForm(false); setForm({ assetId: "", title: "", description: "", maintenanceType: "PREVENTIVE", cost: "", startDate: "", endDate: "", status: "IN_PROGRESS" }); }
    else { const d = await res.json(); setError(d.error); }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wrench size={24} className="text-amber-400" /> Quản lý Bảo trì</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> Tạo phiếu bảo trì</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
          <h3 className="text-lg font-semibold mb-4">Tạo phiếu bảo trì</h3>
          {error && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Thiết bị *</label><select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} className="select-field" required><option value="">-- Chọn --</option>{assets.map((a: any) => <option key={a.id} value={a.id}>{a.assetTag} - {a.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tiêu đề *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Loại bảo trì</label><select value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })} className="select-field"><option value="PREVENTIVE">Phòng ngừa</option><option value="CORRECTIVE">Sửa chữa</option><option value="INSPECTION">Kiểm tra</option></select></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Chi phí (VNĐ)</label><input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ngày bắt đầu</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Trạng thái</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field"><option value="IN_PROGRESS">Đang thực hiện</option><option value="COMPLETED">Hoàn thành</option></select></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Mô tả</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px] resize-y" /></div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary"><X size={16} /> Hủy</button>
            <button type="submit" className="btn-primary"><Save size={16} /> Lưu</button>
          </div>
        </form>
      )}

      <div className="glass-card table-container">
        {loading ? <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div> : logs.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]"><Wrench size={40} className="mx-auto mb-3 opacity-50" /><p>Chưa có phiếu bảo trì</p></div>
        ) : (
          <table>
            <thead><tr><th>Thiết bị</th><th>Tiêu đề</th><th>Loại</th><th>Người thực hiện</th><th>Ngày</th><th>Chi phí</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td><code className="text-sky-400 text-xs bg-sky-500/10 px-1.5 py-0.5 rounded">{l.asset?.assetTag}</code></td>
                  <td className="font-medium">{l.title}</td>
                  <td className="text-sm">{{ PREVENTIVE: "Phòng ngừa", CORRECTIVE: "Sửa chữa", INSPECTION: "Kiểm tra" }[l.maintenanceType as string] || l.maintenanceType}</td>
                  <td className="text-sm">{l.performedBy?.name}</td>
                  <td className="text-sm">{formatDate(l.startDate)}</td>
                  <td className="text-sm">{l.cost ? formatCurrency(l.cost) : "—"}</td>
                  <td><span className={cn("status-badge", l.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>{l.status === "COMPLETED" ? "Hoàn thành" : "Đang thực hiện"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
