"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Logo, Button, Input, GoldDivider } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email, password });
      toast.success("Welcome back");
      router.push("/upload");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0D0D0F", fontFamily: "DM Sans, sans-serif" }}
    >
      {/* ── Left panel — branding ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 50%, rgba(201,169,110,0.09) 0%, transparent 70%), #0D0D0F",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <Logo size="md" />

        <div className="relative z-10">
          <blockquote
            className="mb-8"
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "1.9rem",
              lineHeight: "1.3",
              letterSpacing: "-0.02em",
              color: "#F5F2ED",
            }}
          >
            "Style isn't about trends.
            <br />
            It's about knowing
            <br />
            what works{" "}
            <em style={{ color: "#C9A96E" }}>for you.</em>"
          </blockquote>
          <p className="text-sm" style={{ color: "rgba(245,242,237,0.35)" }}>
            — StylAI
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {["Color Analysis", "Face Shape", "Hairstyles", "Beard Guide", "Outfit Direction"].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "rgba(201,169,110,0.08)",
                border: "1px solid rgba(201,169,110,0.2)",
                color: "rgba(245,242,237,0.6)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h1
              className="mb-2"
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: "1.8rem",
                color: "#F5F2ED",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>
              Sign in to access your style profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 bottom-3 text-[#F5F2ED]/30 hover:text-[#F5F2ED]/60 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={isLoading}
                className="w-full group"
                size="lg"
              >
                Sign in
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </form>

          <GoldDivider />

          <p className="text-center text-sm" style={{ color: "rgba(245,242,237,0.35)" }}>
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium transition-colors"
              style={{ color: "#C9A96E" }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
