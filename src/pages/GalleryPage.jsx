import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "../hooks/useSEO";
import { Link } from "wouter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useContent } from "../context/ContentContext";

/* ─── MEDIA DATA ──────────────────────────────────────────── */
const MEDIA = [
  { id: 1,  type: "photo",  src: "/images/gallery/bride-portrait.jpg",   alt: "Bridal portrait",            aspect: "tall"     },
  { id: 2,  type: "photo",  src: "/images/gallery/sikh-couple.webp",     alt: "Sikh wedding couple",        aspect: "wide"     },
  { id: 3,  type: "reel",   src: "/videos/reel-2.mp4",                                                        alt: "Where passion meets pixels", aspect: "reel" },
  { id: 4,  type: "photo",  src: "/images/gallery/bride-garden.webp",    alt: "Bride in garden",            aspect: "tall"     },
  { id: 5,  type: "photo",  src: "/images/gallery/couple-hall.webp",     alt: "Couple at reception",        aspect: "tall"     },
  { id: 6,  type: "photo",  src: "/images/gallery/dress-20.webp",        alt: "Bridal party at palace",     aspect: "wide"     },
  { id: 7,  type: "reel",   src: "/videos/reel-1.mp4",                                                             alt: "Each photo is a blank canvas", aspect: "reel" },
  { id: 8,  type: "photo",  src: "/images/gallery/editorial-2.jpg",      alt: "Editorial wedding",          aspect: "wide"     },
  { id: 9,  type: "photo",  src: "/images/c-red-bride.webp",             alt: "Red bridal lehenga",         aspect: "tall"     },
  { id: 10, type: "photo",  src: "/images/gallery/dress-16.webp",        alt: "Designer dress detail",      aspect: "tall"     },
  { id: 11, type: "photo",  src: "/images/gallery/sikh-couple-2.webp",   alt: "Sikh wedding ceremony",      aspect: "wide"     },
  { id: 12, type: "reel",   src: "/videos/reel-3.mp4", alt: "Indian wedding Lightroom presets", aspect: "reel" },
  { id: 13, type: "photo",  src: "/images/gallery/editorial-3.jpg",      alt: "Candid wedding moment",      aspect: "tall"     },
  { id: 14, type: "photo",  src: "/images/c-garden-couple.jpg",          alt: "Garden couple portrait",     aspect: "wide"     },
  { id: 15, type: "photo",  src: "/images/c-sikhwedding.webp",           alt: "Sikh wedding ritual",        aspect: "wide"     },
  { id: 16, type: "photo",  src: "/images/gallery/dress-14.webp",        alt: "Bridal lehenga detail",      aspect: "tall"     },
  { id: 17, type: "reel",   src: "/videos/reel-2.mp4", alt: "Where passion meets pixels", aspect: "reel" },
  { id: 18, type: "photo",  src: "/images/gallery/editorial-1.webp",     alt: "Bridal editorial",           aspect: "tall"     },
  { id: 19, type: "photo",  src: "/images/c-celebration.jpg",            alt: "Celebration moment",         aspect: "wide"     },
  { id: 20, type: "photo",  src: "/images/gallery/editorial-4.jpg",      alt: "Artistic wedding shot",      aspect: "wide"     },
  { id: 21, type: "photo",  src: "/images/c-ivory-bride.jpg",            alt: "Ivory bridal look",          aspect: "tall"     },
  { id: 22, type: "photo",  src: "/images/c-sofa-bride.jpg",             alt: "Bridal detail shot",         aspect: "wide"     },
  { id: 23, type: "reel",   src: "/videos/reel-1.mp4", alt: "Each photo is a blank canvas", aspect: "reel" },
  { id: 24, type: "photo",  src: "/images/photo-1.webp",                 alt: "Wedding portrait",           aspect: "tall"     },
];

/* ─── ASPECT RATIO HELPERS ────────────────────────────────── */
const reelAspect = {
  reel: "9/16",
  wide: "16/9",
  sq:   "1/1",
  tall: "3/4",
};

/* ─── ICONS ───────────────────────────────────────────────── */
function PlayIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>
      <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <polygon points="10,8 17,12 10,16" fill="white" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ─── VIDEO TILE ──────────────────────────────────────────── */
function VideoTile({ item, onClick }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { video.play().catch(() => {}); }
        else { video.pause(); }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: "relative", width: "100%",
        aspectRatio: reelAspect[item.aspect] || "9/16",
        cursor: "pointer", overflow: "hidden", background: "#1a1614",
      }}
    >
      <video
        ref={ref}
        src={item.src}
        muted loop playsInline preload="auto"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: hovered ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.08)",
        transition: "background 300ms",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {hovered && <PlayIcon />}
      </div>
      <div style={{
        position: "absolute", top: "0.6rem", right: "0.6rem",
        background: "rgba(176,141,91,0.9)", color: "#fff",
        fontSize: "0.45rem", letterSpacing: "0.18em", textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        padding: "0.25rem 0.5rem", borderRadius: "2px",
      }}>Reel</div>
    </div>
  );
}

/* ─── IMAGE TILE ──────────────────────────────────────────── */
function ImageTile({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ position: "relative", cursor: "pointer", overflow: "hidden", background: "#2C2825", display: "block" }}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        style={{
          width: "100%", height: "auto", display: "block",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: hovered ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0)",
        transition: "background 350ms",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ opacity: hovered ? 1 : 0, transform: hovered ? "scale(1)" : "scale(0.8)", transition: "all 300ms 50ms" }}>
          <EyeIcon />
        </div>
      </div>
    </div>
  );
}

/* ─── LIGHTBOX ────────────────────────────────────────────── */
function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index];
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(10,8,7,0.96)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={onClose}
      >
        {/* Nav buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{ position: "fixed", left: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", zIndex: 1, transition: "background 200ms" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <ChevronLeft />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{ position: "fixed", right: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", zIndex: 1, transition: "background 200ms" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <ChevronRight />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "fixed", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", transition: "background 200ms" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <CloseIcon />
        </button>

        {/* Counter */}
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", letterSpacing: "0.2em", fontFamily: "'DM Sans', sans-serif" }}>
          {index + 1} / {items.length}
        </div>

        {/* Media */}
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: item.type === "reel" ? "380px" : "90vw", maxHeight: "88vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {item.type === "photo" ? (
            <img
              src={item.src}
              alt={item.alt}
              style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain", borderRadius: "4px", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
            />
          ) : (
            <video
              src={item.src}
              controls
              autoPlay
              muted
              loop
              style={{ maxWidth: "100%", maxHeight: "88vh", borderRadius: "4px", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── GALLERY ITEM WRAPPER ────────────────────────────────── */
function GalleryItem({ item, index, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: "0.45rem", breakInside: "avoid", borderRadius: "3px", overflow: "hidden" }}
    >
      {item.type === "photo" ? (
        <ImageTile item={item} onClick={() => onOpen(index)} />
      ) : (
        <VideoTile item={item} onClick={() => onOpen(index)} />
      )}
    </motion.div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────── */
const FILTERS = ["All", "Photos", "Reels"];

export default function GalleryPage() {
  useSEO({
    title: "Gallery — pictureprefecttones",
    description: "Browse real wedding images edited with pictureprefecttones Lightroom presets. See the transformation across ceremonies, portraits, receptions, and golden hour shots.",
    path: "/gallery",
  });
  const { content } = useContent();
  const mediaItems = content.media || MEDIA;
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = mediaItems.filter((m) => {
    if (filter === "All") return true;
    if (filter === "Photos") return m.type === "photo";
    if (filter === "Videos") return m.type === "video";
    if (filter === "Reels") return m.type === "reel";
    return true;
  });

  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevItem = useCallback(() => setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length), [filtered.length]);
  const nextItem = useCallback(() => setLightboxIndex((i) => (i + 1) % filtered.length), [filtered.length]);

  useEffect(() => { if (lightboxIndex !== null) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [lightboxIndex]);

  return (
    <div style={{ background: "#F5F1EB", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      <Navbar activePath="/gallery" />

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "calc(var(--nav-h) + 1.5rem) 2.5rem 2rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.1rem" }}>
            <div style={{ width: "2rem", height: "1px", background: "#B08D5B" }} />
            <span style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.42em", textTransform: "uppercase", fontWeight: 500 }}>The Visual Archive</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 5vw, 4.2rem)", color: "#1E1B18", fontWeight: 400, lineHeight: 1.05, margin: 0 }}>
              Moments That<br /><span style={{ fontStyle: "italic", color: "#B08D5B", fontWeight: 300 }}>Live Forever</span>
            </h1>
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", paddingBottom: "0.3rem" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: "50px",
                    border: filter === f ? "1px solid #B08D5B" : "1px solid rgba(44,40,37,0.18)",
                    background: filter === f ? "#B08D5B" : "transparent",
                    color: filter === f ? "#fff" : "#7A7065",
                    fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500,
                    cursor: "pointer", transition: "all 200ms",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        <div style={{ height: "1px", background: "rgba(44,40,37,0.1)", marginTop: "2rem" }} />
      </section>

      {/* ── MASONRY GRID ────────────────────────────────────── */}
      <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "0.5rem clamp(0.5rem, 3vw, 2rem) 5rem" }}>
        <div className="gallery-masonry">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <GalleryItem key={item.id} item={item} index={i} onOpen={openLightbox} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#7A7065", fontWeight: 300 }}>
            No items in this category yet.
          </div>
        )}
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <Footer />

      {/* ── LIGHTBOX ────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </div>
  );
}
