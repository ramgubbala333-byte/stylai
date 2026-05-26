"use client";
import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

function cn(...c: (string|undefined|false|null)[]) { return c.filter(Boolean).join(" "); }
export { cn };

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size="md" }: { size?:"sm"|"md"|"lg" }) {
  const s = { sm:"text-xl", md:"text-2xl", lg:"text-4xl" }[size];
  return (
    <span className={cn(s, "font-bold tracking-tight select-none")} style={{fontFamily:"DM Serif Display,serif"}}>
      <span style={{color:"#F5F2ED"}}>Styl</span>
      <span style={{background:"linear-gradient(135deg,#C9A96E,#E0C898)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>AI</span>
    </span>
  );
}

// ── AnimatedButton ────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"ghost"|"danger";
  size?: "sm"|"md"|"lg";
  loading?: boolean;
}
export const AnimatedButton = forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant="primary", size="md", loading, children, className, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 rounded-xl select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0F] cursor-pointer";
    const variants = {
      primary: "focus:ring-[#C9A96E] text-[#0A0A0F]",
      secondary: "border border-white/10 bg-white/5 text-[#F5F2ED] hover:bg-white/10 focus:ring-white/20",
      ghost: "text-[#F5F2ED]/55 hover:text-[#F5F2ED] hover:bg-white/5 focus:ring-white/15",
      danger: "bg-[#E05A5A]/10 border border-[#E05A5A]/30 text-[#E05A5A] hover:bg-[#E05A5A]/20 focus:ring-[#E05A5A]/30",
    };
    const sizes = { sm:"text-xs px-3.5 py-2", md:"text-sm px-5 py-2.5", lg:"text-sm px-7 py-3.5" };
    const primaryStyle = variant==="primary" ? { background:"linear-gradient(135deg,#C9A96E,#E0C898)", boxShadow:"0 4px 20px rgba(201,169,110,0.3)" } : {};
    return (
      <motion.button ref={ref} disabled={disabled||loading} className={cn(base,variants[variant],sizes[size],"disabled:opacity-40 disabled:cursor-not-allowed",className)}
        style={primaryStyle} whileHover={!disabled&&!loading ? {y:-1,scale:1.01} : {}} whileTap={!disabled&&!loading ? {scale:0.98} : {}} {...props as any}>
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

// ── GlassCard ─────────────────────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; hover?: boolean; glow?: "gold"|"violet"|"none"; onClick?: () => void; }
export function GlassCard({ children, className, hover=false, glow="none", onClick }: CardProps) {
  const glows = { gold:"hover:shadow-[0_0_30px_rgba(201,169,110,0.12)]", violet:"hover:shadow-[0_0_30px_rgba(124,111,205,0.12)]", none:"" };
  return (
    <motion.div onClick={onClick} whileHover={hover ? {y:-2,scale:1.005} : {}} transition={{duration:0.2}}
      className={cn("rounded-2xl border border-white/8 transition-all duration-300", hover&&"cursor-pointer", glow!=="none"&&glows[glow], className)}
      style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(16px)"}}>
      {children}
    </motion.div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?:string; error?:string; hint?:string; }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-xs font-medium tracking-widest uppercase" style={{color:"rgba(245,242,237,0.45)"}}>{label}</label>}
    <input ref={ref}
      className={cn("w-full px-4 py-3 rounded-xl text-sm transition-all duration-150 outline-none bg-white/5 text-[#F5F2ED] placeholder-white/25",
        error ? "border border-[#E05A5A]/50 focus:border-[#E05A5A]/70 focus:ring-2 focus:ring-[#E05A5A]/10"
               : "border border-white/10 focus:border-[#C9A96E]/50 focus:ring-2 focus:ring-[#C9A96E]/10 focus:bg-white/7",
        "disabled:opacity-40 disabled:cursor-not-allowed", className)} {...props} />
    {error && <p className="text-xs text-[#E05A5A]">{error}</p>}
    {hint && !error && <p className="text-xs" style={{color:"rgba(245,242,237,0.35)"}}>{hint}</p>}
  </div>
));
Input.displayName = "Input";

// ── LoadingSkeleton ───────────────────────────────────────────────────────────
export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl", className)} style={{background:"linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%)",backgroundSize:"600px 100%",animation:"shimmer 2s infinite"}} />;
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>{icon}</div>
      <h3 className="text-lg mb-2" style={{fontFamily:"DM Serif Display,serif",color:"#F5F2ED"}}>{title}</h3>
      <p className="text-sm max-w-xs mb-6" style={{color:"rgba(245,242,237,0.4)"}}>{body}</p>
      {action}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status, label }: { status:"success"|"pending"|"error"|"gold"|"default"; label: string }) {
  const styles = {
    success: { bg:"rgba(76,175,130,0.12)", border:"rgba(76,175,130,0.3)", color:"#4CAF82" },
    pending: { bg:"rgba(201,169,110,0.1)", border:"rgba(201,169,110,0.25)", color:"#C9A96E" },
    error:   { bg:"rgba(224,90,90,0.1)", border:"rgba(224,90,90,0.25)", color:"#E05A5A" },
    gold:    { bg:"rgba(201,169,110,0.12)", border:"rgba(201,169,110,0.3)", color:"#C9A96E" },
    default: { bg:"rgba(255,255,255,0.06)", border:"rgba(255,255,255,0.12)", color:"rgba(245,242,237,0.6)" },
  }[status];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{background:styles.bg,borderColor:styles.border,color:styles.color}}>{label}</span>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/8" />
      <div className="w-1.5 h-1.5 rounded-full" style={{background:"#C9A96E"}} />
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ── Page transition wrapper ───────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:"easeOut"}}>
      {children}
    </motion.div>
  );
}