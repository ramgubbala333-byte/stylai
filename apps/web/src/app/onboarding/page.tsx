"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, CheckCircle2 } from "lucide-react";
import { Logo, AnimatedButton, GlassCard, StatusBadge, PageTransition } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden" style={{background:"#0A0A0F"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full" style={{background:"radial-gradient(ellipse,rgba(201,169,110,0.06) 0%,transparent 70%)",filter:"blur(40px)"}} />
      </div>

      <PageTransition>
        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="mb-8"><Logo size="md"/></div>
          <div className="flex justify-center mb-6"><StatusBadge status="success" label="Account created successfully" /></div>

          <motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.6}}
            className="mb-4" style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(2rem,5vw,2.8rem)",color:"#F5F2ED",letterSpacing:"-0.025em",lineHeight:1.15}}>
            Welcome, {firstName}.<br/>
            <span style={{background:"linear-gradient(135deg,#C9A96E,#E0C898)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Let&apos;s build your style profile.
            </span>
          </motion.h1>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="text-base mb-10 leading-relaxed" style={{color:"rgba(245,242,237,0.45)"}}>
            Upload a clear front-facing selfie and our AI will analyze your features to deliver fully personalized style recommendations.
          </motion.p>

          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              {icon:Zap,title:"30-second analysis",body:"CV pipeline processes your image instantly"},
              {icon:Sparkles,title:"25+ recommendations",body:"Colors, cuts, beard and outfit direction"},
              {icon:Shield,title:"Private by design",body:"Your photo is never shared or sold"},
            ].map(({icon:Icon,title,body})=>(
              <GlassCard key={title} className="p-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.15)"}}>
                  <Icon size={15} style={{color:"#C9A96E"}}/>
                </div>
                <p className="text-sm font-medium mb-1" style={{color:"#F5F2ED"}}>{title}</p>
                <p className="text-xs leading-relaxed" style={{color:"rgba(245,242,237,0.4)"}}>{body}</p>
              </GlassCard>
            ))}
          </motion.div>

          {/* Photo tips */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
            className="p-5 rounded-2xl mb-10 text-left" style={{background:"rgba(201,169,110,0.05)",border:"1px solid rgba(201,169,110,0.15)"}}>
            <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{color:"#C9A96E",letterSpacing:"0.15em"}}>For best results</p>
            <ul className="space-y-2">
              {["Face the camera directly — no angled shots","Natural daylight, not artificial yellow light","Keep hair away from face if possible","No heavy filters or face-altering effects"].map(tip=>(
                <li key={tip} className="flex items-start gap-2.5 text-sm" style={{color:"rgba(245,242,237,0.55)"}}>
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{color:"#C9A96E"}}/>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
            <AnimatedButton size="lg" className="group w-full sm:w-auto" onClick={()=>router.push("/upload")}>
              Upload my selfie <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </AnimatedButton>
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}