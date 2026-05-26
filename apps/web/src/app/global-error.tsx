"use client";
import { useEffect } from "react";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="en">
      <body style={{background:"#0A0A0F",fontFamily:"DM Sans,sans-serif",margin:0,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
        <div style={{textAlign:"center",padding:"1.5rem",maxWidth:"24rem"}}>
          <div style={{width:"3.5rem",height:"3.5rem",borderRadius:"1rem",background:"rgba(224,90,90,0.1)",border:"1px solid rgba(224,90,90,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem",fontSize:"1.5rem"}}>⚠</div>
          <h1 style={{fontFamily:"DM Serif Display,serif",fontSize:"1.8rem",color:"#F5F2ED",marginBottom:"0.75rem"}}>Something went wrong</h1>
          <p style={{color:"rgba(245,242,237,0.4)",marginBottom:"1.5rem",fontSize:"0.875rem"}}>An unexpected error occurred. Please try again.</p>
          <button onClick={reset} style={{padding:"0.75rem 2rem",borderRadius:"0.75rem",background:"linear-gradient(135deg,#C9A96E,#E0C898)",color:"#0A0A0F",fontWeight:"600",border:"none",cursor:"pointer",fontSize:"0.875rem"}}>Try again</button>
        </div>
      </body>
    </html>
  );
}