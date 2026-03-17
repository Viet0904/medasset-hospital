"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const actionLabels: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  CHECKOUT: "Cấp phát",
  CHECKIN: "Thu hồi",
};

const entityLabels: Record<string, string> = {
  ASSET: "Thiết bị",
  USER: "Người dùng",
  CATEGORY: "Danh mục",
  LOCATION: "Vị trí",
  MANUFACTURER: "Nhà sản xuất",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs").then((r) => r.json()).then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ClipboardList size={24} className="text-indigo-400" />
        Nhật ký Hoạt động
      </h1>

      <div className="glass-card">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-50" />
            <p>Chưa có nhật ký nào</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.user?.name}</span>
                    {" "}<span className="text-[var(--color-text-muted)]">{actionLabels[log.action] || log.action}</span>
                    {" "}<span className="text-sky-400">{entityLabels[log.entityType] || log.entityType}</span>
                  </p>
                  {log.details && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{log.details}</p>}
                </div>
                <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
