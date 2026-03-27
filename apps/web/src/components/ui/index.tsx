"use client";

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

// ─── cn utility ──────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  return (
    <span
      className={cn(
        sizes[size],
        "font-display tracking-tight select-none"
      )}
      style={{ fontFamily: "DM Serif Display, serif" }}
    >
      <span style={{ color: "#F5F2ED" }}>Styl</span>
      <span
        style={{
          background: "linear-gradient(135deg, #C9A96E, #E0C898)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        AI
      </span>
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0D0F]";

    const variants = {
      primary: [
        "text-[#0D0D0F] focus:ring-[#C9A96E]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
      ].join(" "),
      secondary: [
        "text-[#F5F2ED] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 focus:ring-white/30",
      ].join(" "),
      ghost: [
        "text-[#F5F2ED]/60 hover:text-[#F5F2ED] hover:bg-white/5 focus:ring-white/20",
      ].join(" "),
    };

    const sizes = {
      sm: "text-sm px-4 py-2",
      md: "text-sm px-6 py-3",
      lg: "text-base px-8 py-4",
    };

    const primaryStyle =
      variant === "primary"
        ? {
            background: "linear-gradient(135deg, #C9A96E 0%, #E0C898 50%, #C9A96E 100%)",
            backgroundSize: "200% 100%",
          }
        : {};

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        style={primaryStyle}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-[#F5F2ED]/50 tracking-widest uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm transition-all duration-150 outline-none",
            "bg-white/5 border text-[#F5F2ED] placeholder-[#F5F2ED]/25",
            "focus:bg-white/8",
            error
              ? "border-[#E05A5A]/50 focus:border-[#E05A5A] focus:ring-2 focus:ring-[#E05A5A]/15"
              : "border-white/10 focus:border-[#C9A96E]/50 focus:ring-2 focus:ring-[#C9A96E]/12",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#E05A5A]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#F5F2ED]/35">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  elevated,
}: {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8",
        elevated ? "bg-white/6" : "bg-white/4",
        className
      )}
      style={{ backdropFilter: "blur(12px)" }}
    >
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg animate-pulse", className)}
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  );
}

// ─── GoldDivider ──────────────────────────────────────────────────────────────
export function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/8" />
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "#C9A96E" }}
      />
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success";
}) {
  const variants = {
    default: "bg-white/8 text-[#F5F2ED]/70 border-white/10",
    gold: "border-[#C9A96E]/30 text-[#C9A96E]",
    success: "bg-[#4CAF82]/10 text-[#4CAF82] border-[#4CAF82]/20",
  };
  const goldBg = variant === "gold" ? { background: "rgba(201,169,110,0.1)" } : {};

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border tracking-wide",
        variants[variant]
      )}
      style={goldBg}
    >
      {children}
    </span>
  );
}
