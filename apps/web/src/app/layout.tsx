import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/layout/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "StylAI — AI Personal Stylist",
  description: "AI-powered personal styling. Your color season, hairstyles, and outfit directions — built on your actual features.",
  openGraph: { title:"StylAI — AI Personal Stylist", description:"Personalized style powered by AI", type:"website", siteName:"StylAI" },
  twitter: { card:"summary_large_image", title:"StylAI — AI Personal Stylist", description:"Personalized style powered by AI" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-center" toastOptions={{
          duration: 4000,
          style: { background:"#1A1A24", color:"#F5F2ED", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", fontSize:"14px" },
          success: { iconTheme: { primary:"#C9A96E", secondary:"#0A0A0F" } },
          error: { iconTheme: { primary:"#E05A5A", secondary:"#0A0A0F" } },
        }} />
      </body>
    </html>
  );
}