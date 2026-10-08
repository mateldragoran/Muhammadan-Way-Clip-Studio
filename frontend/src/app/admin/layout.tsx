"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { Button } from "@/components/ui/Button";
import { Lock, LogOut, Video, Upload, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdminAuthenticated, login, logout } = useAdminStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Ensure component only renders on the client to safely access sessionStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "pharmasutical1") {
      login();
      setError(null);
    } else {
      setError("Invalid admin credentials.");
    }
  };

  // =========================================
  // GATEKEEPER: LOGIN SCREEN
  // =========================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory p-4">
        <div className="w-full max-w-sm bg-white rounded-large shadow-level-2 p-8 border border-sand">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-12 h-12 bg-charcoal text-soft-gold rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">Admin Portal</h1>
            <p className="text-xs text-charcoal/60 mt-1">Authorized access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal/80 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal/80 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-colors"
              />
            </div>

            {error && (
              <div className="p-2 bg-error-red/10 text-error-red text-xs rounded-standard text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2">
              <Lock className="w-4 h-4 mr-2" />
              Secure Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================
  // ADMIN DASHBOARD SHELL
  // =========================================
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-charcoal text-ivory h-16 flex items-center justify-between px-6 shadow-level-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-soft-gold" />
          <span className="font-heading text-xl font-semibold tracking-wide">
            Admin Workspace
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-soft-gold",
                pathname === "/admin" ? "text-soft-gold" : "text-ivory/70"
              )}
            >
              <Video className="w-4 h-4" />
              Manage Videos
            </Link>
            <Link
              href="/admin/upload"
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-soft-gold",
                pathname === "/admin/upload" ? "text-soft-gold" : "text-ivory/70"
              )}
            >
              <Upload className="w-4 h-4" />
              Upload New
            </Link>
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-error-red hover:text-error-red/80 font-medium ml-4 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

    </div>
  );
}