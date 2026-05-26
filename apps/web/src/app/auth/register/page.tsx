"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Logo, AnimatedButton, Input, GoldDivider, PageTransition } from "@/components/ui";
import { useAuthStore } from "@/lib/hooks/useAuth";
import { Gender } from "@/lib/types";
import toast from "react-hot-toast";

const GENDERS: {value:Gender;label:string;emoji:string}[] = [
  {value:"male",label:"Male",emoji:"♂"},{value:"female",label:"Female",emoji:"♀"},
  {value:"non_binary",label:"Non-binary",emoji:"⚧"},{value:"prefer_not_to_say",label:"Prefer not to say",emoji:"—"},
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [fullName,setFullName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [gender,setGender]=useState<Gender|null>(null); const [showPw,setShowPw]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string>={};
    if(!fullName.trim()) e.fullName="Name is required";
    if(!email) e.email="Email is required"; else if(!/\S+@\S+\.\S+/.test(email)) e.email="Enter a valid email";
    if(!password) e.password="Password is required"; else if(password.length<8) e.password="At least 8 characters";
    if(!gender) e.gender="Please select one";
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); if(!validate()) return;
    try { await register({email,password,full_name:fullName,gender:gender!}); toast.success("Account created!"); router.push("/onboarding"); }
    catch(err:any) { toast.error(err?.response?.data?.detail??"Registration failed"); }
  };

  return (
    <div className="min-h-screen flex" style={{background:"#0A0A0F"}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{background:"radial-gradient(ellipse 80% 70% at 70% 50%,rgba(124,111,205,0.07) 0%,transparent 70%)",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
        <Logo size="md" />
        <div className="relative z-10 space-y-8">
          {[{label:"Face shapes detected",value:"7"},{label:"Color seasons mapped",value:"9"},{label:"Recommendations per profile",value:"25+"}].map(({label,value})=>(
            <div key={label} className="flex items-end gap-4">
              <span style={{fontFamily:"DM Serif Display,serif",fontSize:"3.2rem",lineHeight:1,background:"linear-gradient(135deg,#C9A96E,#E0C898)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{value}</span>
              <span className="text-sm pb-1.5" style={{color:"rgba(245,242,237,0.4)"}}>{label}</span>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-xs" style={{color:"rgba(245,242,237,0.2)"}}>Your photo is analyzed and never shared.</p>
      </div>

      {/* Right — form */}
      <PageTransition>
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-10 text-center"><Logo size="md"/></div>
            <div className="mb-7">
              <h1 className="mb-1.5" style={{fontFamily:"DM Serif Display,serif",fontSize:"1.9rem",color:"#F5F2ED",letterSpacing:"-0.025em"}}>Create your profile</h1>
              <p className="text-sm" style={{color:"rgba(245,242,237,0.4)"}}>Free forever · No credit card needed</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full name" type="text" placeholder="Alex Johnson" value={fullName} onChange={e=>setFullName(e.target.value)} error={errors.fullName} autoFocus />
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} />
              <div className="relative">
                <Input label="Password" type={showPw?"text":"password"} placeholder="8+ characters" value={password} onChange={e=>setPassword(e.target.value)} error={errors.password} />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 transition-colors" style={{bottom:errors.password?"calc(1.25rem + 1.5rem)":"0.85rem",color:"rgba(245,242,237,0.3)"}}>
                  {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>

              {/* Gender selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium tracking-widest uppercase" style={{color:"rgba(245,242,237,0.45)"}}>I style for</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map(o=>{
                    const sel=gender===o.value;
                    return (
                      <motion.button key={o.value} type="button" whileTap={{scale:0.97}} onClick={()=>setGender(o.value)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-left transition-all"
                        style={{background:sel?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${sel?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`,color:sel?"#C9A96E":"rgba(245,242,237,0.55)"}}>
                        <span>{o.emoji}</span><span className="font-medium flex-1">{o.label}</span>
                        {sel&&<Check size={13} style={{color:"#C9A96E"}}/>}
                      </motion.button>
                    );
                  })}
                </div>
                {errors.gender && <p className="text-xs" style={{color:"#E05A5A"}}>{errors.gender}</p>}
                <p className="text-xs" style={{color:"rgba(245,242,237,0.25)"}}>Personalizes hairstyle and beard recommendations</p>
              </div>

              <div className="pt-1">
                <AnimatedButton type="submit" loading={isLoading} className="w-full group" size="lg">
                  Create my style profile <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
                </AnimatedButton>
              </div>
            </form>
            <GoldDivider />
            <p className="text-center text-sm" style={{color:"rgba(245,242,237,0.38)"}}>
              Already have an account?{" "}<Link href="/auth/login" style={{color:"#C9A96E"}} className="font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}