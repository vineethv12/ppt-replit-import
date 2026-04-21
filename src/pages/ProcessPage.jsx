import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useSEO } from "../hooks/useSEO";

function extractYouTubeId(input) {
  if (!input) return "";
  const clean = input.trim();
  try {
    const url = new URL(clean);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0];
    if (url.searchParams.has("v")) return url.searchParams.get("v");
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1].split("?")[0];
  } catch {}
  return clean;
}
import { useContent } from "../context/ContentContext";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useIsMobile } from "../hooks/useWindowSize";

/* ─── PALETTE ────────────────────────────────────────────────── */
const C = {
  bg:       "#F5F1EB",
  bg2:      "#EDE9E1",
  bg3:      "#FAF8F5",
  card:     "#FFFFFF",
  border:   "rgba(44,40,37,0.08)",
  gold:     "#B08D5B",
  goldSoft: "rgba(176,141,91,0.12)",
  dark:     "#2C2825",
  mid:      "#6B6560",
  light:    "rgba(44,40,37,0.38)",
  white:    "#FFFFFF",
};

/* ─── GALLERY IMAGES ─────────────────────────────────────────── */
const IMGS = {
  bride:  "/images/gallery/bride-portrait.jpg",
  garden: "/images/gallery/bride-garden.webp",
  hall:   "/images/gallery/couple-hall.webp",
  sikh:   "/images/gallery/sikh-couple.webp",
  sikh2:  "/images/gallery/sikh-couple-2.webp",
  edit1:  "/images/gallery/editorial-1.webp",
  edit2:  "/images/gallery/editorial-2.jpg",
  edit3:  "/images/gallery/editorial-3.jpg",
  edit4:  "/images/gallery/editorial-4.jpg",
};

/* ─── STAGE LABELS ───────────────────────────────────────────── */
const STAGES = [
  { id: "raw",        label: "Raw Capture"    },
  { id: "correction", label: "Colour Correct" },
  { id: "skin",       label: "Skin Tones"     },
  { id: "grading",    label: "Colour Grade"   },
  { id: "output",     label: "Final Output"   },
];

/* ─── VIDEOS ─────────────────────────────────────────────────── */
const FEATURED_VIDEO_ID = "mZTw7twXRvk";
const VIDEOS = [
  { id: "hrhUr8-jZcw", title: "Cinematic Colour Grade",        desc: "The tone curve workflow behind every preset",         cat: "Lightroom Edits" },
  { id: "6DKUabsAL_E", title: "Indian Wedding Edit",           desc: "Full edit walkthrough for a real wedding shoot",      cat: "Tutorials"      },
  { id: "RuXkORH5vjM", title: "Preset Breakdown",              desc: "How we craft each preset from scratch",               cat: "Presets"        },
  { id: "RFGrbB-NEno", title: "Skin Tone Mastery",             desc: "Perfect Indian skin tones in any lighting",           cat: "Skin Tones"     },
  { id: "G83RBXmOeZw", title: "Full Lightroom Workflow",       desc: "Import to export — complete wedding edit",            cat: "Tutorials"      },
];
const VIDEO_CATS = ["All", "Lightroom Edits", "Skin Tones", "Presets", "Tutorials"];

/* ─── STORY SECTIONS ─────────────────────────────────────────── */
const STORY = [
  {
    num: "01", sub: "Raw Capture",        title: "The Beginning",
    body: "Every story starts in its rawest form — unedited, unfiltered, full of potential. We shoot to capture light and emotion, knowing the colour journey begins in post.",
    img: IMGS.bride,  flip: false, bg: C.bg,
  },
  {
    num: "02", sub: "Colour Correction",  title: "Building the Base",
    body: "Exposure, white balance, and tonal range are calibrated to a neutral, accurate baseline. This is the foundation every creative decision is built on.",
    img: IMGS.hall,   flip: true,  bg: C.bg2,
  },
  {
    num: "03", sub: "Skin Tone Refinement", title: "Skin That Glows",
    body: "Indian skin spans a breathtaking spectrum. Each HSL channel is hand-tuned for reds, oranges, and yellows — so every complexion glows naturally.",
    img: IMGS.sikh,   flip: false, bg: C.bg3,
  },
  {
    num: "04", sub: "Cinematic Colour Grade", title: "Finding the Soul",
    body: "Tone curves, split toning, and calibration work together. The mood isn't added — it emerges from colour relationships tuned with deep intention.",
    img: IMGS.garden, flip: true,  bg: C.bg,
  },
  {
    num: "06", sub: "Delivered Work",     title: "The Final Frame",
    body: "Polished, cinematic, and ready. Each image tells the complete story — from the first glance to the final frame.",
    img: IMGS.sikh2,  flip: true,  bg: C.bg3,
  },
];

/* ─── TOOL ICON ──────────────────────────────────────────────── */
function ToolIcon({ abbr, name, sub, color, bg, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ textAlign: "center" }}
    >
      <motion.div
        animate={{ boxShadow: hov ? `0 8px 32px ${color}33` : `0 2px 12px rgba(44,40,37,0.08)` }}
        transition={{ duration: 0.3 }}
        style={{ width: "72px", height: "72px", borderRadius: "14px", background: bg, margin: "0 auto 0.85rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: `1px solid ${color}22` }}
      >
        <motion.div
          animate={{ x: hov ? ["0%", "200%"] : "0%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${color}18 50%, transparent 60%)`, pointerEvents: "none" }}
        />
        <span style={{ fontWeight: 700, fontSize: "1.3rem", color, letterSpacing: "-0.02em", position: "relative", zIndex: 1, fontFamily: "'DM Sans', sans-serif" }}>{abbr}</span>
      </motion.div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.82rem", color: C.dark, fontWeight: 500, marginBottom: "0.2rem" }}>{name}</p>
      <p style={{ color: C.light, fontSize: "0.68rem", fontWeight: 300, lineHeight: 1.4 }}>{sub}</p>
    </motion.div>
  );
}

/* ─── BEFORE/AFTER SLIDER ────────────────────────────────────── */
function SliderComp({ img }) {
  const [pos, setPos] = useState(45);
  const ref = useRef(null);
  const dragging = useRef(false);
  const move = useCallback(clientX => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    setPos(Math.max(2, Math.min(98, ((clientX - left) / width) * 100)));
  }, []);
  useEffect(() => {
    const up = () => { dragging.current = false; };
    const mv = e => { if (dragging.current) move(e.touches ? e.touches[0].clientX : e.clientX); };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", mv);
    window.addEventListener("touchend", up);
    window.addEventListener("touchmove", mv, { passive: false });
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("mousemove", mv); window.removeEventListener("touchend", up); window.removeEventListener("touchmove", mv); };
  }, [move]);
  return (
    <div ref={ref}
      onMouseDown={e => { dragging.current = true; move(e.clientX); }}
      onTouchStart={e => { dragging.current = true; move(e.touches[0].clientX); }}
      style={{ position: "relative", width: "100%", aspectRatio: "4/5", overflow: "hidden", cursor: "ew-resize", userSelect: "none", borderRadius: "6px", boxShadow: `0 12px 40px rgba(44,40,37,0.12)` }}>
      <img src={img} alt="Before" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.15) brightness(0.88)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={img} alt="After" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: "2px", background: C.gold, transform: "translateX(-50%)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "38px", height: "38px", borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${C.gold}88` }}>
          <svg width="16" height="9" viewBox="0 0 16 9" fill="none"><path d="M1 4.5H15M1 4.5L3.5 2M1 4.5L3.5 7M15 4.5L12.5 2M15 4.5L12.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
      </div>
      <span style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "rgba(245,241,235,0.88)", backdropFilter: "blur(6px)", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.mid }}>Before</span>
      <span style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: C.gold, padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "white" }}>After</span>
    </div>
  );
}

/* ─── VIDEO MODAL ────────────────────────────────────────────── */
function VideoModal({ videoId, onClose, videos = [] }) {
  const [activeId, setActiveId] = useState(videoId);
  const activeVideo = videos.find(v => v.id === activeId);
  const suggestions = videos.filter(v => v.id !== activeId);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(14,11,9,0.95)", backdropFilter: "blur(18px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.25rem",
      }}
    >
      {/* ── Close button — always visible top-right of backdrop ── */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: "1rem", right: "1rem",
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
          color: "white", borderRadius: "50%", width: "40px", height: "40px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 10, backdropFilter: "blur(8px)",
          transition: "background 200ms",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      >
        <X size={16} />
      </button>

      {/* ── Modal content ── */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="video-modal-grid"
      >
        {/* ── Main player ── */}
        <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <iframe
              key={activeId}
              src={`https://www.youtube.com/embed/${extractYouTubeId(activeId)}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo?.title || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", display: "block" }}
            />
          </div>
          {activeVideo && (
            <div style={{ background: "#1A1612", padding: "0.9rem 1.1rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", color: "#F5F1EB", lineHeight: 1.4, marginBottom: "0.3rem" }}>{activeVideo.title}</p>
              <p style={{ color: "rgba(245,241,235,0.42)", fontSize: "0.68rem", fontFamily: "'DM Sans', sans-serif" }}>{activeVideo.desc}</p>
            </div>
          )}
        </div>

        {/* ── Suggestions sidebar ── */}
        {suggestions.length > 0 && (
          <div
            className="video-modal-sidebar"
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem", overflowY: "auto", scrollbarWidth: "none", background: "#0F0D0B", borderRadius: "12px", padding: "1rem 0.9rem" }}
          >
            <p style={{ color: "rgba(245,241,235,0.35)", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.25rem", flexShrink: 0 }}>Up next</p>
            {suggestions.map(v => (
              <motion.div
                key={v.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveId(v.id)}
                style={{ cursor: "pointer", borderRadius: "8px", overflow: "hidden", background: "#1C1814", border: "1px solid rgba(245,241,235,0.07)", transition: "border-color 200ms", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(176,141,91,0.45)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(245,241,235,0.07)"}
              >
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(v.id)}/mqdefault.jpg`}
                    alt={v.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(14,11,9,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(176,141,91,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Play size={11} fill="white" color="white" style={{ marginLeft: "2px" }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0.5rem 0.65rem" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.75rem", color: "#F5F1EB", lineHeight: 1.35, marginBottom: "0.15rem" }}>{v.title}</p>
                  <p style={{ color: "rgba(245,241,235,0.38)", fontSize: "0.6rem", fontFamily: "'DM Sans', sans-serif" }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}


/* ─── VIDEO CARD ─────────────────────────────────────────────── */
function VideoCard({ video, onPlay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div whileHover={{ y: -4 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onPlay} style={{ flexShrink: 0, width: "290px", cursor: "pointer", borderRadius: "8px", overflow: "hidden", background: C.card, border: `1px solid ${hov ? C.gold + "55" : C.border}`, transition: "border-color 250ms", boxShadow: hov ? "0 12px 40px rgba(44,40,37,0.14)" : "0 2px 12px rgba(44,40,37,0.06)" }}>
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <img src={`https://img.youtube.com/vi/${extractYouTubeId(video.id)}/maxresdefault.jpg`} alt={video.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 450ms", transform: hov ? "scale(1.05)" : "scale(1)", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: hov ? "rgba(44,40,37,0.25)" : "rgba(44,40,37,0.38)", transition: "background 250ms" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div whileHover={{ scale: 1.1 }} style={{ width: "42px", height: "42px", borderRadius: "50%", background: hov ? C.gold : "rgba(255,255,255,0.88)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 250ms", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
            <Play size={15} fill={hov ? "white" : C.dark} color={hov ? "white" : C.dark} style={{ marginLeft: "2px" }} />
          </motion.div>
        </div>
        <div style={{ position: "absolute", top: "0.6rem", left: "0.6rem", background: C.gold, padding: "0.18rem 0.6rem", borderRadius: "9999px", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "white" }}>{video.cat}</div>
      </div>
      <div style={{ padding: "0.9rem 1rem 1.1rem" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.88rem", color: C.dark, fontWeight: 500, marginBottom: "0.25rem", lineHeight: 1.45 }}>{video.title}</p>
        <p style={{ color: C.light, fontSize: "0.7rem", fontWeight: 300 }}>{video.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function ProcessPage() {
  useSEO({
    title: "Our Creative Process — pictureprefecttones",
    description: "Discover how pictureprefecttones presets are built — from raw capture and colour correction to skin tone refinement, cinematic grading, and final delivery.",
    path: "/process",
  });

  const { content } = useContent();
  const FEATURED_VIDEO_ID = content.featuredVideoId || "mZTw7twXRvk";
  const VIDEOS = content.videos || [];

  const [, setLocation] = useLocation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [videoFilter, setVideoFilter] = useState("All");
  const { isMobile } = useIsMobile();
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionRefs = useRef([]);
  const videoRowRef = useRef(null);

  useEffect(() => {
    const fn = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(Math.min(1, scrollTop / Math.max(1, docH)));
      sectionRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const { top } = ref.getBoundingClientRect();
        if (top < window.innerHeight * 0.6) setActiveStage(i);
      });
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filteredVideos = videoFilter === "All" ? VIDEOS : VIDEOS.filter(v => v.cat === videoFilter);
  const scrollVideos = dir => videoRowRef.current?.scrollBy({ left: dir * 310, behavior: "smooth" });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.dark, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      <Navbar activePath="/process" />

      {/* ── FIXED TIMELINE (desktop only) ──────────────────── */}
      <div className="process-timeline" style={{ position: "fixed", left: "1.5rem", top: "50%", transform: "translateY(-50%)", zIndex: 200, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {STAGES.map((s, i) => (
          <button key={s.id} onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.18rem 0", opacity: activeStage === i ? 1 : 0.28, transition: "all 300ms", transform: activeStage === i ? "translateX(3px)" : "none" }}>
            <div style={{ width: activeStage === i ? "20px" : "6px", height: "1.5px", background: activeStage === i ? C.gold : C.mid, borderRadius: "1px", transition: "all 300ms" }} />
            {activeStage === i && (
              <span style={{ fontSize: "0.46rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{s.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── SCROLL PROGRESS BAR ────────────────────────────── */}
      <div style={{ position: "fixed", top: "var(--nav-h)", left: 0, right: 0, zIndex: 190, height: "2px", background: C.border }}>
        <motion.div style={{ height: "100%", background: `linear-gradient(to right, #8B6B3D, ${C.gold}, #D4AF7A)`, transformOrigin: "left", scaleX: scrollProgress }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, ${C.bg} 0%, ${C.bg2} 60%, ${C.bg3} 100%)`, paddingTop: "calc(var(--nav-h) + 2.5rem)", position: "relative", overflow: "hidden" }}>
        {/* Soft decorative ring */}
        <div style={{ position: "absolute", width: "55vw", height: "55vw", borderRadius: "50%", border: `1px solid ${C.goldSoft}`, top: "-10vw", right: "-10vw", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "35vw", height: "35vw", borderRadius: "50%", border: `1px solid ${C.goldSoft}`, bottom: "5vw", left: "-8vw", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", zIndex: 2, maxWidth: "720px", padding: "0 2rem", width: "100%" }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.8 }}
            style={{ color: C.gold, fontSize: "0.52rem", letterSpacing: "0.44em", textTransform: "uppercase", marginBottom: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
            Behind the edit
          </motion.p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 6.5vw, 5.5rem)", color: C.dark, fontWeight: 600, lineHeight: 1.05, marginBottom: "1.25rem" }}>
            Crafting<br /><em style={{ color: C.gold }}>Visual Stories</em>
          </h1>
          <p style={{ color: C.mid, fontSize: "clamp(0.85rem, 1.3vw, 1rem)", fontWeight: 300, lineHeight: 1.8, maxWidth: "440px", margin: "0 auto 2.5rem" }}>
            From raw footage to cinematic perfection — the discipline, decisions, and details behind every pictureprefecttones preset.
          </p>
        </motion.div>

        {/* Featured video card */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ zIndex: 2, marginTop: "3rem", width: "min(860px, 92vw)" }}>
          <motion.div
            whileHover={{ boxShadow: "0 32px 80px rgba(44,40,37,0.22)" }}
            onClick={() => setFeaturedOpen(true)}
            style={{ position: "relative", aspectRatio: "16/9", borderRadius: "14px", overflow: "hidden", boxShadow: "0 24px 64px rgba(44,40,37,0.16)", cursor: "pointer" }}>
            <img src={`https://img.youtube.com/vi/${extractYouTubeId(FEATURED_VIDEO_ID)}/maxresdefault.jpg`} alt="Featured" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {/* gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,24,20,0.75) 0%, rgba(28,24,20,0.1) 50%, transparent 100%)" }} />
            {/* centered play button */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                style={{ width: "72px", height: "72px", borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 40px ${C.gold}99` }}>
                <Play size={28} fill="white" color="white" style={{ marginLeft: "4px" }} />
              </motion.div>
            </div>
            {/* bottom info */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem 1.75rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: C.gold, padding: "0.18rem 0.65rem", borderRadius: "9999px", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Featured</span>
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "#F5F1EB", lineHeight: 1.3 }}>Inside pictureprefecttones — Full Edit Walkthrough</p>
                <p style={{ color: "rgba(245,241,235,0.5)", fontSize: "0.72rem", marginTop: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>Click to watch the full tutorial</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", zIndex: 2 }}>
          <div style={{ width: "1px", height: "2.2rem", background: `linear-gradient(to bottom, transparent, ${C.gold}80)` }} />
          <p style={{ color: C.gold, fontSize: "0.48rem", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.65 }}>Scroll</p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6 STORY SECTIONS
      ══════════════════════════════════════════════════════ */}
      {STORY.map((s, i) => (
        <section key={i} ref={el => sectionRefs.current[i] = el}
          style={{ background: s.bg, padding: isMobile ? "3.5rem 0" : "7rem 0" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", padding: isMobile ? "0 1.5rem" : "0 2.5rem", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: isMobile ? 0 : (s.flip ? 32 : -32) }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ order: isMobile ? 1 : (s.flip ? 1 : 0) }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.4rem" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.46rem", letterSpacing: "0.28em", color: C.gold, fontWeight: 600 }}>{s.num}</span>
                <div style={{ height: "1px", width: "1.4rem", background: `${C.gold}55` }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.46rem", letterSpacing: "0.28em", textTransform: "uppercase", color: C.light }}>{s.sub}</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: C.dark, fontWeight: 600, lineHeight: 1.15, marginBottom: "1.25rem" }}>{s.title}</h2>
              <p style={{ color: C.mid, fontSize: "0.875rem", fontWeight: 300, lineHeight: 1.9, maxWidth: "380px" }}>{s.body}</p>
            </motion.div>

            {/* Visual */}
            <motion.div initial={{ opacity: 0, x: isMobile ? 0 : (s.flip ? -32 : 32) }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              style={{ order: isMobile ? 0 : (s.flip ? 0 : 1) }}>
              {i === 2 ? (
                <SliderComp img={s.img} />
              ) : (
                <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: "8px", overflow: "hidden", boxShadow: "0 16px 50px rgba(44,40,37,0.12)" }}>
                  <img src={s.img} alt={s.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                      filter: i === 0 ? "saturate(0.18) brightness(0.92)" : i === 1 ? "saturate(0.6) brightness(0.96)" : "none" }} />
                  <div style={{ position: "absolute", bottom: "0.85rem", left: "0.9rem", background: "rgba(245,241,235,0.9)", backdropFilter: "blur(8px)", padding: "0.28rem 0.8rem", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.4rem", border: `1px solid ${C.border}` }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: i === 4 ? "#4CAF50" : C.gold }} />
                    <span style={{ fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.mid, fontFamily: "'DM Sans', sans-serif" }}>
                      {i === 0 ? "Unedited" : i === 4 ? "Delivered" : "In Progress"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      ))}

      {/* ══════════════════════════════════════════════════════
          TOOLS SECTION
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.bg3, padding: "7rem 0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p style={{ color: C.gold, fontSize: "0.52rem", letterSpacing: "0.44em", textTransform: "uppercase", marginBottom: "0.8rem" }}>The toolkit</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: C.dark, fontWeight: 500, marginBottom: "3.5rem" }}>
              Tools of the Craft
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "2.5rem 2rem", justifyItems: "center" }}>
            <ToolIcon abbr="Lr" name="Lightroom"       sub="Primary editing & preset delivery"        color="#31A8FF" bg="#E8F4FF" delay={0}    />
            <ToolIcon abbr="Ps" name="Photoshop"       sub="Compositing & fine retouching"            color="#31A8FF" bg="#E8F4FF" delay={0.1}  />
            <ToolIcon abbr="Cr" name="Camera Raw"      sub="XMP precision adjustments"                color="#2694D4" bg="#E5F2FA" delay={0.2}  />
            <ToolIcon abbr="Da" name="DaVinci Resolve" sub="Colour science & grading reference"       color="#C87820" bg="#FDF0E0" delay={0.3}  />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VIDEO TUTORIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.bg, padding: "7rem 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ color: C.gold, fontSize: "0.52rem", letterSpacing: "0.44em", textTransform: "uppercase", marginBottom: "0.65rem" }}>Watch & learn</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: C.dark, fontWeight: 500 }}>Video Tutorials</h2>
            </div>
            <a href="https://youtube.com/@pictur_perfect_tones" target="_blank" rel="noopener noreferrer"
              style={{ color: C.gold, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${C.gold}55`, paddingBottom: "0.15rem" }}>
              View Channel →
            </a>
          </motion.div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
            {VIDEO_CATS.map(cat => (
              <button key={cat} onClick={() => setVideoFilter(cat)}
                style={{ padding: "0.38rem 1rem", borderRadius: "9999px", border: `1px solid ${videoFilter === cat ? C.gold : C.border}`, background: videoFilter === cat ? C.gold : "transparent", color: videoFilter === cat ? "white" : C.mid, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 200ms" }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <div ref={videoRowRef} style={{ display: "flex", gap: "1rem", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "0.5rem" }}>
              <AnimatePresence>
                {filteredVideos.map((v, i) => (
                  <motion.div key={v.id + i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                    <VideoCard video={v} onPlay={() => setActiveVideo(v.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filteredVideos.length > 3 && (
              <>
                <button onClick={() => scrollVideos(-1)} style={{ position: "absolute", left: "-1.1rem", top: "40%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(44,40,37,0.1)" }}>
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => scrollVideos(1)} style={{ position: "absolute", right: "-1.1rem", top: "40%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(44,40,37,0.1)" }}>
                  <ChevronRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GLOBAL CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: C.bg2, padding: "7rem 2rem", textAlign: "center" }}>
        <div style={{ position: "absolute", display: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p style={{ color: C.gold, fontSize: "0.52rem", letterSpacing: "0.44em", textTransform: "uppercase", marginBottom: "0.85rem" }}>Ready to begin?</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: C.dark, fontWeight: 600, marginBottom: "2.25rem" }}>
            Start with a Preset
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setLocation("/shop")}
              style={{ padding: "0.95rem 2.75rem", background: C.dark, color: "#F5F1EB", border: "none", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderRadius: "2px" }}>
              Explore Presets
            </motion.button>
            <motion.a whileHover={{ scale: 1.03 }} href="https://youtube.com/@pictur_perfect_tones" target="_blank" rel="noopener noreferrer"
              style={{ padding: "0.95rem 2.25rem", background: "transparent", color: C.mid, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, borderRadius: "2px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Watch Tutorials
            </motion.a>
          </div>
        </motion.div>
      </section>

      <Footer />

      <AnimatePresence>
        {featuredOpen && <VideoModal videoId={FEATURED_VIDEO_ID} onClose={() => setFeaturedOpen(false)} videos={VIDEOS} />}
        {activeVideo && <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} videos={VIDEOS} />}
      </AnimatePresence>
    </div>
  );
}
