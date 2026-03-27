/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — refined, editorial, premium
        ink: {
          DEFAULT: "#0D0D0F",
          soft: "#1A1A1F",
          muted: "#2C2C35",
        },
        bone: {
          DEFAULT: "#F5F2ED",
          warm: "#EDE8DF",
          pure: "#FAFAF8",
        },
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E0C898",
          dark: "#9A7A48",
        },
        slate: {
          cool: "#8A8FA8",
          light: "#C2C5D4",
        },
        success: "#4CAF82",
        error: "#E05A5A",
        warning: "#E09A4A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "display-md": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.12)",
        "gold": "0 0 0 1px rgba(201, 169, 110, 0.3), 0 4px 24px rgba(201, 169, 110, 0.15)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "shimmer": "shimmer 1.8s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
