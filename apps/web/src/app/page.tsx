import Link from "next/link";
import { ArrowRight, Scan, Palette, Scissors, Shirt } from "lucide-react";
import { Logo, Badge, Button } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "#0D0D0F",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.07) 0%, transparent 70%), #0D0D0F",
        }}
      >
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent)",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(138,143,168,0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div className="flex justify-center mb-8 animate-[fadeUp_0.6s_ease_forwards]">
            <Badge variant="gold">AI-Powered Personal Styling</Badge>
          </div>

          {/* Headline */}
          <h1
            className="mb-6 animate-[fadeUp_0.6s_ease_0.1s_forwards] opacity-0"
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
              color: "#F5F2ED",
            }}
          >
            Your style, finally{" "}
            <em
              style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #C9A96E 0%, #E0C898 60%, #9A7A48 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              understood.
            </em>
          </h1>

          {/* Sub */}
          <p
            className="text-lg max-w-2xl mx-auto mb-10 animate-[fadeUp_0.6s_ease_0.2s_forwards] opacity-0"
            style={{ color: "rgba(245,242,237,0.5)", lineHeight: "1.7" }}
          >
            Upload a selfie. Our AI reads your face shape, skin tone, undertone, and hair — then delivers
            hyper-personalized color palettes, hairstyle recommendations, beard guidance, and outfit
            directions built specifically for you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeUp_0.6s_ease_0.3s_forwards] opacity-0">
            <Link href="/auth/register">
              <Button size="lg" className="group">
                Discover your style
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p
            className="mt-10 text-xs animate-[fadeUp_0.6s_ease_0.4s_forwards] opacity-0"
            style={{ color: "rgba(245,242,237,0.25)", letterSpacing: "0.08em" }}
          >
            NO SUBSCRIPTION · NO CREDIT CARD · INSTANT RESULTS
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[fadeIn_1s_ease_1s_forwards] opacity-0"
        >
          <div
            className="w-px h-12"
            style={{
              background: "linear-gradient(to bottom, rgba(201,169,110,0.5), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p
            className="text-xs tracking-widest mb-4"
            style={{ color: "#C9A96E", letterSpacing: "0.2em" }}
          >
            THE PROCESS
          </p>
          <h2
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#F5F2ED",
              letterSpacing: "-0.02em",
            }}
          >
            Three steps to your style profile
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: "Upload a selfie",
              body: "A clear, front-facing photo in natural light. That's all we need to begin.",
              icon: "📸",
            },
            {
              num: "02",
              title: "AI reads your features",
              body: "We analyze face shape, skin tone, undertone, contrast, hair, and beard growth — in seconds.",
              icon: "🔬",
            },
            {
              num: "03",
              title: "Get your style profile",
              body: "Your personal color season, hairstyle guide, beard style, and outfit direction — all explained.",
              icon: "✨",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative p-8 rounded-2xl group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <div
                className="text-4xl mb-5"
              >
                {step.icon}
              </div>
              <div
                className="absolute top-6 right-6 text-xs font-mono"
                style={{ color: "rgba(201,169,110,0.4)" }}
              >
                {step.num}
              </div>
              <h3
                className="text-lg mb-3"
                style={{ fontFamily: "DM Serif Display, serif", color: "#F5F2ED" }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,242,237,0.45)" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ───────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs tracking-widest mb-4"
              style={{ color: "#C9A96E", letterSpacing: "0.2em" }}
            >
              WHAT YOU GET
            </p>
            <h2
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#F5F2ED",
                letterSpacing: "-0.02em",
              }}
            >
              Everything in one profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Palette,
                title: "Color Season",
                body: "Your exact seasonal archetype — Deep Winter, True Autumn, and more. Colors that work and colors to avoid.",
              },
              {
                icon: Scissors,
                title: "Hairstyles",
                body: "Cuts that flatter your face shape. What to ask for and what to avoid at the barber or salon.",
              },
              {
                icon: Scan,
                title: "Beard Guide",
                body: "Beard styles mapped to your face shape and actual growth pattern. For men who want structure.",
              },
              {
                icon: Shirt,
                title: "Outfit Direction",
                body: "Necklines, fits, fabrics, and patterns that work for your proportions. Practical and specific.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(201,169,110,0.1)",
                    border: "1px solid rgba(201,169,110,0.2)",
                  }}
                >
                  <Icon size={18} style={{ color: "#C9A96E" }} />
                </div>
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: "#F5F2ED" }}
                >
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,237,0.4)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div
          className="max-w-2xl mx-auto text-center p-16 rounded-3xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(13,13,15,0) 100%)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,169,110,0.12), transparent)",
            }}
          />
          <p
            className="text-xs tracking-widest mb-6 relative z-10"
            style={{ color: "#C9A96E", letterSpacing: "0.2em" }}
          >
            START FOR FREE
          </p>
          <h2
            className="mb-4 relative z-10"
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#F5F2ED",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to see what suits you?
          </h2>
          <p
            className="text-sm mb-10 relative z-10"
            style={{ color: "rgba(245,242,237,0.45)", lineHeight: "1.7" }}
          >
            One selfie. Two minutes. A complete style profile built around your actual features — not generic advice.
          </p>
          <Link href="/auth/register" className="relative z-10 inline-block">
            <Button size="lg" className="group">
              Create your style profile
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Logo size="sm" />
        <p
          className="mt-4 text-xs"
          style={{ color: "rgba(245,242,237,0.2)" }}
        >
          © {new Date().getFullYear()} StylAI. Built for people who care about dressing well.
        </p>
      </footer>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
