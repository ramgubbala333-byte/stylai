"use client";
import { useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, AlertCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/Navbar";
import { AnimatedButton, GlassCard, PageTransition } from "@/components/ui";
import { analysisApi, extractApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

type Phase = "idle"|"preview"|"uploading"|"analyzing"|"done";

const STEPS = [
  "Uploading image","Detecting face landmarks","Analyzing skin tone","Classifying face shape","Running style engine","Building your profile"
];

function UploadContent() {
  const router = useRouter();
  const [phase,setPhase]=useState<Phase>("idle");
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [progress,setProgress]=useState(0);
  const [step,setStep]=useState(0);
  const [error,setError]=useState<string|null>(null);

  const onDrop = useCallback((accepted:File[],rejected:any[]) => {
    if(rejected.length>0){setError("Please upload a JPEG, PNG, or WebP image under 10MB.");return;}
    const f=accepted[0]; setFile(f); setPreview(URL.createObjectURL(f)); setPhase("preview"); setError(null);
  },[]);

  const {getRootProps,getInputProps,isDragActive}=useDropzone({onDrop,accept:{"image/jpeg":[],"image/png":[],"image/webp":[]},maxSize:10*1024*1024,multiple:false});

  const clear=()=>{ if(preview) URL.revokeObjectURL(preview); setFile(null); setPreview(null); setPhase("idle"); setError(null); };

  const simulateSteps=async()=>{ for(let i=0;i<STEPS.length;i++){setStep(i);await new Promise(r=>setTimeout(r,1800+Math.random()*600));} };

  const analyze=async()=>{
    if(!file) return; setError(null); setPhase("uploading");
    try {
      const [result]=await Promise.all([
        analysisApi.uploadSelfie(file,(p)=>{setProgress(p);if(p===100)setPhase("analyzing");}),
        simulateSteps()
      ]);
      setPhase("done"); toast.success("Analysis complete!");
      if(result.result?.id) sessionStorage.setItem("latest_result_id",result.result.id);
      setTimeout(()=>router.push("/results"),700);
    } catch(e){const m=extractApiError(e);setError(m);setPhase("preview");toast.error(m);}
  };

  const processing=phase==="uploading"||phase==="analyzing"||phase==="done";

  return (
    <PageShell>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-16" style={{background:"radial-gradient(ellipse 70% 50% at 50% 30%,rgba(201,169,110,0.05) 0%,transparent 70%)"}}>
        <PageTransition>
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest mb-3" style={{color:"#C9A96E",letterSpacing:"0.2em"}}>STEP 1 OF 1</p>
              <h1 className="mb-2" style={{fontFamily:"DM Serif Display,serif",fontSize:"2.2rem",color:"#F5F2ED",letterSpacing:"-0.025em"}}>Upload your selfie</h1>
              <p className="text-sm" style={{color:"rgba(245,242,237,0.4)"}}>Front-facing · Natural light · No filters</p>
            </div>

            <AnimatePresence mode="wait">
              {processing && (
                <motion.div key="processing" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
                  <GlassCard className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
                      {phase==="done" ? <Sparkles size={28} style={{color:"#C9A96E"}}/> : <Loader2 size={28} style={{color:"#C9A96E"}} className="animate-spin"/>}
                    </div>
                    <h2 className="text-lg mb-1.5" style={{fontFamily:"DM Serif Display,serif",color:"#F5F2ED"}}>{phase==="done"?"Analysis complete!":"Analyzing your features…"}</h2>
                    <p className="text-sm mb-7" style={{color:"rgba(245,242,237,0.4)"}}>{phase==="done"?"Taking you to your results":"Takes about 15–20 seconds"}</p>
                    <div className="space-y-2.5 text-left">
                      {STEPS.map((s,i)=>{
                        const done=i<step||phase==="done"; const active=i===step&&phase!=="done";
                        return (
                          <motion.div key={s} className="flex items-center gap-3" animate={{opacity:done||active?1:0.28}} transition={{duration:0.3}}>
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{background:done?"rgba(76,175,130,0.18)":active?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${done?"rgba(76,175,130,0.4)":active?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`}}>
                              {done?<CheckCircle2 size={11} style={{color:"#4CAF82"}}/>:active?<Loader2 size={10} className="animate-spin" style={{color:"#C9A96E"}}/>:null}
                            </div>
                            <span className="text-sm" style={{color:done?"#4CAF82":active?"#F5F2ED":"rgba(245,242,237,0.35)"}}>{s}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                    {phase==="uploading"&&progress<100&&(
                      <div className="mt-6">
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                          <motion.div className="h-full rounded-full" animate={{width:`${progress}%`}} style={{background:"linear-gradient(90deg,#C9A96E,#E0C898)"}} />
                        </div>
                        <p className="text-xs mt-2" style={{color:"rgba(245,242,237,0.3)"}}>Uploading… {progress}%</p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {phase==="preview"&&preview&&(
                <motion.div key="preview" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
                  <GlassCard className="overflow-hidden">
                    <div className="relative">
                      <div className="aspect-[4/3] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Selfie preview" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,transparent 55%,rgba(10,10,15,0.85))"}}/>
                      </div>
                      <button onClick={clear} className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{background:"rgba(10,10,15,0.8)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,242,237,0.7)",backdropFilter:"blur(8px)"}}>
                        <X size={15}/>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-sm font-medium truncate" style={{color:"#F5F2ED"}}>{file?.name}</p>
                        <p className="text-xs" style={{color:"rgba(245,242,237,0.45)"}}>{file?(file.size/1024/1024).toFixed(2):0} MB</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      {error&&(
                        <div className="flex items-start gap-2.5 p-3 rounded-xl text-sm" style={{background:"rgba(224,90,90,0.08)",border:"1px solid rgba(224,90,90,0.2)",color:"#E05A5A"}}>
                          <AlertCircle size={15} className="flex-shrink-0 mt-0.5"/>{error}
                        </div>
                      )}
                      <AnimatedButton onClick={analyze} className="w-full" size="lg"><Sparkles size={15}/>Analyze my style</AnimatedButton>
                      <AnimatedButton variant="ghost" onClick={clear} className="w-full text-sm">Choose a different photo</AnimatedButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {phase==="idle"&&(
                <motion.div key="dropzone" initial={{opacity:0}} animate={{opacity:1}}>
                  <motion.div {...getRootProps()} className="rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center p-14"
                    animate={{borderColor:isDragActive?"rgba(201,169,110,0.5)":"rgba(255,255,255,0.1)",background:isDragActive?"rgba(201,169,110,0.05)":"rgba(255,255,255,0.025)"}}>
                    <input {...getInputProps()}/>
                    <motion.div animate={{scale:isDragActive?1.1:1}} transition={{duration:0.2}}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                      style={{background:isDragActive?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${isDragActive?"rgba(201,169,110,0.35)":"rgba(255,255,255,0.08)"}`}}>
                      {isDragActive?<ImageIcon size={32} style={{color:"#C9A96E"}}/>:<Upload size={32} style={{color:"rgba(245,242,237,0.28)"}}/>}
                    </motion.div>
                    <p className="text-base font-medium mb-1.5" style={{color:isDragActive?"#C9A96E":"#F5F2ED"}}>{isDragActive?"Drop it here":"Drag & drop your selfie"}</p>
                    <p className="text-sm mb-6" style={{color:"rgba(245,242,237,0.35)"}}>or click to browse</p>
                    <AnimatedButton variant="secondary" size="md" type="button">Choose photo</AnimatedButton>
                    <p className="mt-5 text-xs" style={{color:"rgba(245,242,237,0.2)"}}>JPEG · PNG · WebP · Max 10MB</p>
                  </motion.div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[{emoji:"💡",tip:"Natural light"},{emoji:"👤",tip:"Face forward"},{emoji:"🚫",tip:"No filters"}].map(({emoji,tip})=>(
                      <div key={tip} className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center" style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)"}}>
                        <span className="text-lg">{emoji}</span>
                        <span className="text-xs" style={{color:"rgba(245,242,237,0.4)"}}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </div>
    </PageShell>
  );
}

export default function UploadPage() {
  return <Suspense><UploadContent/></Suspense>;
}