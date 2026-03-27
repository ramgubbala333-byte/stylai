"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Scissors,
  Shirt,
  Share2,
  RefreshCw,
  ChevronRight,
  Info,
  Check,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { Button, Badge, Card, Skeleton, cn } from "@/components/ui";
import { analysisApi, extractApiError } from "@/lib/api/client";
import { StyleResult, AppearanceProfile, ColorRecommendation, StyleRecommendation } from "@/lib/types";
import toast from "react-hot-toast";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(201,169,110,0.1)",
            border: "1px solid rgba(201,169,110,0.2)",
          }}
        >
          <Icon size={18} style={{ color: "#C9A96E" }} />
        </div>
        <div>
          <h2
            className="text-lg"
            style={{
              fontFamily: "DM Serif Display, serif",
              color: "#F5F2ED",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: "rgba(245,242,237,0.4)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Color swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({
  color,
  type,
}: {
  color: ColorRecommendation;
  type: "recommended" | "avoid";
}) {
  const [showReason, setShowReason] = useState(false);
  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => setShowReason(!showReason)}
    >
      <div
        className="w-full aspect-square rounded-2xl mb-2 transition-transform duration-200 group-hover:scale-105"
        style={{
          background: color.hex,
          boxShadow:
            type === "recommended"
              ? `0 4px 20px ${color.hex}40`
              : "0 2px 8px rgba(0,0,0,0.3)",
          opacity: type === "avoid" ? 0.7 : 1,
          position: "relative",
        }}
      >
        {type === "avoid" && (
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(13,13,15,0.35)" }}
          >
            <X size={20} style={{ color: "rgba(224,90,90,0.8)" }} />
          </div>
        )}
        {type === "recommended" && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </div>
        )}
      </div>
      <p
        className="text-xs font-medium truncate"
        style={{ color: "#F5F2ED" }}
      >
        {color.name}
      </p>
      <p
        className="text-xs font-mono"
        style={{ color: "rgba(245,242,237,0.35)" }}
      >
        {color.hex}
      </p>

      {/* Reason tooltip */}
      {showReason && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-xl z-20 text-xs leading-relaxed"
          style={{
            background: "#1A1A1F",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(245,242,237,0.7)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {color.reason}
        </div>
      )}
    </div>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────
function RecommendationCard({
  rec,
  type = "positive",
}: {
  rec: StyleRecommendation;
  type?: "positive" | "negative";
}) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        background:
          type === "positive"
            ? "rgba(255,255,255,0.03)"
            : "rgba(224,90,90,0.05)",
        border: `1px solid ${
          type === "positive"
            ? "rgba(255,255,255,0.07)"
            : "rgba(224,90,90,0.15)"
        }`,
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{
          background:
            type === "positive"
              ? "rgba(76,175,130,0.2)"
              : "rgba(224,90,90,0.15)",
          border: `1px solid ${
            type === "positive"
              ? "rgba(76,175,130,0.4)"
              : "rgba(224,90,90,0.3)"
          }`,
        }}
      >
        {type === "positive" ? (
          <Check size={10} style={{ color: "#4CAF82" }} />
        ) : (
          <X size={10} style={{ color: "#E05A5A" }} />
        )}
      </div>
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: type === "positive" ? "#F5F2ED" : "#E05A5A" }}
        >
          {rec.name}
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "rgba(245,242,237,0.45)" }}
        >
          {rec.reason}
        </p>
      </div>
    </div>
  );
}

// ─── Feature stat pill ────────────────────────────────────────────────────────
function FeaturePill({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  const formatted = value.replace(/_/g, " ");
  const titleCase = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return (
    <div
      className="flex flex-col items-center justify-center px-5 py-4 rounded-2xl flex-1 min-w-[100px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        className="text-xs mb-1.5 tracking-widest uppercase"
        style={{ color: "rgba(245,242,237,0.35)", letterSpacing: "0.1em" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-medium text-center"
        style={{ color: "#F5F2ED" }}
      >
        {titleCase}
      </p>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// ─── Main Results Page ────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<StyleResult | null>(null);
  const [profile, setProfile] = useState<AppearanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, p] = await Promise.all([
          analysisApi.getLatestResult(),
          analysisApi.getLatestProfile(),
        ]);
        setResult(r);
        setProfile(p);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShare = async () => {
    if (!result?.share_token) return;
    const shareUrl = `${window.location.origin}/share/${result.share_token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <ResultsSkeleton />
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(224,90,90,0.1)", border: "1px solid rgba(224,90,90,0.2)" }}
            >
              <X size={28} style={{ color: "#E05A5A" }} />
            </div>
            <h2
              className="text-xl mb-2"
              style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
            >
              No results yet
            </h2>
            <p className="text-sm mb-6" style={{ color: "rgba(245,242,237,0.4)" }}>
              {error ?? "Upload a selfie to get your personalized style profile."}
            </p>
            <Button onClick={() => router.push("/upload")} className="group">
              Upload a selfie
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const isMale = profile?.user_id && result.beard_recommendations && result.beard_recommendations.length > 0;

  return (
    <PageShell>
      <div
        className="min-h-[calc(100vh-4rem)] pb-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,169,110,0.04) 0%, transparent 60%), #0D0D0F",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* ── Profile header ─────────────────────────────────────────────── */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p
                  className="text-xs tracking-widest mb-2"
                  style={{ color: "#C9A96E", letterSpacing: "0.2em" }}
                >
                  YOUR STYLE PROFILE
                </p>
                <h1
                  style={{
                    fontFamily: "DM Serif Display, serif",
                    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                    color: "#F5F2ED",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.15,
                  }}
                >
                  {result.color_season ?? "Your Season"}
                </h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Share2 size={14} />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/upload")}
                >
                  <RefreshCw size={14} />
                  Re-analyze
                </Button>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              <FeaturePill label="Face shape" value={profile?.face_shape} />
              <FeaturePill label="Skin tone" value={profile?.skin_tone} />
              <FeaturePill label="Undertone" value={profile?.skin_undertone} />
              {profile?.hair_texture && (
                <FeaturePill label="Hair texture" value={profile.hair_texture} />
              )}
            </div>

            {/* Confidence note */}
            {profile?.face_shape_confidence && (
              <p
                className="text-xs mt-4"
                style={{ color: "rgba(245,242,237,0.25)" }}
              >
                Face shape detection confidence:{" "}
                {Math.round(profile.face_shape_confidence * 100)}%
              </p>
            )}
          </div>

          {/* ── Color Season ────────────────────────────────────────────────── */}
          <Section
            icon={Palette}
            title="Your color palette"
            subtitle={`${result.color_season} — tap any color to see why it works`}
          >
            {result.recommended_colors && result.recommended_colors.length > 0 && (
              <div className="mb-8">
                <p
                  className="text-xs font-medium mb-4 tracking-widest uppercase"
                  style={{ color: "rgba(245,242,237,0.35)", letterSpacing: "0.12em" }}
                >
                  Wear these
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {result.recommended_colors.map((c) => (
                    <ColorSwatch key={c.hex} color={c} type="recommended" />
                  ))}
                </div>
              </div>
            )}

            {result.colors_to_avoid && result.colors_to_avoid.length > 0 && (
              <div>
                <p
                  className="text-xs font-medium mb-4 tracking-widest uppercase"
                  style={{ color: "rgba(224,90,90,0.5)", letterSpacing: "0.12em" }}
                >
                  Avoid near your face
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {result.colors_to_avoid.map((c) => (
                    <ColorSwatch key={c.hex} color={c} type="avoid" />
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ── Hairstyles ──────────────────────────────────────────────────── */}
          <Section
            icon={Scissors}
            title="Hairstyle recommendations"
            subtitle={`Based on your ${profile?.face_shape ?? ""} face shape`}
          >
            <div className="space-y-3 mb-5">
              {result.hairstyle_recommendations?.map((r) => (
                <RecommendationCard key={r.name} rec={r} type="positive" />
              ))}
            </div>

            {result.hairstyles_to_avoid && result.hairstyles_to_avoid.length > 0 && (
              <>
                <p
                  className="text-xs font-medium mb-3 tracking-widest uppercase"
                  style={{ color: "rgba(224,90,90,0.5)", letterSpacing: "0.12em" }}
                >
                  Styles to avoid
                </p>
                <div className="space-y-3">
                  {result.hairstyles_to_avoid.map((r) => (
                    <RecommendationCard key={r.name} rec={r} type="negative" />
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* ── Beard (men only) ────────────────────────────────────────────── */}
          {result.beard_recommendations && result.beard_recommendations.length > 0 && (
            <Section
              icon={Scissors}
              title="Beard style guide"
              subtitle="Mapped to your face shape and growth pattern"
            >
              <div className="space-y-3">
                {result.beard_recommendations.map((r) => (
                  <RecommendationCard key={r.name} rec={r} type="positive" />
                ))}
              </div>
            </Section>
          )}

          {/* ── Outfit direction ────────────────────────────────────────────── */}
          <Section
            icon={Shirt}
            title="Outfit direction"
            subtitle="Necklines, fits, and fabrics that work for you"
          >
            <div className="space-y-3 mb-6">
              {result.outfit_directions?.map((r) => (
                <RecommendationCard key={r.name} rec={r} type="positive" />
              ))}
            </div>

            {/* Clothing details */}
            {result.clothing_details && (
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: "rgba(201,169,110,0.04)",
                  border: "1px solid rgba(201,169,110,0.12)",
                }}
              >
                {(result.clothing_details as any).recommended_necklines && (
                  <div className="mb-5">
                    <p
                      className="text-xs font-medium mb-3 tracking-widest uppercase"
                      style={{ color: "#C9A96E", letterSpacing: "0.12em" }}
                    >
                      Best necklines
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {((result.clothing_details as any).recommended_necklines as string[]).map(
                        (n: string) => (
                          <Badge key={n} variant="gold">
                            {n}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {(result.clothing_details as any).fit_principles && (
                  <div>
                    <p
                      className="text-xs font-medium mb-3 tracking-widest uppercase"
                      style={{ color: "rgba(245,242,237,0.3)", letterSpacing: "0.12em" }}
                    >
                      Fit principles
                    </p>
                    <ul className="space-y-2">
                      {((result.clothing_details as any).fit_principles as string[]).map(
                        (p: string) => (
                          <li
                            key={p}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: "rgba(245,242,237,0.5)" }}
                          >
                            <span
                              className="mt-1 w-1 h-1 rounded-full flex-shrink-0"
                              style={{ background: "#C9A96E" }}
                            />
                            {p}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* ── CTA bar ─────────────────────────────────────────────────────── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl mt-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>
                Want to share your results?
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.35)" }}>
                Copy a link anyone can view — no login required
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 size={14} />
                Copy share link
              </Button>
              <Button size="sm" onClick={() => router.push("/profile")}>
                View history
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
