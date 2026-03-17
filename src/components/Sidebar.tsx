"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MapPin,
  Factory,
  Users,
  Wrench,
  FileBarChart,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Menu,
  ArrowLeftRight,
} from "lucide-react";
import { useState } from "react";
import { cn, hasPermission } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredRole: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: <LayoutDashboard size={20} />, requiredRole: "STAFF" },
  { href: "/assets", label: "Thiết bị", icon: <Package size={20} />, requiredRole: "STAFF" },
  { href: "/checkout", label: "Cấp phát / Thu hồi", icon: <ArrowLeftRight size={20} />, requiredRole: "MANAGER" },
  { href: "/categories", label: "Danh mục", icon: <FolderTree size={20} />, requiredRole: "MANAGER" },
  { href: "/locations", label: "Vị trí", icon: <MapPin size={20} />, requiredRole: "MANAGER" },
  { href: "/manufacturers", label: "Nhà sản xuất", icon: <Factory size={20} />, requiredRole: "MANAGER" },
  { href: "/maintenance", label: "Bảo trì", icon: <Wrench size={20} />, requiredRole: "MANAGER" },
  { href: "/reports", label: "Báo cáo", icon: <FileBarChart size={20} />, requiredRole: "MANAGER" },
  { href: "/users", label: "Người dùng", icon: <Users size={20} />, requiredRole: "ADMIN" },
  { href: "/audit-log", label: "Nhật ký", icon: <ClipboardList size={20} />, requiredRole: "ADMIN" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (session?.user as any)?.role || "STAFF";

  const filteredItems = navItems.filter((item) => hasPermission(userRole, item.requiredRole));

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Activity size={22} className="text-white" />
        </div>
        {!collapsed && (
          <div className="fade-in">
            <h1 className="text-lg font-bold gradient-text">MedAsset</h1>
            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide">QUẢN LÝ THIẾT BỊ</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-sky-500/15 text-sky-400 shadow-lg shadow-sky-500/5"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
            )}
          >
            <span className={cn(
              "flex-shrink-0 transition-colors",
              isActive(item.href) ? "text-sky-400" : ""
            )}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
            {isActive(item.href) && !collapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 glow-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* User Info - Fixed alignment */}
      <div className="border-t border-[var(--color-border)] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{session?.user?.name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate leading-tight">{userRole === "ADMIN" ? "Quản trị viên" : userRole === "MANAGER" ? "Quản lý" : "Nhân viên"}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center text-[var(--color-text-muted)] hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-sky-500/50 transition-all z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] flex flex-col z-40 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer div for layout */}
      <div className={cn(
        "hidden lg:block flex-shrink-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )} />
    </>
  );
}
