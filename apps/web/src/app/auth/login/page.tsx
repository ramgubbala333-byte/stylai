"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Logo, AnimatedButton, Input, GoldDivider, PageTransition, GlassCard } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{email?:string;password?:string}>({});

  const validate = () => {
    const e: typeof errors = {};
    if(!email) e.email="Email is required";
    else if(!/\S+@\S+\.\S+/.test(email)) e.email="Enter a valid email";
    if(!password) e.password="Password is required";
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if(!validate()) return;
    try { await login({email,password}); toast.success("Welcome back"); router.push("/upload"); }
    catch(err:any) { toast.error(err?.response?.data?.detail??"Invalid credentials"); }
  };

  return (
    <div className="min-h-screen flex" style={{background:"#0A0A0F"}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{background:"radial-gradient(ellipse 80% 70% at 30% 50%,rgba(201,169,110,0.07) 0%,transparent 70%)",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        <Logo size="md" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles size={16} style={{color:"#C9A96E"}} />
            <span className="text-xs tracking-widest" style={{color:"rgba(245,242,237,0.4)",letterSpacing:"0.15em"}}>AI-POWERED STYLING</span>
          </div>
          <blockquote style={{fontFamily:"DM Serif Display,serif",fontSize:"2rem",lineHeight:"1.3",letterSpacing:"-0.02em",color:"#F5F2ED"}}>
            "Style is not about trends.<br/>It is about knowing what works{" "}
            <em style={{fontStyle:"italic",color:"#C9A96E"}}>for you.</em>"
          </blockquote>
          <p className="mt-4 text-sm" style={{color:"rgba(245,242,237,0.35)"}}>— StylAI</p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          {["Color Analysis","Face Shape","Hairstyles","Beard Guide","Outfit Direction"].map(f=>(
            <span key={f} className="px-3 py-1.5 rounded-full text-xs" style={{background:"rgba(201,169,110,0.08)",border:"1px solid rgba(201,169,110,0.18)",color:"rgba(245,242,237,0.55)"}}>{f}</span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <PageTransition>
        <div className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-10 text-center"><Logo size="md" /></div>
            <div className="mb-8">
              <h1 className="mb-1.5" style={{fontFamily:"DM Serif Display,serif",fontSize:"1.9rem",color:"#F5F2ED",letterSpacing:"-0.025em"}}>Welcome back</h1>
              <p className="text-sm" style={{color:"rgba(245,242,237,0.4)"}}>Sign in to access your style profile</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} autoComplete="email" autoFocus />
              <div className="relative">
                <Input label="Password" type={showPw?"text":"password"} placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} error={errors.password} autoComplete="current-password" />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 transition-colors" style={{bottom:errors.password?"calc(1.25rem + 1.5rem)":"0.85rem",color:"rgba(245,242,237,0.3)"}}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <div className="pt-1">
                <AnimatedButton type="submit" loading={isLoading} className="w-full group" size="lg">
                  Sign in <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
                </AnimatedButton>
              </div>
            </form>
            <GoldDivider />
            <p className="text-center text-sm" style={{color:"rgba(245,242,237,0.38)"}}>
              No account?{" "}<Link href="/auth/register" className="font-medium transition-colors" style={{color:"#C9A96E"}}>Create one free</Link>
            </p>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}