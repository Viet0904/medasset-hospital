"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, User, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">MedAsset</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Hệ thống Quản lý Thiết bị Bệnh viện</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Đăng nhập</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm fade-in">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] text-center mb-3">Tài khoản demo</p>
            <div className="space-y-2 text-xs">
              {[
                { username: "admin", pass: "admin123", role: "Admin", desc: "Toàn quyền" },
                { username: "manager", pass: "manager123", role: "Manager", desc: "Quản lý" },
                { username: "staff", pass: "staff123", role: "Staff", desc: "Chỉ xem" },
              ].map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.pass);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-[var(--color-border)] transition-all text-[var(--color-text-secondary)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{acc.role}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">({acc.desc})</span>
                  </div>
                  <span className="text-[var(--color-text-muted)]">{acc.username}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
