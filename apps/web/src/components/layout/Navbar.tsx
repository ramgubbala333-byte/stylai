"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Clock, Upload } from "lucide-react";
import { Logo, Button, cn } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();

  const navLinks = [
    { href: "/upload", label: "Analyze", icon: Upload },
    { href: "/results", label: "My Results", icon: User },
    { href: "/profile", label: "History", icon: Clock },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: "rgba(13,13,15,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href={isAuthenticated ? "/upload" : "/"} className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </Link>

        {/* Nav links — authenticated only */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150",
                    active
                      ? "text-[#F5F2ED] bg-white/8"
                      : "text-[#F5F2ED]/50 hover:text-[#F5F2ED] hover:bg-white/5"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-xs text-[#F5F2ED]/35 max-w-32 truncate">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[#F5F2ED]/50 hover:text-[#F5F2ED] hover:bg-white/5 transition-all"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Auth guard wrapper ───────────────────────────────────────────────────────
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0D0D0F" }}>
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
