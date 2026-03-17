"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search, Plus, Filter, Package, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, Columns, Check,
} from "lucide-react";
import { cn, getStatusInfo, formatCurrency, formatDate, hasPermission } from "@/lib/utils";

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serial: string | null;
  status: string;
  purchaseDate: string | null;
  purchaseCost: number | null;
  warrantyExpiry: string | null;
  notes: string | null;
  category: { id: string; name: string; icon: string } | null;
  location: { id: string; name: string } | null;
  manufacturer: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
}

interface ColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "assetTag", label: "Mã", defaultVisible: true },
  { key: "name", label: "Tên thiết bị", defaultVisible: true },
  { key: "serial", label: "Số serial", defaultVisible: false },
  { key: "category", label: "Danh mục", defaultVisible: true },
  { key: "location", label: "Vị trí", defaultVisible: true },
  { key: "manufacturer", label: "Nhà sản xuất", defaultVisible: false },
  { key: "supplier", label: "Nhà cung cấp", defaultVisible: false },
  { key: "status", label: "Trạng thái", defaultVisible: true },
  { key: "purchaseCost", label: "Giá mua", defaultVisible: true },
  { key: "purchaseDate", label: "Ngày mua", defaultVisible: false },
  { key: "warrantyExpiry", label: "Hết bảo hành", defaultVisible: false },
  { key: "notes", label: "Ghi chú", defaultVisible: false },
];

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function AssetsPage() {
  const { data: session } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medasset_columns");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    const defaults: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => { defaults[c.key] = c.defaultVisible; });
    return defaults;
  });

  const userRole = (session?.user as any)?.role || "STAFF";
  const canEdit = hasPermission(userRole, "MANAGER");

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("medasset_columns", JSON.stringify(next));
      return next;
    });
  }, []);

  const showAllColumns = () => {
    const all: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => { all[c.key] = true; });
    setVisibleColumns(all);
    localStorage.setItem("medasset_columns", JSON.stringify(all));
  };

  const resetColumns = () => {
    const defaults: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => { defaults[c.key] = c.defaultVisible; });
    setVisibleColumns(defaults);
    localStorage.setItem("medasset_columns", JSON.stringify(defaults));
  };

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
    params.set("limit", String(perPage));

    fetch(`/api/assets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, page, perPage]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa thiết bị "${name}"?`)) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    setAssets(assets.filter((a) => a.id !== id));
  };

  const isCol = (key: string) => visibleColumns[key];
  const activeCount = ALL_COLUMNS.filter((c) => visibleColumns[c.key]).length;

  const renderCell = (asset: Asset, key: string) => {
    switch (key) {
      case "assetTag":
        return <code className="text-sky-400 text-xs font-mono bg-sky-500/10 px-2 py-1 rounded whitespace-nowrap">{asset.assetTag}</code>;
      case "name":
        return <span className="font-medium whitespace-nowrap">{asset.name}</span>;
      case "serial":
        return <span className="text-sm font-mono text-[var(--color-text-secondary)] whitespace-nowrap">{asset.serial || "—"}</span>;
      case "category":
        return asset.category ? <span className="text-sm whitespace-nowrap">{asset.category.icon} {asset.category.name}</span> : <span className="text-[var(--color-text-muted)]">—</span>;
      case "location":
        return <span className="text-sm whitespace-nowrap">{asset.location?.name || "—"}</span>;
      case "manufacturer":
        return <span className="text-sm whitespace-nowrap">{asset.manufacturer?.name || "—"}</span>;
      case "supplier":
        return <span className="text-sm whitespace-nowrap">{asset.supplier?.name || "—"}</span>;
      case "status":
        const status = getStatusInfo(asset.status);
        return <span className={cn("status-badge whitespace-nowrap", status.color)}>{status.label}</span>;
      case "purchaseCost":
        return <span className="text-sm whitespace-nowrap">{asset.purchaseCost ? formatCurrency(asset.purchaseCost) : "—"}</span>;
      case "purchaseDate":
        return <span className="text-sm whitespace-nowrap">{asset.purchaseDate ? formatDate(asset.purchaseDate) : "—"}</span>;
      case "warrantyExpiry":
        return <span className="text-sm whitespace-nowrap">{asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—"}</span>;
      case "notes":
        return <span className="text-sm text-[var(--color-text-muted)] max-w-[200px] truncate block">{asset.notes || "—"}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fade-in space-y-4">
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
            <Plus size={18} /> Thêm thiết bị
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 space-y-3 relative z-30">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10" placeholder="Tìm theo tên, mã thiết bị, serial..."
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={cn("btn-secondary", showFilters && "border-sky-500/50 text-sky-400")}>
            <Filter size={18} /> Bộ lọc
          </button>

          {/* Column Visibility */}
          <div className="relative">
            <button onClick={() => setShowColumns(!showColumns)} className={cn("btn-secondary", showColumns && "border-sky-500/50 text-sky-400")}>
              <Columns size={18} /> Cột ({activeCount}/{ALL_COLUMNS.length})
            </button>
            {showColumns && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setShowColumns(false)} />
                <div className="absolute right-0 top-full mt-2 z-[110] p-4 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl shadow-black/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Hiển thị cột</p>
                    <div className="flex gap-1">
                      <button onClick={showAllColumns} className="text-[10px] px-2 py-1 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">Tất cả</button>
                      <button onClick={resetColumns} className="text-[10px] px-2 py-1 rounded bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 transition-colors">Mặc định</button>
                    </div>
                  </div>
                  <div className="space-y-1 max-h-[320px] overflow-y-auto">
                    {ALL_COLUMNS.map((col) => (
                      <button key={col.key} onClick={() => toggleColumn(col.key)}
                        className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all text-left",
                          visibleColumns[col.key] ? "bg-sky-500/10 text-sky-400" : "text-[var(--color-text-muted)] hover:bg-white/5"
                        )}>
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
                          visibleColumns[col.key] ? "bg-sky-500 border-sky-500" : "border-[var(--color-border)]"
                        )}>
                          {visibleColumns[col.key] && <Check size={10} className="text-white" />}
                        </div>
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--color-border)] fade-in">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select-field w-auto min-w-[160px]">
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="IN_USE">Đang sử dụng</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="BROKEN">Hỏng</option>
              <option value="DISPOSED">Thanh lý</option>
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="select-field w-auto min-w-[160px]">
              <option value="">Tất cả danh mục</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table — fixed height with scroll */}
      <div className="glass-card flex flex-col" style={{ height: "calc(100vh - 330px)", minHeight: "400px" }}>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
              <div className="text-center"><Package size={40} className="mx-auto mb-3 opacity-50" /><p>Không tìm thấy thiết bị nào</p></div>
            </div>
          ) : (
            <table style={{ minWidth: `${activeCount * 140 + 120}px` }}>
              <thead className="sticky top-0 z-10 bg-[var(--color-bg-card)]">
                <tr>
                  {ALL_COLUMNS.filter((c) => isCol(c.key)).map((col) => (
                    <th key={col.key} className="whitespace-nowrap">{col.label}</th>
                  ))}
                  <th className="text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    {ALL_COLUMNS.filter((c) => isCol(c.key)).map((col) => (
                      <td key={col.key}>{renderCell(asset, col.key)}</td>
                    ))}
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/assets/${asset.id}`} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-sky-400 transition-colors" title="Xem">
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
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar — always at bottom */}
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
