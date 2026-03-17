"use client";

import { useEffect, useState } from "react";
import { Factory, Plus, Edit, Trash2, Save, X, Globe, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function ManufacturersPage() {
  const [allManufacturers, setAllManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", website: "", phone: "" });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const load = () => fetch("/api/manufacturers").then((r) => r.json()).then(setAllManufacturers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const total = allManufacturers.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const manufacturers = allManufacturers.slice((page - 1) * perPage, page * perPage);

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
    <div className="fade-in space-y-4">
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

      <div className="glass-card flex flex-col" style={{ height: showForm ? "calc(100vh - 480px)" : "calc(100vh - 220px)", minHeight: "300px" }}>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>
          ) : (
            <table>
              <thead className="sticky top-0 z-10 bg-[var(--color-bg-card)]">
                <tr><th>Tên NSX</th><th>Website</th><th>Điện thoại</th><th>Số thiết bị</th><th className="text-right">Thao tác</th></tr>
              </thead>
              <tbody>
                {manufacturers.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.name}</td>
                    <td>{m.website ? <a href={m.website} target="_blank" className="text-sm text-sky-400 hover:underline flex items-center gap-1"><Globe size={12} />{m.website}</a> : <span className="text-sm text-[var(--color-text-muted)]">—</span>}</td>
                    <td className="text-sm">{m.phone || "—"}</td>
                    <td><span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium">{m._count?.assets || 0} thiết bị</span></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(m)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 size={16} /></button>
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
