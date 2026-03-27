"use client";

import { useEffect } from "react";
import { Logo } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0D0D0F", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ textAlign: "center", maxWidth: "24rem" }}>
            <Logo size="md" />
            <p style={{ marginTop: "2.5rem", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#C9A96E", textTransform: "uppercase", marginBottom: "1rem" }}>
              Something went wrong
            </p>
            <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#F5F2ED", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Unexpected error
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(245,242,237,0.4)", marginBottom: "2rem", lineHeight: "1.6" }}>
              Something went wrong on our end. Please try again.
            </p>
            <button onClick={reset}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: "500", background: "linear-gradient(135deg, #C9A96E, #E0C898)", color: "#0D0D0F", border: "none", cursor: "pointer" }}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
