"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit, Trash2, Save, X } from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [error, setError] = useState("");

  const load = () => fetch("/api/locations").then((r) => r.json()).then(setLocations).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/locations/${editing.id}` : "/api/locations";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { load(); setShowForm(false); setEditing(null); setForm({ name: "", description: "", address: "" }); }
    else { const d = await res.json(); setError(d.error); }
  };

  const handleEdit = (l: any) => { setEditing(l); setForm({ name: l.name, description: l.description || "", address: l.address || "" }); setShowForm(true); };
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa vị trí "${name}"?`)) return;
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
    if (res.ok) load(); else { const d = await res.json(); alert(d.error); }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin size={24} className="text-emerald-400" /> Quản lý Vị trí</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", description: "", address: "" }); }} className="btn-primary"><Plus size={18} /> Thêm vị trí</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
          <h3 className="text-lg font-semibold mb-4">{editing ? "Sửa vị trí" : "Thêm vị trí mới"}</h3>
          {error && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tên *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Mô tả</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Địa chỉ</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary"><X size={16} /> Hủy</button>
            <button type="submit" className="btn-primary"><Save size={16} /> {editing ? "Cập nhật" : "Lưu"}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-8"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" /></div> :
          locations.map((l) => (
            <div key={l.id} className="glass-card glass-card-hover p-5">
              <div className="flex items-start justify-between">
                <div><h3 className="font-semibold flex items-center gap-2"><MapPin size={16} className="text-emerald-400" /> {l.name}</h3>{l.description && <p className="text-xs text-[var(--color-text-muted)] mt-1">{l.description}</p>}{l.address && <p className="text-xs text-[var(--color-text-muted)]">📍 {l.address}</p>}</div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(l)} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(l.id, l.name)} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3"><span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">{l._count?.assets || 0} thiết bị</span></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
