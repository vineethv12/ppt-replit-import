import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowRight, Camera, Layers, Palette, Download,
  Aperture, Wand2, Sliders, PackageCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useIsMobile } from "../hooks/useWindowSize";

const C = {
  bg:   "#FAF8F4",
  bg2:  "#F2EDE5",
  gold: "#B08D5B",
  goldL:"#D4A96A",
  dark: "#1E1A16",
  mid:  "#6B6560",
};

/* ─────────────────────────────────────────
   Single BA background — sweeps back & forth
───────────────────────────────────────── */
function BABackground() {
  const [clipPct, setClipPct] = useState(100); // 100 = full before, 0 = full after
  const rafRef   = useRef(null);

  const SWEEP_MS = 3400;
  const HOLD_MS  = 2000;

  useEffect(() => {
    // phases: sweepIn → holdIn → sweepOut → holdOut → repeat
    let phase     = "sweepIn";
    let phaseStart = null;

    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const tick = (ts) => {
      if (!phaseStart) phaseStart = ts;
      const elapsed = ts - phaseStart;

      if (phase === "sweepIn") {
        const t = Math.min(elapsed / SWEEP_MS, 1);
        setClipPct(100 - ease(t) * 100);
        if (t >= 1) { phase = "holdIn"; phaseStart = ts; }

      } else if (phase === "holdIn") {
        setClipPct(0);
        if (elapsed >= HOLD_MS) { phase = "sweepOut"; phaseStart = ts; }

      } else if (phase === "sweepOut") {
        const t = Math.min(elapsed / SWEEP_MS, 1);
        setClipPct(ease(t) * 100);
        if (t >= 1) { phase = "holdOut"; phaseStart = ts; }

      } else if (phase === "holdOut") {
        setClipPct(100);
        if (elapsed >= HOLD_MS) { phase = "sweepIn"; phaseStart = ts; }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const divX = 100 - clipPct; // % from left where divider sits

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      {/* Before */}
      <img
        src="/images/ba/couple-before.jpg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
      />
      {/* After — clipped */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${clipPct}% 0 0)`, willChange: "clip-path" }}>
        <img
          src="/images/ba/couple-after.jpg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
      </div>

      {/* Divider line */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${divX}%`, width: 2, background: "rgba(255,255,255,0.88)", boxShadow: "0 0 18px rgba(255,255,255,0.55)", transform: "translateX(-50%)", zIndex: 2, willChange: "left" }} />

      {/* BEFORE / AFTER labels */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "2rem", zIndex: 3, opacity: divX > 8 ? 1 : 0, transition: "opacity 0.4s" }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", fontWeight: 600, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>Before</span>
      </div>
      <div style={{ position: "absolute", bottom: "2.5rem", right: "2rem", zIndex: 3, opacity: divX < 92 ? 1 : 0, transition: "opacity 0.4s" }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", fontWeight: 600, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>After</span>
      </div>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(12,8,4,0.5)", zIndex: 1 }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Glassmorphism panel
───────────────────────────────────────── */
function Glass({ children, style }) {
  return (
    <div style={{
      background: "rgba(250,248,244,0.84)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.68)",
      borderRadius: 26,
      boxShadow: "0 20px 70px rgba(0,0,0,0.2)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Fade-in on scroll
───────────────────────────────────────── */
function FadeIn({ children, delay = 0, y = 28, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }} style={style}>
      {children}
    </motion.div>
  );
}


/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function AboutPage() {
  const [, setLocation] = useLocation();
  const { isMobile, isTablet } = useIsMobile();
  const isSmall = isMobile || isTablet;
  useEffect(() => { document.title = "About — pictureprefecttones"; }, []);

  /* ── Workflow steps ── */
  const STEPS = [
    {
      icon: Download,
      iconBg: "linear-gradient(135deg,#5B8DD9,#3A6BC4)",
      num: "01",
      title: "Import & Cull",
      desc: "Every frame reviewed with intention — only moments that carry genuine emotion and story make the cut.",
      accent: "#5B8DD9",
    },
    {
      icon: Sliders,
      iconBg: "linear-gradient(135deg,#D97B5B,#C45C3A)",
      num: "02",
      title: "Enhance & Retouch",
      desc: "Exposure, detail, and skin tones refined — true to life, never over-processed or artificial.",
      accent: "#D97B5B",
    },
    {
      icon: Wand2,
      iconBg: `linear-gradient(135deg,${C.gold},${C.goldL})`,
      num: "03",
      title: "Colour Grade",
      desc: "Our signature warm palette brings richness and depth to every scene — golden, timeless, cinematic.",
      accent: C.gold,
    },
    {
      icon: PackageCheck,
      iconBg: "linear-gradient(135deg,#5BB87A,#3A9C5E)",
      num: "04",
      title: "Export & Deliver",
      desc: "Print-ready resolution with consistent, cinematic colour across every image in the gallery.",
      accent: "#5BB87A",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <BABackground />
      <Navbar activePath="/about" />

      {/* ═══════════════════════════════════════
          HERO — full-screen, over background
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, height: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "calc(var(--nav-h) + 2rem) 2rem 4rem" }}>
        <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ height: 1, width: "2.5rem", background: `linear-gradient(to right,transparent,${C.goldL})` }} />
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.45em", textTransform: "uppercase", color: C.goldL, fontWeight: 600 }}>The Story Behind the Presets</span>
            <div style={{ height: 1, width: "2.5rem", background: `linear-gradient(to left,transparent,${C.goldL})` }} />
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 6vw, 5.5rem)", fontWeight: 400, color: "#FAF6F0", lineHeight: 1.08, margin: 0, textShadow: "0 4px 40px rgba(0,0,0,0.55)" }}>
            Crafting{" "}
            <span style={{ fontStyle: "italic", color: "#E8C97A" }}>Visual</span>{" "}
            Stories
          </h1>

          <p style={{ fontSize: "0.95rem", color: "rgba(255,245,230,0.8)", maxWidth: "34rem", lineHeight: 1.8, fontWeight: 300, textShadow: "0 2px 16px rgba(0,0,0,0.5)", margin: 0 }}>
            A dedicated Lightroom &amp; Photoshop workflow — turning raw Indian wedding frames into timeless, cinematic imagery.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
            <button onClick={() => setLocation("/shop")} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})`, color: "#fff", padding: "0.9rem 2.4rem", border: "none", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, borderRadius: 9999, display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 8px 28px rgba(176,141,91,0.45)", transition: "transform 0.25s,box-shadow 0.25s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(176,141,91,0.55)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 28px rgba(176,141,91,0.45)"; }}>
              Explore Presets <ArrowRight size={14} />
            </button>
            <button onClick={() => setLocation("/gallery")} style={{ background: "rgba(255,245,230,0.1)", color: "rgba(255,245,230,0.88)", padding: "0.9rem 2.4rem", border: "1px solid rgba(255,245,230,0.28)", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400, borderRadius: 9999, backdropFilter: "blur(8px)", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,245,230,0.18)"; e.currentTarget.style.borderColor = "rgba(255,245,230,0.55)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,245,230,0.1)"; e.currentTarget.style.borderColor = "rgba(255,245,230,0.28)"; }}>
              View Gallery
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} style={{ position: "absolute", bottom: "3.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>Scroll</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ width: 1, height: 36, background: `linear-gradient(to bottom,${C.goldL},transparent)` }} />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT — glass card
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: isSmall ? "3rem 1.25rem" : "6rem 3rem" }}>
        <FadeIn>
          <Glass style={{ maxWidth: 1060, margin: "0 auto", padding: isSmall ? "2rem 1.5rem" : "4rem", display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr", gap: isSmall ? "2rem" : "4rem", alignItems: "center" }}>
            {/* Image */}
            <div style={{ position: "relative" }}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }} style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/5", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
                <img src="/images/gallery/sikh-couple.webp" alt="Creator" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(30,26,22,0.35) 0%,transparent 55%)" }} />
              </motion.div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", bottom: "1.5rem", left: isMobile ? "0.5rem" : "-1.25rem", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)", borderRadius: 14, padding: "0.9rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid rgba(176,141,91,0.18)` }}>
                <p style={{ margin: 0, fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>Signature Style</p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: C.dark, fontWeight: 500 }}>Warm · Golden · Timeless</p>
              </motion.div>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>About the Creator</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem,3vw,2.8rem)", color: C.dark, margin: 0, fontWeight: 400, lineHeight: 1.18 }}>
                Every Frame<br /><span style={{ fontStyle: "italic", color: C.gold }}>Tells a Truth</span>
              </h2>
              <p style={{ color: C.mid, lineHeight: 1.85, margin: 0, fontWeight: 300, fontSize: "0.9rem" }}>With over five years dedicated to Indian wedding post-production, I've developed a colour language honouring the richness of our traditions — the deep crimsons of a bridal lehenga, the warmth of mandap lighting.</p>
              <p style={{ color: C.mid, lineHeight: 1.85, margin: 0, fontWeight: 300, fontSize: "0.9rem" }}>pictureprefecttones presets are born from thousands of hours inside Lightroom and Camera Raw — tuned specifically for Indian skin tones and mixed wedding lighting.</p>
              <div style={{ display: "flex", gap: "2rem" }}>
                {[["5+","Years"],["500+","Galleries"],["6","Packs"]].map(([n,l]) => (
                  <div key={l}>
                    <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", color: C.dark, fontWeight: 500 }}>{n}</p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: C.mid }}>{l}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setLocation("/contact")} style={{ alignSelf: "flex-start", background: C.dark, color: "#FAF8F4", padding: "0.85rem 2.2rem", border: "none", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, borderRadius: 9999, display: "flex", alignItems: "center", gap: "0.5rem", transition: "background 0.3s" }} onMouseEnter={e => e.currentTarget.style.background = C.gold} onMouseLeave={e => e.currentTarget.style.background = C.dark}>
                Get in Touch <ArrowRight size={13} />
              </button>
            </div>
          </Glass>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════
          TOOLKIT — clean 3-column grid
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: isSmall ? "0 1.25rem 3rem" : "0 3rem 6rem" }}>
        <FadeIn>
          <Glass style={{ maxWidth: 1060, margin: "0 auto", padding: isSmall ? "2rem 1.5rem" : "4rem" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>The Toolkit</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", color: C.dark, margin: "0.8rem 0 0", fontWeight: 400 }}>
                Powered by <span style={{ fontStyle: "italic", color: C.gold }}>Industry Tools</span>
              </h2>
            </div>

            {/* 3 columns: tools | image | stats */}
            <div className="toolkit-grid">

              {/* Left — tool cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {[
                  { label: "Lr", name: "Adobe Lightroom", desc: "Primary colour grading & preset application", bg: "linear-gradient(135deg,#31A8FF,#1473E6)", delay: 0 },
                  { label: "Ps", name: "Adobe Photoshop", desc: "Skin retouching & advanced compositing",      bg: "linear-gradient(135deg,#44BBFF,#001E36)", delay: 0.08 },
                  { label: "Cr", name: "Camera Raw",      desc: "RAW processing & lens correction",            bg: `linear-gradient(135deg,${C.gold},${C.goldL})`, delay: 0.16 },
                ].map((tool) => (
                  <FadeIn key={tool.label} delay={tool.delay} y={16}>
                    <motion.div whileHover={{ x: 5, boxShadow: "0 10px 36px rgba(176,141,91,0.14)" }} transition={{ duration: 0.3 }} style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(250,248,244,0.75)", border: "1px solid rgba(176,141,91,0.13)", borderRadius: 16, padding: "1rem 1.2rem", cursor: "default", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: tool.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{tool.label}</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: C.dark }}>{tool.name}</p>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: C.mid, fontWeight: 300, lineHeight: 1.5 }}>{tool.desc}</p>
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>

              {/* Centre — floating editorial image */}
              <FadeIn delay={0.1}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="toolkit-center-img" style={{ flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: "-12%", borderRadius: "50%", background: `radial-gradient(circle,rgba(176,141,91,0.22) 0%,transparent 70%)`, filter: "blur(32px)" }} />
                  <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "3/4", boxShadow: "0 40px 90px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.1)" }}>
                    <img src="/images/gallery/editorial-1.webp" alt="Edited photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.9rem 1rem", background: "rgba(250,248,244,0.72)", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(255,255,255,0.65)" }}>
                      <p style={{ margin: 0, fontSize: "0.54rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>After Edit</p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.68rem", color: C.dark, fontWeight: 500 }}>pictureprefecttones Preset</p>
                    </div>
                  </div>
                  {/* Floating 500+ badge */}
                  <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: "absolute", top: "-1rem", right: "-1.5rem", background: "#fff", borderRadius: 12, padding: "0.6rem 1rem", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", border: `1px solid rgba(176,141,91,0.18)`, zIndex: 10 }}>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: C.dark, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>500+</p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.mid }}>Weddings</p>
                  </motion.div>
                </motion.div>
              </FadeIn>

              {/* Right — stat cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { num: "5+",  lab: "Years of experience",    sub: "Dedicated to Indian wedding post-production" },
                  { num: "6",   lab: "Signature preset packs", sub: "Each tuned for a distinct mood & lighting"   },
                  { num: "48h", lab: "Average turnaround",     sub: "Fast delivery without compromising quality"  },
                ].map((stat, i) => (
                  <FadeIn key={stat.num} delay={i * 0.1} y={16}>
                    <div style={{ padding: "1.1rem 1.25rem", background: "rgba(250,248,244,0.75)", borderRadius: 16, border: "1px solid rgba(176,141,91,0.1)", borderLeft: `3px solid ${C.gold}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                      <p style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: "1.85rem", fontWeight: 500, color: C.dark, lineHeight: 1 }}>{stat.num}</p>
                      <p style={{ margin: "0.2rem 0 0.25rem", fontSize: "0.72rem", fontWeight: 600, color: C.dark }}>{stat.lab}</p>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: C.mid, fontWeight: 300, lineHeight: 1.5 }}>{stat.sub}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

            </div>
          </Glass>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — creative step flow
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: isSmall ? "0 1.25rem 3rem" : "0 3rem 6rem" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Title pill */}
          <FadeIn style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Glass style={{ display: "inline-block", padding: "1rem 2.5rem" }}>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>The Process</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", color: C.dark, margin: "0.6rem 0 0", fontWeight: 400 }}>
                How It <span style={{ fontStyle: "italic", color: C.gold }}>Works</span>
              </h2>
            </Glass>
          </FadeIn>

          {/* Steps — horizontal connected cards */}
          <div className="about-steps-grid">
            {/* Connecting line */}
            <div className="about-steps-line" />

            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.num} delay={i * 0.12} y={24}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.35 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 1rem", position: "relative", zIndex: 1 }}
                  >
                    {/* Icon circle */}
                    <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                      {/* Glow ring */}
                      <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: s.iconBg, opacity: 0.18, filter: "blur(8px)" }} />
                      {/* Step number badge */}
                      <div style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: `2px solid ${s.accent}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: `0 2px 10px ${s.accent}44` }}>
                        <span style={{ fontSize: "0.55rem", fontWeight: 800, color: s.accent, letterSpacing: 0 }}>{i + 1}</span>
                      </div>
                      {/* Main icon circle */}
                      <div style={{ width: 72, height: 72, borderRadius: "50%", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 28px ${s.accent}44`, position: "relative" }}>
                        <Icon size={30} color="#fff" strokeWidth={1.6} />
                      </div>
                    </div>

                    {/* Card body */}
                    <Glass style={{ padding: "1.5rem 1.2rem", borderRadius: 20, width: "100%", background: "rgba(250,248,244,0.88)", borderTop: `3px solid ${s.accent}` }}>
                      <p style={{ margin: "0 0 0.4rem", fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: s.accent, fontWeight: 700 }}>{s.num}</p>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", color: C.dark, margin: "0 0 0.75rem", fontWeight: 500 }}>{s.title}</h3>
                      <p style={{ fontSize: "0.75rem", color: C.mid, margin: 0, lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
                    </Glass>
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: isSmall ? "0 1.25rem 4rem" : "0 3rem 8rem" }}>
        <FadeIn>
          <Glass style={{ maxWidth: 760, margin: "0 auto", padding: isSmall ? "2.5rem 1.5rem" : "5rem 3rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              <div style={{ height: 1, width: "3rem", background: `linear-gradient(to right,transparent,${C.gold})` }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold }} />
              <div style={{ height: 1, width: "3rem", background: `linear-gradient(to left,transparent,${C.gold})` }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3.8rem)", color: C.dark, margin: "0 0 1.25rem", fontWeight: 400, lineHeight: 1.1 }}>
              Let's Create Something<br /><span style={{ fontStyle: "italic", color: C.gold }}>Cinematic</span>
            </h2>
            <p style={{ color: C.mid, fontSize: "0.9rem", maxWidth: "26rem", margin: "0 auto 2.5rem", lineHeight: 1.8, fontWeight: 300 }}>
              Ready to transform your wedding photography? Explore our presets or talk to us about a custom workflow.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button onClick={() => setLocation("/shop")} whileHover={{ scale: 1.04, boxShadow: "0 18px 44px rgba(176,141,91,0.42)" }} whileTap={{ scale: 0.98 }} style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})`, color: "#fff", padding: "1rem 2.75rem", border: "none", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, borderRadius: 9999, display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 8px 28px rgba(176,141,91,0.32)" }}>
                Shop Presets <ArrowRight size={14} />
              </motion.button>
              <motion.button onClick={() => setLocation("/contact")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} style={{ background: "transparent", color: C.dark, padding: "1rem 2.75rem", border: "1px solid rgba(30,26,22,0.2)", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500, borderRadius: 9999, transition: "border-color 0.25s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(30,26,22,0.2)"}>
                Contact Us
              </motion.button>
            </div>
          </Glass>
        </FadeIn>
      </section>
      <Footer />
    </div>
  );
}
