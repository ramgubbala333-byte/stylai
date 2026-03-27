"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, User, Palette, RotateCcw, ChevronRight, LogOut } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { Button, Badge, Card, Skeleton } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";
import { analysisApi, extractApiError } from "@/lib/api/client";
import { StyleResult } from "@/lib/types";
import toast from "react-hot-toast";

function HistoryCard({
  result,
  onView,
}: {
  result: StyleResult;
  onView: () => void;
}) {
  const date = new Date(result.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const topColors = result.recommended_colors?.slice(0, 5) ?? [];

  return (
    <button
      onClick={onView}
      className="w-full text-left p-5 rounded-2xl transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p
              className="text-base font-medium truncate"
              style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
            >
              {result.color_season ?? "Analysis"}
            </p>
            <Badge variant="success">Complete</Badge>
          </div>
          <p className="text-xs mb-3" style={{ color: "rgba(245,242,237,0.35)" }}>
            {date}
          </p>

          {/* Color swatches preview */}
          {topColors.length > 0 && (
            <div className="flex gap-1.5">
              {topColors.map((c) => (
                <div
                  key={c.hex}
                  className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                  style={{
                    background: c.hex,
                    borderColor: "rgba(13,13,15,0.8)",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        <ChevronRight
          size={18}
          className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
          style={{ color: "rgba(245,242,237,0.2)" }}
        />
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [history, setHistory] = useState<StyleResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const h = await analysisApi.getHistory();
        setHistory(h);
      } catch (err) {
        toast.error(extractApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageShell>
      <div
        className="min-h-[calc(100vh-4rem)] pb-20"
        style={{ background: "#0D0D0F" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* ── Profile header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.05))",
                  border: "1px solid rgba(201,169,110,0.25)",
                }}
              >
                <User size={22} style={{ color: "#C9A96E" }} />
              </div>
              <div>
                <h1
                  className="text-lg"
                  style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
                >
                  {user?.full_name ?? "My Profile"}
                </h1>
                <p className="text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
              style={{ color: "rgba(245,242,237,0.4)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#E05A5A")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "rgba(245,242,237,0.4)")
              }
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>

          {/* ── Stats ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: Palette,
                label: "Analyses",
                value: loading ? "—" : String(history.length),
              },
              {
                icon: Clock,
                label: "Member since",
                value: user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
              {
                icon: User,
                label: "Gender",
                value: user?.gender
                  ? user.gender.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
                  : "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Icon size={16} className="mx-auto mb-2" style={{ color: "#C9A96E" }} />
                <p
                  className="text-sm font-medium"
                  style={{ color: "#F5F2ED" }}
                >
                  {value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.35)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── New analysis CTA ─────────────────────────────────────────────── */}
          <div
            className="p-6 rounded-2xl flex items-center justify-between gap-4 mb-10"
            style={{
              background: "rgba(201,169,110,0.05)",
              border: "1px solid rgba(201,169,110,0.15)",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>
                Run a new analysis
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,242,237,0.4)" }}>
                Upload a new photo for updated recommendations
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/upload")}
              className="flex-shrink-0 group"
            >
              <RotateCcw size={13} />
              Re-analyze
            </Button>
          </div>

          {/* ── Analysis history ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} style={{ color: "rgba(245,242,237,0.35)" }} />
              <h2
                className="text-sm font-medium"
                style={{ color: "rgba(245,242,237,0.5)" }}
              >
                Analysis history
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div
                className="py-16 text-center rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.07)",
                }}
              >
                <Palette
                  size={28}
                  className="mx-auto mb-3"
                  style={{ color: "rgba(245,242,237,0.2)" }}
                />
                <p className="text-sm" style={{ color: "rgba(245,242,237,0.35)" }}>
                  No analyses yet
                </p>
                <p className="text-xs mt-1 mb-6" style={{ color: "rgba(245,242,237,0.2)" }}>
                  Upload a selfie to get started
                </p>
                <Button size="sm" onClick={() => router.push("/upload")}>
                  Upload selfie
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((result) => (
                  <HistoryCard
                    key={result.id}
                    result={result}
                    onView={() => router.push("/results")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
