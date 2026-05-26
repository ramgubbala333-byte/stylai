import { Palette, Scissors, Shirt } from "lucide-react";
import { StyleResult } from "@/lib/types";

async function getResult(token: string): Promise<StyleResult|null> {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analysis/share/${token}`,{cache:"no-store"});
    if(!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export default async function SharePage({params}:{params:{token:string}}) {
  const result = await getResult(params.token);
  if(!result) return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans,sans-serif",padding:"1.5rem"}}>
      <div style={{textAlign:"center",maxWidth:"22rem"}}>
        <div style={{fontSize:"2rem",marginBottom:"1rem"}}>🔍</div>
        <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.6rem",color:"#F5F2ED",marginBottom:"0.75rem"}}>Profile not found</h2>
        <p style={{color:"rgba(245,242,237,0.4)",fontSize:"0.875rem",marginBottom:"1.5rem"}}>This link may have expired or been removed.</p>
        <a href="/" style={{color:"#C9A96E",fontSize:"0.875rem"}}>Create your own →</a>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"DM Sans,sans-serif"}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:10,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(10,10,15,0.9)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <span style={{fontFamily:"DM Serif Display,serif",fontSize:"1.3rem",color:"#F5F2ED"}}>Styl<span style={{background:"linear-gradient(135deg,#C9A96E,#E0C898)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AI</span></span>
        <a href="/auth/register" style={{padding:"0.5rem 1.25rem",borderRadius:"0.75rem",background:"linear-gradient(135deg,#C9A96E,#E0C898)",color:"#0A0A0F",fontSize:"0.8rem",fontWeight:"600",textDecoration:"none"}}>
          Get my profile
        </a>
      </div>

      <div style={{maxWidth:"40rem",margin:"0 auto",padding:"3rem 1.5rem 6rem"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:"3rem"}}>
          <span style={{display:"inline-block",padding:"0.25rem 0.75rem",borderRadius:"99px",fontSize:"0.7rem",fontWeight:"600",background:"rgba(201,169,110,0.12)",border:"1px solid rgba(201,169,110,0.3)",color:"#C9A96E",letterSpacing:"0.1em",marginBottom:"1.25rem"}}>SHARED STYLE PROFILE</span>
          <h1 style={{fontFamily:"DM Serif Display,serif",fontSize:"clamp(2rem,5vw,2.8rem)",color:"#F5F2ED",letterSpacing:"-0.025em",marginBottom:"0.5rem"}}>{result.color_season}</h1>
          <p style={{color:"rgba(245,242,237,0.4)",fontSize:"0.875rem"}}>Personalized by StylAI</p>
        </div>

        {/* Colors */}
        {result.recommended_colors&&result.recommended_colors.length>0&&(
          <div style={{marginBottom:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem"}}>
              <div style={{width:"2rem",height:"2rem",borderRadius:"0.625rem",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
                <Palette size={14} color="#C9A96E"/>
              </div>
              <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.1rem",color:"#F5F2ED"}}>Color palette</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem"}}>
              {result.recommended_colors.slice(0,6).map(c=>(
                <div key={c.hex} style={{textAlign:"center"}}>
                  <div style={{width:"100%",aspectRatio:"1",borderRadius:"1rem",background:c.hex,marginBottom:"0.4rem",boxShadow:`0 4px 16px ${c.hex}40`}}/>
                  <p style={{fontSize:"0.7rem",color:"#F5F2ED",fontWeight:"500"}}>{c.name}</p>
                  <p style={{fontSize:"0.65rem",color:"rgba(245,242,237,0.35)",fontFamily:"monospace"}}>{c.hex}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hairstyles */}
        {result.hairstyle_recommendations&&result.hairstyle_recommendations.length>0&&(
          <div style={{marginBottom:"2.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem"}}>
              <div style={{width:"2rem",height:"2rem",borderRadius:"0.625rem",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
                <Scissors size={14} color="#C9A96E"/>
              </div>
              <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.1rem",color:"#F5F2ED"}}>Hairstyle guide</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {result.hairstyle_recommendations.slice(0,3).map(r=>(
                <div key={r.name} style={{padding:"1rem",borderRadius:"1rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <p style={{fontSize:"0.875rem",fontWeight:"500",color:"#F5F2ED",marginBottom:"0.25rem"}}>{r.name}</p>
                  <p style={{fontSize:"0.75rem",color:"rgba(245,242,237,0.45)",lineHeight:"1.5"}}>{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outfits */}
        {result.outfit_directions&&result.outfit_directions.length>0&&(
          <div style={{marginBottom:"3rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem"}}>
              <div style={{width:"2rem",height:"2rem",borderRadius:"0.625rem",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)"}}>
                <Shirt size={14} color="#C9A96E"/>
              </div>
              <h2 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.1rem",color:"#F5F2ED"}}>Outfit direction</h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {result.outfit_directions.slice(0,2).map(r=>(
                <div key={r.name} style={{padding:"1rem",borderRadius:"1rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <p style={{fontSize:"0.875rem",fontWeight:"500",color:"#F5F2ED",marginBottom:"0.25rem"}}>{r.name}</p>
                  <p style={{fontSize:"0.75rem",color:"rgba(245,242,237,0.45)",lineHeight:"1.5"}}>{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{textAlign:"center",padding:"3rem 2rem",borderRadius:"1.5rem",background:"linear-gradient(135deg,rgba(201,169,110,0.08) 0%,rgba(124,111,205,0.04) 100%)",border:"1px solid rgba(201,169,110,0.15)"}}>
          <h3 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.6rem",color:"#F5F2ED",marginBottom:"0.75rem"}}>Get your own style profile</h3>
          <p style={{fontSize:"0.875rem",color:"rgba(245,242,237,0.4)",marginBottom:"1.5rem"}}>Free, instant, built around your actual features.</p>
          <a href="/auth/register" style={{display:"inline-block",padding:"0.875rem 2rem",borderRadius:"0.875rem",background:"linear-gradient(135deg,#C9A96E,#E0C898)",color:"#0A0A0F",fontWeight:"600",fontSize:"0.875rem",textDecoration:"none"}}>
            Create my free profile →
          </a>
        </div>
      </div>
    </div>
  );
}