"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Logo, Button, Badge } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,169,110,0.07) 0%, transparent 70%), #0D0D0F",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 60% 70% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mb-10">
          <Logo size="md" />
        </div>

        {/* Welcome badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="gold">
            <Sparkles size={11} className="mr-1.5" />
            Account created
          </Badge>
        </div>

        <h1
          className="mb-4"
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: "clamp(2rem, 5vw, 2.8rem)",
            color: "#F5F2ED",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
        >
          Welcome, {firstName}.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #C9A96E, #E0C898)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Let's build your style profile.
          </span>
        </h1>

        <p
          className="text-base mb-12 leading-relaxed"
          style={{ color: "rgba(245,242,237,0.45)" }}
        >
          Upload a clear, front-facing selfie and our AI will analyze your face shape,
          skin tone, and features to deliver fully personalized style recommendations.
        </p>

        {/* What happens next cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
          {[
            {
              icon: Zap,
              title: "30-second analysis",
              body: "Our CV pipeline processes your image instantly",
            },
            {
              icon: Sparkles,
              title: "25+ recommendations",
              body: "Colors, cuts, beard styles, and outfit direction",
            },
            {
              icon: Shield,
              title: "Private by design",
              body: "Your photo is never shared or sold",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "rgba(201,169,110,0.1)",
                  border: "1px solid rgba(201,169,110,0.15)",
                }}
              >
                <Icon size={15} style={{ color: "#C9A96E" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "#F5F2ED" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,237,0.4)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Photo tips */}
        <div
          className="p-5 rounded-2xl mb-10 text-left"
          style={{
            background: "rgba(201,169,110,0.05)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
        >
          <p
            className="text-xs font-medium mb-3 tracking-widest uppercase"
            style={{ color: "#C9A96E" }}
          >
            For best results
          </p>
          <ul className="space-y-2">
            {[
              "Face the camera directly — no angled shots",
              "Use natural daylight, not artificial yellow light",
              "Keep hair away from face if possible",
              "No heavy filters or face-altering effects",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "rgba(245,242,237,0.55)" }}
              >
                <span
                  className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
                  style={{ background: "rgba(201,169,110,0.2)", color: "#C9A96E" }}
                >
                  ✓
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <Button
          size="lg"
          className="group w-full sm:w-auto"
          onClick={() => router.push("/upload")}
        >
          Upload my selfie
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
}
