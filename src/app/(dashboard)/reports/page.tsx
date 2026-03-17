"use client";

import { useEffect, useState } from "react";
import { FileBarChart, Download, Filter } from "lucide-react";
import { cn, formatCurrency, getStatusInfo, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then(setCategories); }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    params.set("limit", "100");
    fetch(`/api/assets?${params}`).then((r) => r.json()).then((d) => setAssets(d.assets || [])).finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  const handleExport = (format: string) => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    window.open(`/api/reports/export?${params}`, "_blank");
  };

  const totalCost = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileBarChart size={24} className="text-indigo-400" /> Báo cáo Thiết bị</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport("xlsx")} className="btn-primary"><Download size={16} /> Xuất Excel</button>
          <button onClick={() => handleExport("csv")} className="btn-secondary"><Download size={16} /> Xuất CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto min-w-[160px]">
          <option value="">Tất cả trạng thái</option>
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="IN_USE">Đang sử dụng</option>
          <option value="MAINTENANCE">Bảo trì</option>
          <option value="BROKEN">Hỏng</option>
          <option value="DISPOSED">Thanh lý</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field w-auto min-w-[160px]">
          <option value="">Tất cả danh mục</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-4 ml-auto text-sm">
          <span className="text-[var(--color-text-muted)]">Tổng: <strong className="text-[var(--color-text-primary)]">{assets.length}</strong> thiết bị</span>
          <span className="text-[var(--color-text-muted)]">Giá trị: <strong className="text-emerald-400">{formatCurrency(totalCost)}</strong></span>
        </div>
      </div>

      {/* Preview Table */}
      <div className="glass-card table-container">
        {loading ? <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div> : (
          <table>
            <thead><tr><th>Mã</th><th>Tên thiết bị</th><th>Danh mục</th><th>Vị trí</th><th>Trạng thái</th><th>Ngày mua</th><th>Giá mua</th></tr></thead>
            <tbody>
              {assets.map((a) => {
                const status = getStatusInfo(a.status);
                return (
                  <tr key={a.id}>
                    <td><code className="text-sky-400 text-xs bg-sky-500/10 px-1.5 py-0.5 rounded">{a.assetTag}</code></td>
                    <td className="font-medium">{a.name}</td>
                    <td className="text-sm">{a.category?.name || "—"}</td>
                    <td className="text-sm">{a.location?.name || "—"}</td>
                    <td><span className={cn("status-badge", status.color)}>{status.label}</span></td>
                    <td className="text-sm">{a.purchaseDate ? formatDate(a.purchaseDate) : "—"}</td>
                    <td className="text-sm">{a.purchaseCost ? formatCurrency(a.purchaseCost) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
