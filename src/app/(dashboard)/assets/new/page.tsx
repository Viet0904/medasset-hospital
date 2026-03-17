"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Package } from "lucide-react";
import Link from "next/link";

export default function NewAssetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [form, setForm] = useState({
    assetTag: "", name: "", serial: "", status: "AVAILABLE",
    categoryId: "", locationId: "", manufacturerId: "",
    purchaseDate: "", purchaseCost: "", warrantyExpiry: "", notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/manufacturers").then((r) => r.json()),
    ]).then(([c, l, m]) => {
      setCategories(c);
      setLocations(l);
      setManufacturers(m);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/assets");
    } else {
      const data = await res.json();
      setError(data.error || "Lỗi tạo thiết bị");
    }
    setLoading(false);
  };

  const updateForm = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="fade-in space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/assets" className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={24} className="text-sky-400" />
            Thêm thiết bị mới
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Mã thiết bị *</label>
            <input value={form.assetTag} onChange={(e) => updateForm("assetTag", e.target.value)} className="input-field" placeholder="VD: MRI-003" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tên thiết bị *</label>
            <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="input-field" placeholder="VD: Máy MRI Siemens 1.5T" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Số serial</label>
            <input value={form.serial} onChange={(e) => updateForm("serial", e.target.value)} className="input-field" placeholder="VD: SN-MRI-2025-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Trạng thái</label>
            <select value={form.status} onChange={(e) => updateForm("status", e.target.value)} className="select-field">
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="IN_USE">Đang sử dụng</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="BROKEN">Hỏng</option>
              <option value="DISPOSED">Thanh lý</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Danh mục</label>
            <select value={form.categoryId} onChange={(e) => updateForm("categoryId", e.target.value)} className="select-field">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Vị trí</label>
            <select value={form.locationId} onChange={(e) => updateForm("locationId", e.target.value)} className="select-field">
              <option value="">-- Chọn vị trí --</option>
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Nhà sản xuất</label>
            <select value={form.manufacturerId} onChange={(e) => updateForm("manufacturerId", e.target.value)} className="select-field">
              <option value="">-- Chọn nhà sản xuất --</option>
              {manufacturers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Giá mua (VNĐ)</label>
            <input type="number" value={form.purchaseCost} onChange={(e) => updateForm("purchaseCost", e.target.value)} className="input-field" placeholder="VD: 5000000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ngày mua</label>
            <input type="date" value={form.purchaseDate} onChange={(e) => updateForm("purchaseDate", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Hết bảo hành</label>
            <input type="date" value={form.warrantyExpiry} onChange={(e) => updateForm("warrantyExpiry", e.target.value)} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ghi chú</label>
          <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Ghi chú thêm..." />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Link href="/assets" className="btn-secondary">Hủy</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Lưu thiết bị
          </button>
        </div>
      </form>
    </div>
  );
}
