"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Palette, Scissors, Shirt, Share2, RefreshCw, ChevronRight, Check, X, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { Button, Skeleton } from "@/components/ui";
import { analysisApi, extractApiError } from "@/lib/api/client";
import { StyleResult, AppearanceProfile, ColorRecommendation, StyleRecommendation } from "@/lib/types";
import toast from "react-hot-toast";

function Section({ icon: Icon, title, subtitle, children }: { icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}>
          <Icon size={18} style={{ color: "#C9A96E" }} />
        </div>
        <div>
          <h2 className="text-lg" style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}>{title}</h2>
          {subtitle && <p className="text-sm mt-0.5" style={{ color: "rgba(245,242,237,0.4)" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ColorSwatch({ color, type }: { color: ColorRecommendation; type: "recommended" | "avoid" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative cursor-pointer" onClick={() => setShow(!show)}>
      <div className="w-full aspect-square rounded-2xl mb-2 transition-transform hover:scale-105 relative"
        style={{ background: color.hex, boxShadow: type === "recommended" ? `0 4px 20px ${color.hex}40` : undefined, opacity: type === "avoid" ? 0.7 : 1 }}>
        {type === "avoid" && <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: "rgba(13,13,15,0.35)" }}><X size={20} style={{ color: "rgba(224,90,90,0.8)" }} /></div>}
      </div>
      <p className="text-xs font-medium truncate" style={{ color: "#F5F2ED" }}>{color.name}</p>
      <p className="text-xs font-mono" style={{ color: "rgba(245,242,237,0.35)" }}>{color.hex}</p>
      {show && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-xl z-20 text-xs leading-relaxed" onClick={e => e.stopPropagation()}
          style={{ background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(245,242,237,0.7)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {color.reason}
        </div>
      )}
    </div>
  );
}

function RecCard({ rec, type = "positive" }: { rec: StyleRecommendation; type?: "positive" | "negative" }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl"
      style={{ background: type === "positive" ? "rgba(255,255,255,0.03)" : "rgba(224,90,90,0.05)", border: `1px solid ${type === "positive" ? "rgba(255,255,255,0.07)" : "rgba(224,90,90,0.15)"}` }}>
      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{ background: type === "positive" ? "rgba(76,175,130,0.2)" : "rgba(224,90,90,0.15)", border: `1px solid ${type === "positive" ? "rgba(76,175,130,0.4)" : "rgba(224,90,90,0.3)"}` }}>
        {type === "positive" ? <Check size={10} style={{ color: "#4CAF82" }} /> : <X size={10} style={{ color: "#E05A5A" }} />}
      </div>
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: type === "positive" ? "#F5F2ED" : "#E05A5A" }}>{rec.name}</p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,237,0.45)" }}>{rec.reason}</p>
      </div>
    </div>
  );
}

function FeaturePill({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center px-5 py-4 rounded-2xl flex-1 min-w-[100px]"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-xs mb-1.5 tracking-widest uppercase" style={{ color: "rgba(245,242,237,0.35)" }}>{label}</p>
      <p className="text-sm font-medium text-center capitalize" style={{ color: "#F5F2ED" }}>{value.replace(/_/g, " ")}</p>
    </div>
  );
}

function BeardPanel({ profileId, current }: { profileId: string; current?: string | null }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const options = [
    { value: "full", label: "Full coverage", emoji: "🧔" },
    { value: "patchy", label: "Patchy growth", emoji: "🪒" },
    { value: "chin_only", label: "Chin / goatee only", emoji: "😏" },
    { value: "none", label: "Clean shaven", emoji: "✨" },
  ];
  const save = async (val: string) => {
    setSaving(true);
    try {
      await analysisApi.updateBeard(profileId, { beard_coverage: val });
      setSelected(val); toast.success("Beard info updated");
    } catch { toast.error("Could not save"); }
    finally { setSaving(false); setOpen(false); }
  };
  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4">
        <div className="text-left">
          <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>Beard growth pattern</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.4)" }}>
            {selected ? options.find(o => o.value === selected)?.label : "Set your beard coverage for accurate recommendations"}
          </p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "rgba(245,242,237,0.3)" }} />
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {options.map(o => (
            <button key={o.value} disabled={saving} onClick={() => save(o.value)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-sm text-left transition-all"
              style={{ background: selected === o.value ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected === o.value ? "rgba(201,169,110,0.3)" : "rgba(255,255,255,0.06)"}`, color: selected === o.value ? "#C9A96E" : "rgba(245,242,237,0.6)" }}>
              <span>{o.emoji}</span><span>{o.label}</span>
              {selected === o.value && <Check size={12} className="ml-auto" style={{ color: "#C9A96E" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("id");
  const [result, setResult] = useState<StyleResult | null>(null);
  const [profile, setProfile] = useState<AppearanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = resultId ? await analysisApi.getResultById(resultId) : await analysisApi.getLatestResult();
        const p = await analysisApi.getLatestProfile();
        setResult(r); setProfile(p);
      } catch (e) { setError(extractApiError(e)); }
      finally { setLoading(false); }
    })();
  }, [resultId]);

  const share = async () => {
    if (!result?.share_token) return;
    const url = `${window.location.origin}/share/${result.share_token}`;
    try { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    catch { toast.error("Could not copy link"); }
  };

  if (loading) return <PageShell><div className="max-w-3xl mx-auto px-6 py-16 space-y-6">{[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}</div></PageShell>;

  if (!result || error) return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(224,90,90,0.1)", border: "1px solid rgba(224,90,90,0.2)" }}>
            <X size={28} style={{ color: "#E05A5A" }} />
          </div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}>No results yet</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(245,242,237,0.4)" }}>{error ?? "Upload a selfie to get your style profile."}</p>
          <Button onClick={() => router.push("/upload")} className="group">Upload a selfie <ChevronRight size={15} /></Button>
        </div>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] pb-20" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,169,110,0.04) 0%, transparent 60%), #0D0D0F" }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs tracking-widest mb-2" style={{ color: "#C9A96E", letterSpacing: "0.2em" }}>YOUR STYLE PROFILE</p>
                <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "#F5F2ED", letterSpacing: "-0.025em", lineHeight: 1.15 }}>{result.color_season ?? "Your Season"}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={share}><Share2 size={14} />Share</Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/upload")}><RefreshCw size={14} />Re-analyze</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <FeaturePill label="Face shape" value={profile?.face_shape} />
              <FeaturePill label="Skin tone" value={profile?.skin_tone} />
              <FeaturePill label="Undertone" value={profile?.skin_undertone} />
              {profile?.hair_texture && <FeaturePill label="Hair texture" value={profile.hair_texture} />}
            </div>
          </div>
          {/* Colors */}
          <Section icon={Palette} title="Your color palette" subtitle={`${result.color_season} — tap any swatch to see why`}>
            {result.recommended_colors && result.recommended_colors.length > 0 && <>
              <p className="text-xs font-medium mb-4 tracking-widest uppercase" style={{ color: "rgba(245,242,237,0.35)" }}>Wear these</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">{result.recommended_colors.map(c => <ColorSwatch key={c.hex} color={c} type="recommended" />)}</div>
            </>}
            {result.colors_to_avoid && result.colors_to_avoid.length > 0 && <>
              <p className="text-xs font-medium mb-4 tracking-widest uppercase" style={{ color: "rgba(224,90,90,0.5)" }}>Avoid near your face</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{result.colors_to_avoid.map(c => <ColorSwatch key={c.hex} color={c} type="avoid" />)}</div>
            </>}
          </Section>
          {/* Hairstyles */}
          <Section icon={Scissors} title="Hairstyle recommendations" subtitle={`Based on your ${profile?.face_shape ?? ""} face shape`}>
            <div className="space-y-3 mb-5">{result.hairstyle_recommendations?.map(r => <RecCard key={r.name} rec={r} />)}</div>
            {(result.hairstyles_to_avoid?.length ?? 0) > 0 && <>
              <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: "rgba(224,90,90,0.5)" }}>Styles to avoid</p>
              <div className="space-y-3">{result.hairstyles_to_avoid!.map(r => <RecCard key={r.name} rec={r} type="negative" />)}</div>
            </>}
          </Section>
          {/* Beard */}
          {(result.beard_recommendations?.length ?? 0) > 0 && (
            <Section icon={Scissors} title="Beard style guide" subtitle="Adjust your growth pattern for better recommendations">
              {profile && <BeardPanel profileId={profile.id} current={profile.beard_coverage} />}
              <div className="space-y-3">{result.beard_recommendations!.map(r => <RecCard key={r.name} rec={r} />)}</div>
            </Section>
          )}
          {/* Outfits */}
          <Section icon={Shirt} title="Outfit direction" subtitle="Necklines, fits, and fabrics that work for you">
            <div className="space-y-3 mb-6">{result.outfit_directions?.map(r => <RecCard key={r.name} rec={r} />)}</div>
            {result.clothing_details && (
              <div className="p-5 rounded-2xl" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.12)" }}>
                {(result.clothing_details as any).recommended_necklines && <>
                  <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: "#C9A96E" }}>Best necklines</p>
                  <div className="flex flex-wrap gap-2 mb-5">{((result.clothing_details as any).recommended_necklines as string[]).map((n: string) => (
                    <span key={n} className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)", color: "#C9A96E" }}>{n}</span>
                  ))}</div>
                </>}
                {(result.clothing_details as any).fit_principles && <>
                  <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: "rgba(245,242,237,0.3)" }}>Fit principles</p>
                  <ul className="space-y-2">{((result.clothing_details as any).fit_principles as string[]).map((p: string) => (
                    <li key={p} className="flex items-start gap-2 text-sm" style={{ color: "rgba(245,242,237,0.5)" }}><span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#C9A96E" }} />{p}</li>
                  ))}</ul>
                </>}
              </div>
            )}
          </Section>
          {/* CTA bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>Share your results</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.35)" }}>Anyone can view — no login required</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={share}><Share2 size={14} />Copy link</Button>
              <Button size="sm" onClick={() => router.push("/profile")}>View history</Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D0D0F" }} />}>
      <ResultsContent />
    </Suspense>
  );
}