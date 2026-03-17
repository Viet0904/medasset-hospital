"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Edit, Wrench, UserCheck, UserX, Package,
  Calendar, MapPin, Factory, Tag, DollarSign, Clock, FileText,
  CheckCircle,
} from "lucide-react";
import { cn, getStatusInfo, formatCurrency, formatDate, formatDateTime, hasPermission } from "@/lib/utils";

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ userId: "", notes: "" });

  const userRole = (session?.user as any)?.role || "STAFF";
  const canEdit = hasPermission(userRole, "MANAGER");

  useEffect(() => {
    fetch(`/api/assets/${id}`).then((r) => r.json()).then(setAsset).finally(() => setLoading(false));
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, [id]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const res = await fetch(`/api/assets/${id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutForm),
    });
    if (res.ok) {
      const updated = await fetch(`/api/assets/${id}`).then((r) => r.json());
      setAsset(updated);
      setShowCheckout(false);
      setCheckoutForm({ userId: "", notes: "" });
    }
    setCheckoutLoading(false);
  };

  const handleCheckin = async () => {
    if (!confirm("Bạn có chắc muốn thu hồi thiết bị này?")) return;
    await fetch(`/api/assets/${id}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const updated = await fetch(`/api/assets/${id}`).then((r) => r.json());
    setAsset(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>;
  }

  if (!asset) return <div className="text-red-400">Không tìm thấy thiết bị</div>;

  const status = getStatusInfo(asset.status);

  return (
    <div className="fade-in space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/assets" className="btn-secondary p-2"><ArrowLeft size={18} /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.name}</h1>
              <span className={cn("status-badge", status.color)}>{status.label}</span>
            </div>
            <p className="text-[var(--color-text-muted)] mt-1">
              <code className="text-sky-400 text-xs font-mono bg-sky-500/10 px-2 py-0.5 rounded">{asset.assetTag}</code>
              {asset.serial && <span className="ml-2">S/N: {asset.serial}</span>}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {asset.status === "AVAILABLE" && (
              <button onClick={() => setShowCheckout(true)} className="btn-primary"><UserCheck size={16} /> Cấp phát</button>
            )}
            {asset.status === "IN_USE" && (
              <button onClick={handleCheckin} className="btn-secondary text-emerald-400 border-emerald-500/30"><UserX size={16} /> Thu hồi</button>
            )}
            <Link href={`/assets/${id}/edit`} className="btn-secondary"><Edit size={16} /> Sửa</Link>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="glass-card p-6 border-sky-500/30 fade-in">
          <h3 className="text-lg font-semibold mb-4">Cấp phát thiết bị</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Cấp cho *</label>
              <select value={checkoutForm.userId} onChange={(e) => setCheckoutForm({ ...checkoutForm, userId: e.target.value })} className="select-field">
                <option value="">-- Chọn người dùng --</option>
                {users.filter((u: any) => u.active).map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.department})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ghi chú</label>
              <input value={checkoutForm.notes} onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowCheckout(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleCheckout} disabled={!checkoutForm.userId || checkoutLoading} className="btn-primary">
              {checkoutLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={16} />}
              Xác nhận cấp phát
            </button>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Thông tin chung</h3>
          {[
            { icon: <Tag size={16} />, label: "Mã thiết bị", value: asset.assetTag },
            { icon: <Package size={16} />, label: "Danh mục", value: asset.category ? `${asset.category.icon || ""} ${asset.category.name}` : "—" },
            { icon: <MapPin size={16} />, label: "Vị trí", value: asset.location?.name || "—" },
            { icon: <Factory size={16} />, label: "Nhà sản xuất", value: asset.manufacturer?.name || "—" },
            { icon: <FileText size={16} />, label: "Nhà cung cấp", value: asset.supplier?.name || "—" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-[var(--color-text-muted)]">{item.icon}</span>
              <span className="text-[var(--color-text-secondary)] w-28">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Tài chính & Bảo hành</h3>
          {[
            { icon: <DollarSign size={16} />, label: "Giá mua", value: asset.purchaseCost ? formatCurrency(asset.purchaseCost) : "—" },
            { icon: <Calendar size={16} />, label: "Ngày mua", value: asset.purchaseDate ? formatDate(asset.purchaseDate) : "—" },
            { icon: <Clock size={16} />, label: "Hết bảo hành", value: asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-[var(--color-text-muted)]">{item.icon}</span>
              <span className="text-[var(--color-text-secondary)] w-28">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
          {asset.notes && (
            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] text-sm">
              <p className="text-[var(--color-text-muted)] mb-1">Ghi chú:</p>
              <p>{asset.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout History */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCheck size={18} className="text-sky-400" />
          Lịch sử cấp phát
        </h3>
        {asset.checkouts?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Người nhận</th>
                  <th>Ngày cấp phát</th>
                  <th>Ngày thu hồi</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {asset.checkouts.map((co: any) => (
                  <tr key={co.id}>
                    <td>{co.user?.name}</td>
                    <td>{formatDateTime(co.checkoutDate)}</td>
                    <td>{co.checkinDate ? formatDateTime(co.checkinDate) : <span className="text-amber-400">Đang sử dụng</span>}</td>
                    <td className="text-sm text-[var(--color-text-muted)]">{co.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm">Chưa có lịch sử cấp phát</p>
        )}
      </div>

      {/* Maintenance History */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench size={18} className="text-amber-400" />
          Lịch sử bảo trì
        </h3>
        {asset.maintenanceLogs?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Người thực hiện</th>
                  <th>Ngày bắt đầu</th>
                  <th>Chi phí</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {asset.maintenanceLogs.map((ml: any) => (
                  <tr key={ml.id}>
                    <td>{ml.title}</td>
                    <td className="text-sm">{ml.maintenanceType}</td>
                    <td>{ml.performedBy?.name}</td>
                    <td>{formatDate(ml.startDate)}</td>
                    <td>{ml.cost ? formatCurrency(ml.cost) : "—"}</td>
                    <td><span className={cn("status-badge", ml.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>{ml.status === "COMPLETED" ? "Hoàn thành" : "Đang thực hiện"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm">Chưa có lịch sử bảo trì</p>
        )}
      </div>
    </div>
  );
}
