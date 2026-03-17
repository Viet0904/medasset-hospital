"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Package, CheckCircle, AlertTriangle, XCircle, Wrench,
  Users, FolderTree, MapPin, TrendingUp, Activity,
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusInfo } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];

interface DashboardData {
  stats: {
    totalAssets: number;
    availableAssets: number;
    inUseAssets: number;
    maintenanceAssets: number;
    brokenAssets: number;
    disposedAssets: number;
    totalCategories: number;
    totalLocations: number;
    totalUsers: number;
  };
  charts: {
    categoryChart: { name: string; value: number }[];
    locationChart: { name: string; value: number }[];
    statusChart: { name: string; value: number }[];
  };
  recentAuditLogs: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-red-400">Lỗi tải dữ liệu</div>;

  const statCards = [
    { label: "Tổng thiết bị", value: data.stats.totalAssets, icon: <Package size={24} />, color: "from-sky-500 to-blue-600", bgGlow: "sky" },
    { label: "Đang sử dụng", value: data.stats.inUseAssets, icon: <CheckCircle size={24} />, color: "from-emerald-500 to-green-600", bgGlow: "emerald" },
    { label: "Sẵn sàng", value: data.stats.availableAssets, icon: <TrendingUp size={24} />, color: "from-violet-500 to-purple-600", bgGlow: "violet" },
    { label: "Bảo trì", value: data.stats.maintenanceAssets, icon: <Wrench size={24} />, color: "from-amber-500 to-orange-600", bgGlow: "amber" },
    { label: "Hỏng", value: data.stats.brokenAssets, icon: <XCircle size={24} />, color: "from-red-500 to-rose-600", bgGlow: "red" },
    { label: "Người dùng", value: data.stats.totalUsers, icon: <Users size={24} />, color: "from-indigo-500 to-blue-600", bgGlow: "indigo" },
  ];

  const statusLabels: Record<string, string> = {
    AVAILABLE: "Sẵn sàng",
    IN_USE: "Đang sử dụng",
    MAINTENANCE: "Bảo trì",
    BROKEN: "Hỏng",
    DISPOSED: "Thanh lý",
  };

  const statusChartData = data.charts.statusChart.map((s) => ({
    ...s,
    name: statusLabels[s.name] || s.name,
  }));

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {session?.user?.name} 👋</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Tổng quan hệ thống quản lý thiết bị bệnh viện</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card glass-card-hover p-4 relative overflow-hidden slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-xl`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-sky-400" />
            Thiết bị theo trạng thái
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FolderTree size={18} className="text-violet-400" />
            Thiết bị theo danh mục
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.charts.categoryChart} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="name" stroke="#64748b" width={120} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {data.charts.categoryChart.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-400" />
            Thiết bị theo vị trí
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.charts.locationChart}>
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.charts.locationChart.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          Hoạt động gần đây
        </h3>
        {data.recentAuditLogs.length > 0 ? (
          <div className="space-y-3">
            {data.recentAuditLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                  <Activity size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium">{log.user?.name}</span> — {log.action} {log.entityType}</p>
                  {log.details && <p className="text-xs text-[var(--color-text-muted)] truncate">{log.details}</p>}
                </div>
                <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] text-sm">Chưa có hoạt động nào</p>
        )}
      </div>
    </div>
  );
}
