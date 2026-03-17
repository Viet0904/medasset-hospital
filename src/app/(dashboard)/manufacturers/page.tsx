"use client";

import { useEffect, useState } from "react";
import { Factory, Plus, Edit, Trash2, Save, X, Globe } from "lucide-react";

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", website: "", phone: "" });
  const [error, setError] = useState("");

  const load = () => fetch("/api/manufacturers").then((r) => r.json()).then(setManufacturers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/manufacturers/${editing.id}` : "/api/manufacturers";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { load(); setShowForm(false); setEditing(null); setForm({ name: "", website: "", phone: "" }); }
    else { const d = await res.json(); setError(d.error); }
  };

  const handleEdit = (m: any) => { setEditing(m); setForm({ name: m.name, website: m.website || "", phone: m.phone || "" }); setShowForm(true); };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa nhà sản xuất này?")) return;
    await fetch(`/api/manufacturers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Factory size={24} className="text-orange-400" /> Nhà sản xuất</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", website: "", phone: "" }); }} className="btn-primary"><Plus size={18} /> Thêm</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
          <h3 className="text-lg font-semibold mb-4">{editing ? "Sửa" : "Thêm nhà sản xuất"}</h3>
          {error && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tên *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Website</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Điện thoại</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary"><X size={16} /> Hủy</button>
            <button type="submit" className="btn-primary"><Save size={16} /> {editing ? "Cập nhật" : "Lưu"}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-8"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" /></div> :
          manufacturers.map((m) => (
            <div key={m.id} className="glass-card glass-card-hover p-5">
              <div className="flex items-start justify-between">
                <div><h3 className="font-semibold">{m.name}</h3>{m.website && <a href={m.website} target="_blank" className="text-xs text-sky-400 flex items-center gap-1 mt-1 hover:underline"><Globe size={12} />{m.website}</a>}{m.phone && <p className="text-xs text-[var(--color-text-muted)] mt-1">📞 {m.phone}</p>}</div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3"><span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium">{m._count?.assets || 0} thiết bị</span></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
