"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Clock, Upload, Menu, X, Sparkles } from "lucide-react";
import { Logo, AnimatedButton, cn } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";

const navLinks = [
  { href:"/upload", label:"Analyze", icon:Upload },
  { href:"/results", label:"My Results", icon:Sparkles },
  { href:"/profile", label:"History", icon:Clock },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{background:"rgba(10,10,15,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          {/* Logo — always home */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({href,label,icon:Icon}) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
                      active ? "text-[#F5F2ED]" : "text-[#F5F2ED]/50 hover:text-[#F5F2ED]")}>
                    {active && <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-lg" style={{background:"rgba(255,255,255,0.07)"}} />}
                    <span className="relative z-10 flex items-center gap-2"><Icon size={14}/>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden lg:block text-xs max-w-[140px] truncate" style={{color:"rgba(245,242,237,0.3)"}}>{user?.email}</span>
                <button onClick={logout} className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all group" style={{color:"rgba(245,242,237,0.4)"}}>
                  <LogOut size={13} className="group-hover:text-[#E05A5A] transition-colors"/>
                  <span className="group-hover:text-[#E05A5A] transition-colors">Sign out</span>
                </button>
                <button onClick={()=>setOpen(!open)} className="md:hidden p-2 rounded-lg" style={{background:"rgba(255,255,255,0.06)",color:"rgba(245,242,237,0.7)"}}>
                  {open ? <X size={18}/> : <Menu size={18}/>}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><AnimatedButton variant="ghost" size="sm">Sign in</AnimatedButton></Link>
                <Link href="/auth/register"><AnimatedButton size="sm">Get started</AnimatedButton></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isAuthenticated && open && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)}>
            <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}} />
            <motion.nav className="absolute top-16 left-0 right-0 p-4 space-y-1"
              style={{background:"#0A0A0F",borderBottom:"1px solid rgba(255,255,255,0.08)"}}
              initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-20,opacity:0}}
              onClick={e=>e.stopPropagation()}>
              {navLinks.map(({href,label,icon:Icon})=>(
                <Link key={href} href={href} onClick={()=>setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{color:pathname.startsWith(href)?"#C9A96E":"rgba(245,242,237,0.6)",background:pathname.startsWith(href)?"rgba(201,169,110,0.08)":"transparent"}}>
                  <Icon size={16}/>{label}
                </Link>
              ))}
              <div className="h-px" style={{background:"rgba(255,255,255,0.06)"}} />
              <button onClick={()=>{logout();setOpen(false);}} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full" style={{color:"#E05A5A"}}>
                <LogOut size={16}/>Sign out
              </button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{background:"#0A0A0F"}}>
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}