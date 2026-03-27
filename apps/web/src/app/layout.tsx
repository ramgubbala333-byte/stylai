import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/layout/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "StylAI — Your AI Personal Stylist",
  description: "AI-powered personal styling. Discover your color season, ideal hairstyles, beard styles, and outfit directions — personalized to your actual features.",
  keywords: ["personal stylist", "AI styling", "color analysis", "hairstyle recommendations"],
  openGraph: {
    title: "StylAI — AI Personal Stylist",
    description: "Personalized style recommendations powered by AI",
    type: "website",
    siteName: "StylAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "StylAI — AI Personal Stylist",
    description: "Personalized style recommendations powered by AI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1A1A1F",
              color: "#F5F2ED",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
            },
            success: { iconTheme: { primary: "#C9A96E", secondary: "#0D0D0F" } },
            error: { iconTheme: { primary: "#E05A5A", secondary: "#0D0D0F" } },
          }}
        />
      </body>
    </html>
  );
}
