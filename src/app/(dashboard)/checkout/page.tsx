"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeftRight, UserCheck, UserX, Search, Package, CheckCircle } from "lucide-react";
import { cn, getStatusInfo, formatDate, formatDateTime } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"checkout" | "checkin" | "history">("checkout");
  const [checkoutForm, setCheckoutForm] = useState({ assetId: "", userId: "", notes: "" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = async () => {
    const [assetsRes, usersRes] = await Promise.all([
      fetch("/api/assets?limit=200").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setAssets(assetsRes.assets || []);
    setUsers(usersRes || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const availableAssets = assets.filter((a) => a.status === "AVAILABLE");
  const inUseAssets = assets.filter((a) => a.status === "IN_USE");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.assetId || !checkoutForm.userId) return;
    setSubmitLoading(true);
    setMsg({ type: "", text: "" });
    const res = await fetch(`/api/assets/${checkoutForm.assetId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: checkoutForm.userId, notes: checkoutForm.notes }),
    });
    if (res.ok) {
      setMsg({ type: "success", text: "✅ Cấp phát thiết bị thành công!" });
      setCheckoutForm({ assetId: "", userId: "", notes: "" });
      await load();
    } else {
      const data = await res.json();
      setMsg({ type: "error", text: data.error || "Lỗi cấp phát" });
    }
    setSubmitLoading(false);
  };

  const handleCheckin = async (assetId: string, assetName: string) => {
    if (!confirm(`Thu hồi thiết bị "${assetName}"?`)) return;
    const res = await fetch(`/api/assets/${assetId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setMsg({ type: "success", text: `✅ Đã thu hồi "${assetName}"` });
      await load();
    } else {
      setMsg({ type: "error", text: "Lỗi thu hồi" });
    }
  };

  const tabs = [
    { key: "checkout", label: "Cấp phát", icon: <UserCheck size={16} />, count: availableAssets.length },
    { key: "checkin", label: "Thu hồi", icon: <UserX size={16} />, count: inUseAssets.length },
  ];

  return (
    <div className="fade-in space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ArrowLeftRight size={24} className="text-sky-400" />
        Cấp phát & Thu hồi Thiết bị
      </h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); setMsg({ type: "", text: "" }); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === t.key
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                : "text-[var(--color-text-secondary)] hover:bg-white/5 border border-transparent"
            )}
          >
            {t.icon} {t.label}
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Message */}
      {msg.text && (
        <div className={cn(
          "p-3 rounded-xl text-sm fade-in",
          msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>
      ) : tab === "checkout" ? (
        /* === CHECKOUT TAB === */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleCheckout} className="glass-card p-6 lg:col-span-1 space-y-4 h-fit">
            <h3 className="font-semibold text-lg">Cấp phát mới</h3>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Thiết bị *</label>
              <select value={checkoutForm.assetId} onChange={(e) => setCheckoutForm({ ...checkoutForm, assetId: e.target.value })} className="select-field" required>
                <option value="">-- Chọn thiết bị sẵn sàng --</option>
                {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Cấp cho *</label>
              <select value={checkoutForm.userId} onChange={(e) => setCheckoutForm({ ...checkoutForm, userId: e.target.value })} className="select-field" required>
                <option value="">-- Chọn người nhận --</option>
                {users.filter((u: any) => u.active).map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.department || "N/A"})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ghi chú</label>
              <input value={checkoutForm.notes} onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })} className="input-field" placeholder="VD: Phòng khám số 5" />
            </div>
            <button type="submit" disabled={submitLoading} className="btn-primary w-full justify-center">
              {submitLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={16} />}
              Xác nhận cấp phát
            </button>
          </form>

          {/* Available assets list */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg mb-4">Thiết bị sẵn sàng ({availableAssets.length})</h3>
            {availableAssets.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm">Không có thiết bị nào sẵn sàng</p>
            ) : (
              <div className="space-y-2">
                {availableAssets.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <span className="text-lg">{a.category?.icon || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{a.assetTag} • {a.location?.name}</p>
                    </div>
                    <span className="status-badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Sẵn sàng</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* === CHECKIN TAB === */
        <div className="glass-card p-6">
          <h3 className="font-semibold text-lg mb-4">Thiết bị đang sử dụng ({inUseAssets.length})</h3>
          {inUseAssets.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm">Không có thiết bị nào đang được cấp phát</p>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Mã</th><th>Thiết bị</th><th>Danh mục</th><th>Vị trí</th><th className="text-right">Thao tác</th></tr></thead>
                <tbody>
                  {inUseAssets.map((a) => (
                    <tr key={a.id}>
                      <td><code className="text-sky-400 text-xs bg-sky-500/10 px-1.5 py-0.5 rounded">{a.assetTag}</code></td>
                      <td className="font-medium">{a.name}</td>
                      <td className="text-sm">{a.category?.icon} {a.category?.name}</td>
                      <td className="text-sm">{a.location?.name}</td>
                      <td className="text-right">
                        <button onClick={() => handleCheckin(a.id, a.name)} className="btn-secondary text-xs py-1.5 px-3 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                          <UserX size={14} /> Thu hồi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
