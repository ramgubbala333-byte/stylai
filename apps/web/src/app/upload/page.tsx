"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { Button, Card, cn } from "@/components/ui";
import { analysisApi, extractApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

type UploadPhase =
  | "idle"       // Waiting for file
  | "preview"    // File selected, ready to analyze
  | "uploading"  // Uploading to server
  | "analyzing"  // Server processing
  | "done";      // Complete

const ANALYSIS_STEPS = [
  { label: "Uploading image", duration: 1500 },
  { label: "Detecting face landmarks", duration: 2000 },
  { label: "Analyzing skin tone & undertone", duration: 2000 },
  { label: "Classifying face shape", duration: 1500 },
  { label: "Running style engine", duration: 1500 },
  { label: "Building your profile", duration: 1000 },
];

export default function UploadPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setError("Please upload a JPEG, PNG, or WebP image under 10MB.");
      return;
    }
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhase("preview");
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setPhase("idle");
    setError(null);
  };

  const simulateSteps = async () => {
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, ANALYSIS_STEPS[i].duration));
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setError(null);
    setPhase("uploading");

    try {
      // Run simulated step animation alongside real API call
      const [result] = await Promise.all([
        analysisApi.uploadSelfie(file, (pct) => {
          setUploadProgress(pct);
          if (pct === 100) setPhase("analyzing");
        }),
        simulateSteps(),
      ]);

      setPhase("done");
      toast.success("Analysis complete!");

      // Store result ID for results page
      if (result.result?.id) {
        sessionStorage.setItem("latest_result_id", result.result.id);
      }

      setTimeout(() => router.push("/results"), 600);
    } catch (err) {
      const msg = extractApiError(err);
      setError(msg);
      setPhase("preview");
      toast.error(msg);
    }
  };

  const isProcessing = phase === "uploading" || phase === "analyzing" || phase === "done";

  return (
    <PageShell>
      <div
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,169,110,0.05) 0%, transparent 70%), #0D0D0F",
        }}
      >
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <p
              className="text-xs tracking-widest mb-3"
              style={{ color: "#C9A96E", letterSpacing: "0.2em" }}
            >
              STEP 1 OF 1
            </p>
            <h1
              className="mb-3"
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: "2.2rem",
                color: "#F5F2ED",
                letterSpacing: "-0.025em",
              }}
            >
              Upload your selfie
            </h1>
            <p className="text-sm" style={{ color: "rgba(245,242,237,0.4)" }}>
              Front-facing, natural light, no filters
            </p>
          </div>

          {/* ── Analysis Loading State ─────────────────────────────────────── */}
          {isProcessing && (
            <Card className="p-8 text-center" elevated>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(201,169,110,0.1)",
                  border: "1px solid rgba(201,169,110,0.2)",
                }}
              >
                {phase === "done" ? (
                  <Sparkles size={28} style={{ color: "#C9A96E" }} />
                ) : (
                  <Loader2
                    size={28}
                    style={{ color: "#C9A96E" }}
                    className="animate-spin"
                  />
                )}
              </div>

              <h2
                className="text-lg mb-2"
                style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
              >
                {phase === "done" ? "Analysis complete!" : "Analyzing your features…"}
              </h2>

              <p className="text-sm mb-8" style={{ color: "rgba(245,242,237,0.4)" }}>
                {phase === "done"
                  ? "Taking you to your results"
                  : "This takes about 10–15 seconds"}
              </p>

              {/* Progress steps */}
              <div className="space-y-3 text-left">
                {ANALYSIS_STEPS.map((step, i) => {
                  const done = i < currentStep || phase === "done";
                  const active = i === currentStep && phase !== "done";
                  return (
                    <div
                      key={step.label}
                      className="flex items-center gap-3 transition-all duration-300"
                      style={{ opacity: done || active ? 1 : 0.3 }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: done
                            ? "rgba(76,175,130,0.2)"
                            : active
                            ? "rgba(201,169,110,0.15)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${
                            done
                              ? "rgba(76,175,130,0.4)"
                              : active
                              ? "rgba(201,169,110,0.4)"
                              : "rgba(255,255,255,0.08)"
                          }`,
                        }}
                      >
                        {done ? (
                          <span style={{ color: "#4CAF82", fontSize: 10 }}>✓</span>
                        ) : active ? (
                          <Loader2
                            size={10}
                            className="animate-spin"
                            style={{ color: "#C9A96E" }}
                          />
                        ) : null}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: done
                            ? "#4CAF82"
                            : active
                            ? "#F5F2ED"
                            : "rgba(245,242,237,0.4)",
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Upload progress bar */}
              {phase === "uploading" && uploadProgress < 100 && (
                <div className="mt-6">
                  <div
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                        background: "linear-gradient(90deg, #C9A96E, #E0C898)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-2"
                    style={{ color: "rgba(245,242,237,0.3)" }}
                  >
                    Uploading… {uploadProgress}%
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* ── File Preview ───────────────────────────────────────────────── */}
          {phase === "preview" && preview && (
            <Card className="overflow-hidden" elevated>
              <div className="relative">
                {/* Preview image */}
                <div className="aspect-[4/3] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Your selfie preview"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 60%, rgba(13,13,15,0.8))",
                    }}
                  />
                </div>

                {/* Clear button */}
                <button
                  onClick={clearFile}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(13,13,15,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(245,242,237,0.7)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <X size={15} />
                </button>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-medium" style={{ color: "#F5F2ED" }}>
                    {file?.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(245,242,237,0.4)" }}>
                    {file ? (file.size / 1024 / 1024).toFixed(2) : 0}MB
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {error && (
                  <div
                    className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(224,90,90,0.08)",
                      border: "1px solid rgba(224,90,90,0.2)",
                      color: "#E05A5A",
                    }}
                  >
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                <Button
                  onClick={handleAnalyze}
                  className="w-full group"
                  size="lg"
                >
                  <Sparkles size={15} />
                  Analyze my style
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearFile}
                  className="w-full text-sm"
                >
                  Choose a different photo
                </Button>
              </div>
            </Card>
          )}

          {/* ── Drop zone ──────────────────────────────────────────────────── */}
          {phase === "idle" && (
            <>
              <div
                {...getRootProps()}
                className={cn(
                  "relative rounded-2xl transition-all duration-200 cursor-pointer",
                  "flex flex-col items-center justify-center text-center p-16",
                  isDragActive ? "scale-[1.01]" : ""
                )}
                style={{
                  background: isDragActive
                    ? "rgba(201,169,110,0.06)"
                    : "rgba(255,255,255,0.03)",
                  border: `2px dashed ${
                    isDragActive
                      ? "rgba(201,169,110,0.5)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                <input {...getInputProps()} />

                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: isDragActive
                      ? "rgba(201,169,110,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      isDragActive
                        ? "rgba(201,169,110,0.3)"
                        : "rgba(255,255,255,0.08)"
                    }`,
                    transition: "all 0.2s",
                  }}
                >
                  {isDragActive ? (
                    <ImageIcon size={32} style={{ color: "#C9A96E" }} />
                  ) : (
                    <Upload size={32} style={{ color: "rgba(245,242,237,0.3)" }} />
                  )}
                </div>

                <p
                  className="text-base font-medium mb-2"
                  style={{ color: isDragActive ? "#C9A96E" : "#F5F2ED" }}
                >
                  {isDragActive ? "Drop it here" : "Drag & drop your selfie"}
                </p>
                <p className="text-sm mb-6" style={{ color: "rgba(245,242,237,0.35)" }}>
                  or click to browse files
                </p>

                <Button variant="secondary" size="md" type="button">
                  Choose photo
                </Button>

                <p className="mt-6 text-xs" style={{ color: "rgba(245,242,237,0.2)" }}>
                  JPEG · PNG · WebP · Max 10MB
                </p>
              </div>

              {/* Tips below dropzone */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { emoji: "💡", tip: "Natural light" },
                  { emoji: "👤", tip: "Face forward" },
                  { emoji: "🚫", tip: "No filters" },
                ].map(({ emoji, tip }) => (
                  <div
                    key={tip}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs" style={{ color: "rgba(245,242,237,0.4)" }}>
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
