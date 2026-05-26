"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, User, Palette, RotateCcw, ChevronRight, LogOut } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { AnimatedButton, GlassCard, LoadingSkeleton, EmptyState, StatusBadge, PageTransition } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";
import { analysisApi, extractApiError } from "@/lib/api/client";
import { StyleResult } from "@/lib/types";
import toast from "react-hot-toast";

function HistoryCard({ result, onView }: { result: StyleResult; onView: () => void }) {
  const date = new Date(result.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const colors = result.recommended_colors?.slice(0, 5) ?? [];
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} onClick={onView}
      className="w-full text-left p-5 rounded-2xl transition-all duration-200 group"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-base font-medium truncate" style={{ fontFamily: "DM Serif Display,serif", color: "#F5F2ED" }}>{result.color_season ?? "Analysis"}</p>
            <StatusBadge status="success" label="Complete" />
          </div>
          <p className="text-xs mb-3" style={{ color: "rgba(245,242,237,0.35)" }}>{date}</p>
          {colors.length > 0 && (
            <div className="flex gap-1.5">
              {colors.map(c => (
                <div key={c.hex} className="w-6 h-6 rounded-full border-2 flex-shrink-0" style={{ background: c.hex, borderColor: "rgba(10,10,15,0.8)" }} title={c.name} />
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={18} className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" style={{ color: "rgba(245,242,237,0.2)" }} />
      </div>
    </motion.button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [history, setHistory] = useState<StyleResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setHistory(await analysisApi.getHistory()); }
      catch (e) { toast.error(extractApiError(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] pb-20" style={{ background: "#0A0A0F" }}>
        <div className="max-w-2xl mx-auto px-5 py-12">
          <PageTransition>
            {/* Profile header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(201,169,110,0.2),rgba(201,169,110,0.05))", border: "1px solid rgba(201,169,110,0.25)" }}>
                  <User size={22} style={{ color: "#C9A96E" }} />
                </div>
                <div>
                  <h1 className="text-lg" style={{ fontFamily: "DM Serif Display,serif", color: "#F5F2ED" }}>{user?.full_name ?? "My Profile"}</h1>
                  <p className="text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>{user?.email}</p>
                </div>
              </div>
              <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all group" style={{ color: "rgba(245,242,237,0.4)" }}>
                <LogOut size={13} className="group-hover:text-[#E05A5A] transition-colors" />
                <span className="group-hover:text-[#E05A5A] transition-colors">Sign out</span>
              </button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: Palette, label: "Analyses", value: loading ? "—" : String(history.length) },
                { icon: Clock, label: "Member since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—" },
                { icon: User, label: "Gender", value: user?.gender ? user.gender.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()) : "—" },
              ].map(({ icon: Icon, label, value }) => (
                <GlassCard key={label} className="p-4 text-center">
                  <Icon size={15} className="mx-auto mb-2" style={{ color: "#C9A96E" }} />
                  <p className="text-sm font-semibold" style={{ color: "#F5F2ED" }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.35)" }}>{label}</p>
                </GlassCard>
              ))}
            </div>

            {/* New analysis CTA */}
            <div className="p-5 flex items-center justify-between gap-4 mb-10 rounded-2xl"
              style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.15)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>Run a new analysis</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.4)" }}>Upload a new photo for updated recommendations</p>
              </div>
              <AnimatedButton size="sm" onClick={() => router.push("/upload")} className="flex-shrink-0">
                <RotateCcw size={13} />Re-analyze
              </AnimatedButton>
            </div>

            {/* History */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Clock size={14} style={{ color: "rgba(245,242,237,0.35)" }} />
                <h2 className="text-sm font-medium" style={{ color: "rgba(245,242,237,0.5)" }}>Analysis history</h2>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-28 w-full" />)}
                </div>
              ) : history.length === 0 ? (
                <EmptyState
                  icon={<Palette size={24} style={{ color: "rgba(245,242,237,0.2)" }} />}
                  title="No analyses yet"
                  body="Upload a selfie to get your first style profile."
                  action={<AnimatedButton size="sm" onClick={() => router.push("/upload")}>Upload selfie</AnimatedButton>}
                />
              ) : (
                <div className="space-y-3">
                  {history.map(r => (
                    <HistoryCard key={r.id} result={r} onView={() => router.push(`/results?id=${r.id}`)} />
                  ))}
                </div>
              )}
            </div>
          </PageTransition>
        </div>
      </div>
    </PageShell>
  );
}
