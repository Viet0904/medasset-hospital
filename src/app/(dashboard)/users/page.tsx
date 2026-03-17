"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Edit, Trash2, Save, X, Shield, UserCheck, UserX, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getRoleInfo } from "@/lib/utils";

const PER_PAGE_OPTIONS = [10, 20, 50];

const defaultPerms = { canCreate: false, canEdit: false, canDelete: false, canExport: false };

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    username: "", name: "", email: "", password: "", role: "STAFF", department: "", phone: "",
    permissions: { ...defaultPerms },
  });
  const [error, setError] = useState("");

  const load = () => fetch("/api/users").then((r) => r.json()).then(setAllUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const total = allUsers.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const users = allUsers.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const method = editing ? "PUT" : "POST";
    const body = {
      ...form,
      permissions: JSON.stringify(form.permissions),
      password: form.password || undefined,
      email: form.email || undefined,
    };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { load(); setShowForm(false); setEditing(null); setForm({ username: "", name: "", email: "", password: "", role: "STAFF", department: "", phone: "", permissions: { ...defaultPerms } }); }
    else { const d = await res.json(); setError(d.error); }
  };

  const handleEdit = (u: any) => {
    let perms = { ...defaultPerms };
    try { perms = { ...defaultPerms, ...JSON.parse(u.permissions || "{}") }; } catch {}
    setEditing(u);
    setForm({ username: u.username, name: u.name, email: u.email || "", password: "", role: u.role, department: u.department || "", phone: u.phone || "", permissions: perms });
    setShowForm(true);
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Vô hiệu hóa tài khoản "${name}"?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  };

  const togglePerm = (key: string) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !(form.permissions as any)[key] } });
  };

  // Auto-set permissions when role changes
  const handleRoleChange = (role: string) => {
    if (role === "ADMIN") setForm({ ...form, role, permissions: { canCreate: true, canEdit: true, canDelete: true, canExport: true } });
    else if (role === "MANAGER") setForm({ ...form, role, permissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true } });
    else setForm({ ...form, role, permissions: { ...defaultPerms } });
  };

  const permLabels: Record<string, string> = {
    canCreate: "Thêm mới",
    canEdit: "Chỉnh sửa",
    canDelete: "Xóa",
    canExport: "Xuất báo cáo",
  };

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-purple-400" /> Quản lý Người dùng</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ username: "", name: "", email: "", password: "", role: "STAFF", department: "", phone: "", permissions: { ...defaultPerms } }); }} className="btn-primary"><Plus size={18} /> Thêm người dùng</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
          <h3 className="text-lg font-semibold mb-4">{editing ? "Sửa người dùng" : "Thêm người dùng mới"}</h3>
          {error && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tên đăng nhập *</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" required placeholder="VD: nguyenvana" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Họ tên *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Email (tùy chọn)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="Không bắt buộc" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{editing ? "Mật khẩu mới" : "Mật khẩu *"}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder={editing ? "Để trống = giữ nguyên" : ""} required={!editing} /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Vai trò</label><select value={form.role} onChange={(e) => handleRoleChange(e.target.value)} className="select-field"><option value="STAFF">Nhân viên</option><option value="MANAGER">Quản lý</option><option value="ADMIN">Quản trị viên</option></select></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Phòng ban</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" /></div>
          </div>

          {/* Permissions */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-[var(--color-border)]">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings size={14} className="text-sky-400" /> Quyền hạn chi tiết</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(permLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePerm(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all",
                    (form.permissions as any)[key]
                      ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                      : "bg-white/[0.02] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-white/20"
                  )}
                >
                  {(form.permissions as any)[key] ? "✅" : "⬜"} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary"><X size={16} /> Hủy</button>
            <button type="submit" className="btn-primary"><Save size={16} /> {editing ? "Cập nhật" : "Lưu"}</button>
          </div>
        </form>
      )}

      <div className="glass-card flex flex-col" style={{ height: showForm ? "calc(100vh - 560px)" : "calc(100vh - 220px)", minHeight: "300px" }}>
        <div className="flex-1 overflow-auto">
          {loading ? <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div> : (
            <table>
              <thead className="sticky top-0 z-10 bg-[var(--color-bg-card)]"><tr><th>Người dùng</th><th>Tên đăng nhập</th><th>Vai trò</th><th>Quyền</th><th>Phòng ban</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const role = getRoleInfo(u.role);
                  let perms: any = {};
                  try { perms = JSON.parse(u.permissions || "{}"); } catch {}
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{u.name.charAt(0)}</div>
                          <div>
                            <span className="font-medium">{u.name}</span>
                            {u.email && <p className="text-[10px] text-[var(--color-text-muted)]">{u.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td><code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">{u.username}</code></td>
                      <td><span className={cn("status-badge", role.color)}><Shield size={12} /> {role.label}</span></td>
                      <td>
                        <div className="flex gap-1">
                          {perms.canCreate && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Thêm</span>}
                          {perms.canEdit && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Sửa</span>}
                          {perms.canDelete && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Xóa</span>}
                          {perms.canExport && <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">Xuất</span>}
                          {!perms.canCreate && !perms.canEdit && !perms.canDelete && !perms.canExport && <span className="text-[10px] text-[var(--color-text-muted)]">Chỉ xem</span>}
                        </div>
                      </td>
                      <td className="text-sm">{u.department || "—"}</td>
                      <td>{u.active ? <span className="text-emerald-400 text-sm flex items-center gap-1"><UserCheck size={14} /> Hoạt động</span> : <span className="text-red-400 text-sm flex items-center gap-1"><UserX size={14} /> Đã khóa</span>}</td>
                      <td><div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(u)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400"><Edit size={16} /></button>
                        {u.active && <button onClick={() => handleDeactivate(u.id, u.name)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 size={16} /></button>}
                      </div></td>
                    </tr>
                  );
                })}
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
