import { Palette, Scissors, Shirt } from "lucide-react";
import { Badge, Logo } from "@/components/ui";
import { StyleResult } from "@/lib/types";

// This is a server component — fetches data server-side for SEO + shareability
async function getSharedResult(token: string): Promise<StyleResult | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analysis/share/${token}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const result = await getSharedResult(params.token);

  if (!result) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#0D0D0F", fontFamily: "DM Sans, sans-serif" }}
      >
        <div className="text-center">
          <Logo size="md" />
          <p className="mt-8 text-lg" style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}>
            This style profile isn't available
          </p>
          <p className="mt-2 text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>
            The link may have expired or been removed.
          </p>
          <a
            href="/"
            className="inline-block mt-6 text-sm"
            style={{ color: "#C9A96E" }}
          >
            Create your own →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,169,110,0.05) 0%, transparent 60%), #0D0D0F",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(13,13,15,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Logo size="sm" />
        <a href="/auth/register">
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #C9A96E, #E0C898)",
              color: "#0D0D0F",
            }}
          >
            Get my style profile
          </button>
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 pb-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="gold">Shared Style Profile</Badge>
          <h1
            className="mt-5 mb-2"
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              color: "#F5F2ED",
              letterSpacing: "-0.025em",
            }}
          >
            {result.color_season}
          </h1>
          <p className="text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>
            Personalized color, hair, and style analysis — powered by StylAI
          </p>
        </div>

        {/* Color palette */}
        {result.recommended_colors && result.recommended_colors.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <Palette size={15} style={{ color: "#C9A96E" }} />
              </div>
              <h2
                className="text-base"
                style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
              >
                Signature color palette
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {result.recommended_colors.map((c) => (
                <div key={c.hex} className="text-center">
                  <div
                    className="w-full aspect-square rounded-2xl mb-2"
                    style={{
                      background: c.hex,
                      boxShadow: `0 4px 16px ${c.hex}40`,
                    }}
                  />
                  <p className="text-xs truncate" style={{ color: "#F5F2ED" }}>
                    {c.name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "rgba(245,242,237,0.3)" }}>
                    {c.hex}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hairstyles */}
        {result.hairstyle_recommendations && result.hairstyle_recommendations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <Scissors size={15} style={{ color: "#C9A96E" }} />
              </div>
              <h2
                className="text-base"
                style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
              >
                Hairstyle guide
              </h2>
            </div>
            <div className="space-y-3">
              {result.hairstyle_recommendations.slice(0, 3).map((r) => (
                <div
                  key={r.name}
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: "#F5F2ED" }}>
                    {r.name}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,237,0.45)" }}>
                    {r.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outfit directions */}
        {result.outfit_directions && result.outfit_directions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <Shirt size={15} style={{ color: "#C9A96E" }} />
              </div>
              <h2
                className="text-base"
                style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
              >
                Outfit direction
              </h2>
            </div>
            <div className="space-y-3">
              {result.outfit_directions.slice(0, 2).map((r) => (
                <div
                  key={r.name}
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: "#F5F2ED" }}>
                    {r.name}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,237,0.45)" }}>
                    {r.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className="text-center p-10 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,110,0.07) 0%, rgba(13,13,15,0) 100%)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
        >
          <h3
            className="mb-3"
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "1.6rem",
              color: "#F5F2ED",
              letterSpacing: "-0.02em",
            }}
          >
            Get your own style profile
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(245,242,237,0.4)" }}>
            Free, instant, and built around your actual features.
          </p>
          <a href="/auth/register">
            <button
              className="px-8 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, #C9A96E, #E0C898)",
                color: "#0D0D0F",
              }}
            >
              Create my free profile →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
