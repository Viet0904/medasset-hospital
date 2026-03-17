"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit, Trash2, Save, X, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function LocationsPage() {
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const load = () => fetch("/api/locations").then((r) => r.json()).then(setAllLocations).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const total = allLocations.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const locations = allLocations.slice((page - 1) * perPage, page * perPage);

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
    <div className="fade-in space-y-4">
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

      <div className="glass-card flex flex-col" style={{ height: showForm ? "calc(100vh - 480px)" : "calc(100vh - 220px)", minHeight: "300px" }}>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>
          ) : (
            <table>
              <thead className="sticky top-0 z-10 bg-[var(--color-bg-card)]">
                <tr><th>Tên vị trí</th><th>Mô tả</th><th>Địa chỉ</th><th>Số thiết bị</th><th className="text-right">Thao tác</th></tr>
              </thead>
              <tbody>
                {locations.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium"><span className="flex items-center gap-2"><MapPin size={14} className="text-emerald-400" /> {l.name}</span></td>
                    <td className="text-sm text-[var(--color-text-muted)]">{l.description || "—"}</td>
                    <td className="text-sm text-[var(--color-text-muted)]">{l.address || "—"}</td>
                    <td><span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">{l._count?.assets || 0} thiết bị</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(l)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(l.id, l.name)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span>Hiển thị</span>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="select-field w-auto py-1 px-2 text-xs">
              {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>/ trang · Tổng {total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Trang {page}/{totalPages}</span>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="btn-secondary py-1.5 px-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="btn-secondary py-1.5 px-2 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
