"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Palette, Scissors, Shirt, Share2, RefreshCw, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { AnimatedButton, GlassCard, LoadingSkeleton, EmptyState, StatusBadge, PageTransition } from "@/components/ui";
import { analysisApi, extractApiError } from "@/lib/api/client";
import { StyleResult, AppearanceProfile, ColorRecommendation, StyleRecommendation } from "@/lib/types";
import toast from "react-hot-toast";

function Section({icon:Icon,title,subtitle,children}:{icon:React.ElementType;title:string;subtitle?:string;children:React.ReactNode}) {
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}} className="mb-12">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
          <Icon size={18} style={{color:"#C9A96E"}}/>
        </div>
        <div>
          <h2 className="text-lg" style={{fontFamily:"DM Serif Display,serif",color:"#F5F2ED"}}>{title}</h2>
          {subtitle&&<p className="text-sm mt-0.5" style={{color:"rgba(245,242,237,0.4)"}}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function ColorSwatch({color,type}:{color:ColorRecommendation;type:"recommended"|"avoid"}) {
  const [show,setShow]=useState(false);
  return (
    <div className="relative cursor-pointer group" onClick={()=>setShow(!show)}>
      <motion.div whileHover={{scale:1.08,y:-2}} transition={{duration:0.2}}
        className="w-full aspect-square rounded-2xl mb-2 relative"
        style={{background:color.hex,boxShadow:type==="recommended"?`0 4px 20px ${color.hex}50`:"0 2px 8px rgba(0,0,0,0.4)",opacity:type==="avoid"?0.65:1}}>
        {type==="avoid"&&<div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{background:"rgba(10,10,15,0.4)"}}><X size={18} style={{color:"rgba(224,90,90,0.9)"}}/></div>}
      </motion.div>
      <p className="text-xs font-medium truncate" style={{color:"#F5F2ED"}}>{color.name}</p>
      <p className="text-xs font-mono" style={{color:"rgba(245,242,237,0.35)"}}>{color.hex}</p>
      {show&&(
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-xl z-30 text-xs leading-relaxed"
          style={{background:"#1A1A24",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,242,237,0.7)",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}
          onClick={e=>e.stopPropagation()}>
          {color.reason}
        </motion.div>
      )}
    </div>
  );
}

function RecCard({rec,type="positive"}:{rec:StyleRecommendation;type?:"positive"|"negative"}) {
  return (
    <motion.div initial={{opacity:0,x:-8}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      className="flex items-start gap-3 p-4 rounded-xl transition-all"
      style={{background:type==="positive"?"rgba(255,255,255,0.03)":"rgba(224,90,90,0.05)",border:`1px solid ${type==="positive"?"rgba(255,255,255,0.07)":"rgba(224,90,90,0.15)"}`}}>
      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{background:type==="positive"?"rgba(76,175,130,0.18)":"rgba(224,90,90,0.15)",border:`1px solid ${type==="positive"?"rgba(76,175,130,0.4)":"rgba(224,90,90,0.3)"}`}}>
        {type==="positive"?<Check size={10} style={{color:"#4CAF82"}}/>:<X size={10} style={{color:"#E05A5A"}}/>}
      </div>
      <div>
        <p className="text-sm font-medium mb-1" style={{color:type==="positive"?"#F5F2ED":"#E05A5A"}}>{rec.name}</p>
        <p className="text-xs leading-relaxed" style={{color:"rgba(245,242,237,0.45)"}}>{rec.reason}</p>
      </div>
    </motion.div>
  );
}

function FeaturePill({label,value}:{label:string;value?:string|null}) {
  if(!value) return null;
  return (
    <div className="flex flex-col items-center justify-center px-5 py-4 rounded-2xl flex-1 min-w-[100px]" style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.08)"}}>
      <p className="text-xs mb-1.5 tracking-widest uppercase" style={{color:"rgba(245,242,237,0.35)",letterSpacing:"0.1em"}}>{label}</p>
      <p className="text-sm font-medium text-center capitalize" style={{color:"#F5F2ED"}}>{value.replace(/_/g," ")}</p>
    </div>
  );
}

function BeardPanel({profileId,current}:{profileId:string;current?:string|null}) {
  const [open,setOpen]=useState(false); const [sel,setSel]=useState(current??""); const [saving,setSaving]=useState(false);
  const opts=[{value:"full",label:"Full coverage",emoji:"🧔"},{value:"patchy",label:"Patchy growth",emoji:"🪒"},{value:"chin_only",label:"Chin / goatee only",emoji:"😏"},{value:"none",label:"Clean shaven",emoji:"✨"}];
  const save=async(val:string)=>{setSaving(true);try{await analysisApi.updateBeard(profileId,{beard_coverage:val});setSel(val);toast.success("Beard info updated");}catch{toast.error("Could not save");}finally{setSaving(false);setOpen(false);}};
  return (
    <GlassCard className="mb-6 overflow-hidden">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <p className="text-sm font-medium" style={{color:"#F5F2ED"}}>Beard growth pattern</p>
          <p className="text-xs mt-0.5" style={{color:"rgba(245,242,237,0.4)"}}>{sel?opts.find(o=>o.value===sel)?.label:"Set for more accurate recommendations"}</p>
        </div>
        <motion.div animate={{rotate:open?180:0}} transition={{duration:0.2}}><ChevronDown size={16} style={{color:"rgba(245,242,237,0.3)"}}/></motion.div>
      </button>
      {open&&(
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="px-4 pb-4 grid grid-cols-2 gap-2">
          {opts.map(o=>(
            <motion.button key={o.value} whileTap={{scale:0.97}} disabled={saving} onClick={()=>save(o.value)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-sm text-left transition-all"
              style={{background:sel===o.value?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${sel===o.value?"rgba(201,169,110,0.3)":"rgba(255,255,255,0.06)"}`,color:sel===o.value?"#C9A96E":"rgba(245,242,237,0.6)"}}>
              <span>{o.emoji}</span><span className="flex-1">{o.label}</span>
              {sel===o.value&&<Check size={12} style={{color:"#C9A96E"}}/>}
            </motion.button>
          ))}
        </motion.div>
      )}
    </GlassCard>
  );
}

function ResultsSkeleton() {
 return <div className="space-y-6">{[140,200,260,200].map((h,i)=><div key={i} className="w-full rounded-xl skeleton" style={{height:`${h}px`,background:"rgba(255,255,255,0.06)"}}/>)}</div>;
}

function ResultsContent() {
  const router=useRouter(); const sp=useSearchParams(); const rid=sp.get("id");
  const [result,setResult]=useState<StyleResult|null>(null); const [profile,setProfile]=useState<AppearanceProfile|null>(null);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      try{const r=rid?await analysisApi.getResultById(rid):await analysisApi.getLatestResult();const p=await analysisApi.getLatestProfile();setResult(r);setProfile(p);}
      catch(e){setError(extractApiError(e));}finally{setLoading(false);}
    })();
  },[rid]);

  const share=async()=>{
    if(!result?.share_token) return;
    const url=`${window.location.origin}/share/${result.share_token}`;
    try{await navigator.clipboard.writeText(url);toast.success("Share link copied!");}catch{toast.error("Could not copy link");}
  };

  if(loading) return <PageShell><div className="max-w-3xl mx-auto px-5 py-16"><ResultsSkeleton/></div></PageShell>;

  if(!result||error) return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5">
        <EmptyState icon={<Palette size={24} style={{color:"rgba(245,242,237,0.3)"}}/>} title="No results yet" body={error??"Upload a selfie to get your personalized style profile."}
          action={<AnimatedButton onClick={()=>router.push("/upload")} className="group">Upload a selfie<ChevronRight size={15}/></AnimatedButton>}/>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] pb-20" style={{background:"radial-gradient(ellipse 70% 40% at 50% 0%,rgba(201,169,110,0.04) 0%,transparent 60%)"}}>
        <div className="max-w-3xl mx-auto px-5 py-12">
          <PageTransition>
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs tracking-widest mb-2" style={{color:"#C9A96E",letterSpacing:"0.2em"}}>YOUR STYLE PROFILE</p>
                  <h1 style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(1.8rem,4vw,2.5rem)",color:"#F5F2ED",letterSpacing:"-0.025em",lineHeight:1.15}}>
                    {result.color_season??"Your Season"}
                  </h1>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <AnimatedButton variant="secondary" size="sm" onClick={share}><Share2 size={14}/>Share</AnimatedButton>
                  <AnimatedButton variant="ghost" size="sm" onClick={()=>router.push("/upload")}><RefreshCw size={14}/>Re-analyze</AnimatedButton>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <FeaturePill label="Face shape" value={profile?.face_shape}/>
                <FeaturePill label="Skin tone" value={profile?.skin_tone}/>
                <FeaturePill label="Undertone" value={profile?.skin_undertone}/>
                {profile?.hair_texture&&<FeaturePill label="Hair texture" value={profile.hair_texture}/>}
              </div>
              {profile?.face_shape_confidence&&(
                <p className="text-xs mt-3" style={{color:"rgba(245,242,237,0.22)"}}>Face shape confidence: {Math.round(profile.face_shape_confidence*100)}%</p>
              )}
            </div>

            {/* Colors */}
            <Section icon={Palette} title="Your color palette" subtitle={`${result.color_season} — tap any swatch to see why`}>
              {result.recommended_colors&&result.recommended_colors.length>0&&(
                <div className="mb-8">
                  <p className="text-xs font-medium mb-4 tracking-widest uppercase" style={{color:"rgba(245,242,237,0.35)",letterSpacing:"0.12em"}}>Wear these</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{result.recommended_colors.map(c=><ColorSwatch key={c.hex} color={c} type="recommended"/>)}</div>
                </div>
              )}
              {result.colors_to_avoid&&result.colors_to_avoid.length>0&&(
                <div>
                  <p className="text-xs font-medium mb-4 tracking-widest uppercase" style={{color:"rgba(224,90,90,0.5)",letterSpacing:"0.12em"}}>Avoid near your face</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{result.colors_to_avoid.map(c=><ColorSwatch key={c.hex} color={c} type="avoid"/>)}</div>
                </div>
              )}
            </Section>

            {/* Hairstyles */}
            <Section icon={Scissors} title="Hairstyle recommendations" subtitle={`Based on your ${profile?.face_shape??""} face shape`}>
              <div className="space-y-3 mb-5">{result.hairstyle_recommendations?.map(r=><RecCard key={r.name} rec={r}/>)}</div>
              {(result.hairstyles_to_avoid?.length??0)>0&&(
                <><p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{color:"rgba(224,90,90,0.5)",letterSpacing:"0.12em"}}>Styles to avoid</p>
                <div className="space-y-3">{result.hairstyles_to_avoid!.map(r=><RecCard key={r.name} rec={r} type="negative"/>)}</div></>
              )}
            </Section>

            {/* Beard */}
            {(result.beard_recommendations?.length??0)>0&&(
              <Section icon={Scissors} title="Beard style guide" subtitle="Set your growth pattern for accurate recommendations">
                {profile&&<BeardPanel profileId={profile.id} current={profile.beard_coverage}/>}
                <div className="space-y-3">{result.beard_recommendations!.map(r=><RecCard key={r.name} rec={r}/>)}</div>
              </Section>
            )}

            {/* Outfits */}
            <Section icon={Shirt} title="Outfit direction" subtitle="Necklines, fits, and fabrics that work for you">
              <div className="space-y-3 mb-6">{result.outfit_directions?.map(r=><RecCard key={r.name} rec={r}/>)}</div>
              {result.clothing_details&&(
                <GlassCard className="p-5" style={{background:"rgba(201,169,110,0.04)",borderColor:"rgba(201,169,110,0.12)"} as any}>
                  {(result.clothing_details as any).recommended_necklines&&(
                    <div className="mb-5">
                      <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{color:"#C9A96E",letterSpacing:"0.12em"}}>Best necklines</p>
                      <div className="flex flex-wrap gap-2">{((result.clothing_details as any).recommended_necklines as string[]).map((n:string)=>(
                        <span key={n} className="px-3 py-1 rounded-full text-xs" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.25)",color:"#C9A96E"}}>{n}</span>
                      ))}</div>
                    </div>
                  )}
                  {(result.clothing_details as any).fit_principles&&(
                    <div>
                      <p className="text-xs font-medium mb-3 tracking-widest uppercase" style={{color:"rgba(245,242,237,0.3)",letterSpacing:"0.12em"}}>Fit principles</p>
                      <ul className="space-y-2">{((result.clothing_details as any).fit_principles as string[]).map((p:string)=>(
                        <li key={p} className="flex items-start gap-2 text-sm" style={{color:"rgba(245,242,237,0.5)"}}>
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{background:"#C9A96E"}}/>
                          {p}
                        </li>
                      ))}</ul>
                    </div>
                  )}
                </GlassCard>
              )}
            </Section>

            {/* CTA bar */}
            <GlassCard className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{color:"#F5F2ED"}}>Share your results</p>
                  <p className="text-xs mt-0.5" style={{color:"rgba(245,242,237,0.35)"}}>Anyone can view — no login required</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <AnimatedButton variant="secondary" size="sm" onClick={share}><Share2 size={14}/>Copy link</AnimatedButton>
                  <AnimatedButton size="sm" onClick={()=>router.push("/profile")}>View history</AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </PageTransition>
        </div>
      </div>
    </PageShell>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div style={{minHeight:"100vh",background:"#0A0A0F"}}/>}><ResultsContent/></Suspense>;
}