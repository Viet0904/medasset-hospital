"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search, Plus, Filter, Package, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, ArrowUpDown,
} from "lucide-react";
import { cn, getStatusInfo, formatCurrency, formatDate, hasPermission } from "@/lib/utils";

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serial: string | null;
  status: string;
  purchaseCost: number | null;
  category: { id: string; name: string; icon: string } | null;
  location: { id: string; name: string } | null;
  manufacturer: { id: string; name: string } | null;
}

export default function AssetsPage() {
  const { data: session } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const userRole = (session?.user as any)?.role || "STAFF";
  const canEdit = hasPermission(userRole, "MANAGER");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    params.set("page", String(page));

    fetch(`/api/assets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thiết bị "${name}"?`)) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    setAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={24} className="text-sky-400" />
            Quản lý Thiết bị
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Tổng cộng {total} thiết bị</p>
        </div>
        {canEdit && (
          <Link href="/assets/new" className="btn-primary">
            <Plus size={18} />
            Thêm thiết bị
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
              placeholder="Tìm theo tên, mã thiết bị, serial..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("btn-secondary", showFilters && "border-sky-500/50 text-sky-400")}
          >
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--color-border)] fade-in">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[160px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="IN_USE">Đang sử dụng</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="BROKEN">Hỏng</option>
              <option value="DISPOSED">Thanh lý</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="select-field w-auto min-w-[160px]"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card table-container">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <Package size={40} className="mx-auto mb-3 opacity-50" />
            <p>Không tìm thấy thiết bị nào</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên thiết bị</th>
                <th>Danh mục</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Giá mua</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const status = getStatusInfo(asset.status);
                return (
                  <tr key={asset.id}>
                    <td><code className="text-sky-400 text-xs font-mono bg-sky-500/10 px-2 py-1 rounded">{asset.assetTag}</code></td>
                    <td>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.serial && <p className="text-xs text-[var(--color-text-muted)]">S/N: {asset.serial}</p>}
                      </div>
                    </td>
                    <td>
                      {asset.category && (
                        <span className="text-sm">{asset.category.icon} {asset.category.name}</span>
                      )}
                    </td>
                    <td className="text-sm">{asset.location?.name || "—"}</td>
                    <td><span className={cn("status-badge", status.color)}>{status.label}</span></td>
                    <td className="text-sm">{asset.purchaseCost ? formatCurrency(asset.purchaseCost) : "—"}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/assets/${asset.id}`} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-sky-400 transition-colors" title="Xem chi tiết">
                          <Eye size={16} />
                        </Link>
                        {canEdit && (
                          <>
                            <Link href={`/assets/${asset.id}/edit`} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-amber-400 transition-colors" title="Sửa">
                              <Edit size={16} />
                            </Link>
                            <button onClick={() => handleDelete(asset.id, asset.name)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">Trang {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn-secondary disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="btn-secondary disabled:opacity-40"
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
