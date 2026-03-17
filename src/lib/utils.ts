import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const statusMap: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Sẵn sàng", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  IN_USE: { label: "Đang sử dụng", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  MAINTENANCE: { label: "Bảo trì", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  BROKEN: { label: "Hỏng", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  DISPOSED: { label: "Thanh lý", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export const roleMap: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Quản trị viên", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  MANAGER: { label: "Quản lý", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  STAFF: { label: "Nhân viên", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export function getStatusInfo(status: string) {
  return statusMap[status] || { label: status, color: "bg-gray-500/20 text-gray-400" };
}

export function getRoleInfo(role: string) {
  return roleMap[role] || { label: role, color: "bg-gray-500/20 text-gray-400" };
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const hierarchy = { ADMIN: 3, MANAGER: 2, STAFF: 1 };
  return (hierarchy[userRole as keyof typeof hierarchy] || 0) >= (hierarchy[requiredRole as keyof typeof hierarchy] || 0);
}
