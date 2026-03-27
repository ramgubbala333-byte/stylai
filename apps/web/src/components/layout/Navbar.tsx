"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Clock, Upload, Menu, X } from "lucide-react";
import { Logo, Button, cn } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";

const navLinks = [
  { href: "/upload", label: "Analyze", icon: Upload },
  { href: "/results", label: "My Results", icon: User },
  { href: "/profile", label: "History", icon: Clock },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{ background: "rgba(13,13,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href={isAuthenticated ? "/upload" : "/"} className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150",
                      active ? "text-[#F5F2ED] bg-white/8" : "text-[#F5F2ED]/50 hover:text-[#F5F2ED] hover:bg-white/5")}>
                    <Icon size={14} />{label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-xs max-w-32 truncate" style={{ color: "rgba(245,242,237,0.3)" }}>{user?.email}</span>
                <button onClick={logout} className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{ color: "rgba(245,242,237,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#E05A5A")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,242,237,0.4)")}>
                  <LogOut size={13} />Sign out
                </button>
                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg"
                  style={{ color: "rgba(245,242,237,0.6)", background: "rgba(255,255,255,0.05)" }}>
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link href="/auth/register"><Button size="sm">Get started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isAuthenticated && mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <nav className="absolute top-16 left-0 right-0 p-4 space-y-1"
            style={{ background: "#0D0D0F", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ background: active ? "rgba(201,169,110,0.08)" : "transparent", color: active ? "#C9A96E" : "rgba(245,242,237,0.6)" }}>
                  <Icon size={16} />{label}
                </Link>
              );
            })}
            <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.06)" }} />
            <button onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full"
              style={{ color: "#E05A5A" }}>
              <LogOut size={16} />Sign out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0D0D0F" }}>
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
