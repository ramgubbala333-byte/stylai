import Link from "next/link";
import { Logo, AnimatedButton } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{background:"#0A0A0F"}}>
      <Logo size="md" />
      <p className="mt-10 mb-2 text-xs tracking-widest" style={{color:"#C9A96E",letterSpacing:"0.25em"}}>404</p>
      <h1 className="mb-3 text-3xl" style={{fontFamily:"DM Serif Display,serif",color:"#F5F2ED",letterSpacing:"-0.02em"}}>Page not found</h1>
      <p className="text-sm mb-8 text-center max-w-xs" style={{color:"rgba(245,242,237,0.4)"}}>The page you are looking for does not exist or has been moved.</p>
      <Link href="/"><AnimatedButton>Back to home</AnimatedButton></Link>
    </div>
  );
}