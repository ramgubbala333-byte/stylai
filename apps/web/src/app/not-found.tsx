import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0D0D0F", fontFamily: "DM Sans, sans-serif" }}>
      <div className="text-center">
        <Logo size="md" />
        <p className="mt-10 text-xs tracking-widest mb-4" style={{ color: "#C9A96E", letterSpacing: "0.2em" }}>404</p>
        <h1 className="mb-3" style={{ fontFamily: "DM Serif Display, serif", fontSize: "2rem", color: "#F5F2ED", letterSpacing: "-0.02em" }}>
          Page not found
        </h1>
        <p className="text-sm mb-8" style={{ color: "rgba(245,242,237,0.4)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ background: "linear-gradient(135deg, #C9A96E, #E0C898)", color: "#0D0D0F" }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
