"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Palette, Scissors, Shirt, Scan, Sparkles, Shield, Zap, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Logo, AnimatedButton, GlassCard, StatusBadge, PageTransition } from "@/components/ui";

const fadeUp = (delay=0) => ({ initial:{opacity:0,y:24}, animate:{opacity:1,y:0}, transition:{duration:0.6,ease:[0.22,1,0.36,1],delay} });

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{background:"#0A0A0F"}}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{scale:[1,1.2,1],opacity:[0.15,0.25,0.15]}} transition={{duration:8,repeat:Infinity,ease:"easeInOut"}}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{background:"radial-gradient(circle,rgba(201,169,110,0.12) 0%,transparent 70%)",filter:"blur(40px)"}} />
          <motion.div animate={{scale:[1.1,1,1.1],opacity:[0.1,0.2,0.1]}} transition={{duration:10,repeat:Infinity,ease:"easeInOut",delay:2}}
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{background:"radial-gradient(circle,rgba(124,111,205,0.1) 0%,transparent 70%)",filter:"blur(50px)"}} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize:"72px 72px",
          maskImage:"radial-gradient(ellipse 70% 70% at 50% 40%,black,transparent)"
        }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-2 mb-8">
            <StatusBadge status="gold" label="AI-Powered Personal Styling" />
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="mb-6 leading-[1.05]"
            style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(3rem,8vw,5.5rem)",letterSpacing:"-0.03em",color:"#F5F2ED"}}>
            Your style, finally{" "}
            <em style={{fontStyle:"italic",background:"linear-gradient(135deg,#C9A96E 0%,#E0C898 50%,#9A7A48 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              understood.
            </em>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{color:"rgba(245,242,237,0.5)"}}>
            Upload a selfie. Our AI analyzes your face shape, skin tone, undertone, and hair — then delivers hyper-personalized color palettes, hairstyles, beard guidance, and outfit directions built for you.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register">
              <AnimatedButton size="lg" className="group">
                Discover your style
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
            <Link href="/auth/login">
              <AnimatedButton variant="secondary" size="lg">Sign in</AnimatedButton>
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div {...fadeUp(0.4)} className="flex items-center justify-center gap-6 flex-wrap">
            {["No subscription","Instant results","Privacy first"].map((t,i)=>(
              <div key={i} className="flex items-center gap-1.5 text-xs" style={{color:"rgba(245,242,237,0.3)"}}>
                <div className="w-1 h-1 rounded-full" style={{background:"#C9A96E"}} />{t}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{opacity:[0.3,0.7,0.3]}} transition={{duration:2,repeat:Infinity}}>
          <div className="w-px h-14" style={{background:"linear-gradient(to bottom,rgba(201,169,110,0.5),transparent)"}} />
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-28 px-5 max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3" style={{color:"#C9A96E",letterSpacing:"0.2em"}}>THE PROCESS</p>
          <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(2rem,4vw,3rem)",color:"#F5F2ED",letterSpacing:"-0.02em"}}>
            Three steps to your style profile
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {num:"01",title:"Upload a selfie",body:"A clear front-facing photo in natural light. That is all we need to begin.",emoji:"📸"},
            {num:"02",title:"AI reads your features",body:"We analyze face shape, skin tone, undertone, contrast, and hair — in seconds.",emoji:"🔬"},
            {num:"03",title:"Get your style profile",body:"Color season, hairstyle guide, beard style, outfit direction — all explained.",emoji:"✨"},
          ].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.12}}>
              <GlassCard hover glow="gold" className="p-7 relative h-full">
                <div className="text-3xl mb-5">{s.emoji}</div>
                <div className="absolute top-5 right-5 text-xs font-mono" style={{color:"rgba(201,169,110,0.4)"}}>{s.num}</div>
                <h3 className="text-base mb-2" style={{fontFamily:"DM Serif Display,serif",color:"#F5F2ED"}}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:"rgba(245,242,237,0.45)"}}>{s.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-5" style={{background:"radial-gradient(ellipse 80% 50% at 50% 50%,rgba(201,169,110,0.04) 0%,transparent 70%)"}}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
            <p className="text-xs tracking-widest mb-3" style={{color:"#C9A96E",letterSpacing:"0.2em"}}>WHAT YOU GET</p>
            <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(2rem,4vw,3rem)",color:"#F5F2ED",letterSpacing:"-0.02em"}}>Everything in one profile</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {icon:Palette,title:"Color Season",body:"Your exact seasonal archetype — colors that work and colors to avoid."},
              {icon:Scissors,title:"Hairstyle Guide",body:"Cuts that flatter your face shape. What to ask for at the barber or salon."},
              {icon:Scan,title:"Beard Guide",body:"Beard styles mapped to your face shape and actual growth pattern."},
              {icon:Shirt,title:"Outfit Direction",body:"Necklines, fits, fabrics that work for your proportions. Practical and specific."},
            ].map(({icon:Icon,title,body},i)=>(
              <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}>
                <GlassCard hover className="p-6 h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
                    <Icon size={18} style={{color:"#C9A96E"}} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{color:"#F5F2ED"}}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{color:"rgba(245,242,237,0.42)"}}>{body}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <section className="py-16 px-5 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {icon:Zap,title:"30-second analysis",body:"CV pipeline processes your image instantly"},
            {icon:Shield,title:"Private by design",body:"Your photo is never shared or sold"},
            {icon:Star,title:"25+ recommendations",body:"Colors, cuts, beard styles, and outfit direction"},
          ].map(({icon:Icon,title,body},i)=>(
            <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="flex items-start gap-4 p-5 rounded-2xl" style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.15)"}}>
                <Icon size={16} style={{color:"#C9A96E"}} />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{color:"#F5F2ED"}}>{title}</p>
                <p className="text-xs" style={{color:"rgba(245,242,237,0.4)"}}>{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-5">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="max-w-2xl mx-auto text-center p-14 rounded-3xl relative overflow-hidden"
          style={{background:"linear-gradient(135deg,rgba(201,169,110,0.08) 0%,rgba(124,111,205,0.04) 100%)",border:"1px solid rgba(201,169,110,0.15)"}}>
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,169,110,0.1),transparent)",borderRadius:"inherit"}} />
          <div className="relative z-10">
            <p className="text-xs tracking-widest mb-5" style={{color:"#C9A96E",letterSpacing:"0.2em"}}>START FOR FREE</p>
            <h2 className="mb-3" style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(1.8rem,4vw,2.8rem)",color:"#F5F2ED",letterSpacing:"-0.02em"}}>Ready to see what suits you?</h2>
            <p className="text-sm mb-9" style={{color:"rgba(245,242,237,0.45)"}}>One selfie. Two minutes. A complete style profile built around your actual features.</p>
            <Link href="/auth/register">
              <AnimatedButton size="lg" className="group">
                Create your style profile
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-5 text-center" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <Logo size="sm" />
        <p className="mt-4 text-xs" style={{color:"rgba(245,242,237,0.2)"}}>© {new Date().getFullYear()} StylAI. Built for people who care about dressing well.</p>
      </footer>
    </div>
  );
}