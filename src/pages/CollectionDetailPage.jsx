import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useSEO } from "../hooks/useSEO";
import { useLocation, useParams } from "wouter";
import Footer from "../components/Footer";
import { useIsMobile } from "../hooks/useWindowSize";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";
import { useContent } from "../context/ContentContext";

function CollectionCartBtn() {
  const { cartCount, setCartOpen } = useCart();
  return (
    <button
      onClick={() => setCartOpen(true)}
      aria-label="Open cart"
      style={{
        position: "relative",
        background: "rgba(44,40,37,0.07)",
        border: "1px solid rgba(44,40,37,0.14)",
        color: "#2C2825",
        cursor: "pointer",
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 220ms",
        flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(44,40,37,0.14)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(44,40,37,0.07)"}
    >
      <ShoppingBag size={16} strokeWidth={1.5} />
      {cartCount > 0 && (
        <span style={{
          position: "absolute",
          top: -4,
          right: -4,
          background: "#B08D5B",
          color: "white",
          fontSize: "0.55rem",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          minWidth: 16,
          height: 16,
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 3px",
        }}>
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );
}

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const BEFORE_FILTER = "saturate(0.42) brightness(0.82) contrast(0.88)";

const COLLECTION_DATA = {
  ivory: {
    name: "The Ivory Edit",
    tagline: "Soft, ethereal luminosity for intimate moments",
    description: "Film-like luminosity that keeps whites luminous, skin tones warm, and shadows open. Built for candlelit halls, morning ghee rituals, and the quiet moments between the ceremony.",
    price: "₹3,999",
    badge: null,
    style: "Soft · Warm · Luminous",
    count: 12,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-ivory-bride.jpg",
    pairs: [
      { img: "/images/c-ivory-bride.jpg" },
      { img: "/images/c-ivory-stairs.jpg" },
      { img: "/images/c-ivory-walk.jpg" },
    ],
    gallery: [
      "/images/c-ivory-couple.jpg",
      "/images/photo-2.jpg",
      "/images/photo-3.jpg",
      "/images/photo-4.jpg",
      "/images/photo-5.jpg",
      "/images/photo-6.jpg",
    ],
  },
  crimson: {
    name: "The Crimson Edit",
    tagline: "Dramatic, regal richness for traditional ceremonies",
    description: "Deep reds stay commanding, not muddy. Gold embroidery gleams. Skin tones stay accurate across every complexion. Built for the visual abundance of Indian bridal fashion.",
    price: "₹4,499",
    badge: "Bestseller",
    style: "Dramatic · Regal · Moody",
    count: 14,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-red-twirl.jpg",
    pairs: [
      { img: "/images/c-red-twirl.jpg" },
      { img: "/images/c-red-seated.webp" },
      { img: "/images/c-red-bride.webp" },
    ],
    gallery: [
      "/images/c-sikhwedding.webp",
      "/images/c-mandap.jpg",
      "/images/photo-7.jpg",
      "/images/photo-8.jpg",
      "/images/photo-1.webp",
      "/images/c-jewelry.jpg",
    ],
  },
  heritage: {
    name: "The Heritage Edit",
    tagline: "Cinematic warmth for palaces and heritage venues",
    description: "Inspired by Rajputana forts and candlelit mandaps. Rich shadows, honeyed highlights, and a cinematic depth that makes every frame feel like a film still.",
    price: "₹5,499",
    badge: "New",
    style: "Cinematic · Warm · Timeless",
    count: 16,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-sofa-bride.jpg",
    pairs: [
      { img: "/images/c-sofa-bride.jpg" },
      { img: "/images/c-window.jpg" },
      { img: "/images/c-mandap.jpg" },
    ],
    gallery: [
      "/images/c-jewelry.jpg",
      "/images/photo-6.jpg",
      "/images/photo-7.jpg",
      "/images/photo-8.jpg",
      "/images/photo-2.jpg",
      "/images/c-ivory-stairs.jpg",
    ],
  },
  celebration: {
    name: "The Celebration Edit",
    tagline: "Vivid, joyful, true-to-life colour",
    description: "Vibrant tones without blowing out skies or pushing colours into neon. Perfect for open-air ceremonies, mehndi afternoons, and the colour-drenched energy of sangeet nights.",
    price: "₹3,499",
    badge: null,
    style: "Vivid · Joyful · Radiant",
    count: 10,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-celebration.jpg",
    pairs: [
      { img: "/images/c-celebration.jpg" },
      { img: "/images/c-garden-couple.jpg" },
      { img: "/images/c-sikhwedding.webp" },
    ],
    gallery: [
      "/images/photo-1.webp",
      "/images/photo-2.jpg",
      "/images/photo-3.jpg",
      "/images/photo-4.jpg",
      "/images/photo-5.jpg",
      "/images/c-ivory-walk.jpg",
    ],
  },
  golden: {
    name: "The Golden Hour Edit",
    tagline: "Honeyed light and sunlit warmth",
    description: "Captures the magic of couples shooting at dusk — the long shadows, warm skies, and a glow that makes every frame feel like a memory you never want to let go.",
    price: "₹3,999",
    badge: null,
    style: "Warm · Glowing · Sunlit",
    count: 12,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-garden-couple.jpg",
    pairs: [
      { img: "/images/c-garden-couple.jpg" },
      { img: "/images/c-ivory-walk.jpg" },
      { img: "/images/c-ivory-stairs.jpg" },
    ],
    gallery: [
      "/images/photo-4.jpg",
      "/images/photo-5.jpg",
      "/images/photo-6.jpg",
      "/images/photo-7.jpg",
      "/images/photo-8.jpg",
      "/images/c-celebration.jpg",
    ],
  },
  portrait: {
    name: "The Portrait Edit",
    tagline: "Clean skin tones, natural detail",
    description: "Every skin tone, rendered faithfully. Every jewellery detail, sharp and true. A versatile preset that elevates without overwhelming — the one you'll reach for every single session.",
    price: "₹2,999",
    badge: null,
    style: "Clean · Natural · Faithful",
    count: 8,
    format: "XMP + DNG",
    compat: "Lightroom Mobile & Desktop",
    hero: "/images/c-ivory-couple.jpg",
    pairs: [
      { img: "/images/c-ivory-couple.jpg" },
      { img: "/images/c-ivory-bride.jpg" },
      { img: "/images/c-jewelry.jpg" },
    ],
    gallery: [
      "/images/photo-7.jpg",
      "/images/photo-8.jpg",
      "/images/photo-1.webp",
      "/images/photo-2.jpg",
      "/images/c-window.jpg",
      "/images/c-red-bride.webp",
    ],
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};

function PortraitImage({ src, filter, zoom, style = {} }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "150%", borderRadius: "16px", overflow: "hidden", ...style }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", filter: filter || "none",
          transform: zoom ? "scale(1.03)" : "scale(1)",
          transition: "transform 700ms cubic-bezier(0.25,1,0.5,1)",
        }}
      />
    </div>
  );
}


const AFTER_FILTER  = "saturate(1.06) brightness(1.02) contrast(1.01)";
const LENS_R = 82;

function SliderPair({ img, before: beforeSrc, after: afterSrc, mode }) {
  const bSrc = beforeSrc || img;
  const aSrc = afterSrc || img;
  const [pos,  setPos]  = useState(42);
  const [lens, setLens] = useState({ x: 0, y: 0, active: false });
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const isSlider = mode !== "lens";

  const moveSlider = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos((Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width) * 100);
  }, []);

  const moveLens = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLens({ x: clientX - rect.left, y: clientY - rect.top, active: true });
  }, []);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("touchend", up); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderRadius: "1rem", overflow: "hidden" }}
    >
      <div
        ref={containerRef}
        style={{ position: "relative", overflow: "hidden", aspectRatio: "2/3", cursor: isSlider ? "col-resize" : "none", userSelect: "none" }}
        onMouseMove={e => { if (isSlider) { if (dragging.current) moveSlider(e.clientX); } else moveLens(e.clientX, e.clientY); }}
        onMouseDown={e => { if (isSlider) { dragging.current = true; moveSlider(e.clientX); } }}
        onMouseLeave={() => { if (!isSlider) setLens(l => ({ ...l, active: false })); }}
        onTouchMove={e => { e.preventDefault(); if (isSlider) moveSlider(e.touches[0].clientX); else moveLens(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchStart={e => { if (isSlider) moveSlider(e.touches[0].clientX); else moveLens(e.touches[0].clientX, e.touches[0].clientY); }}
      >
        {/* Before — desaturated base */}
        <img src={bSrc} alt="Before preset" draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: BEFORE_FILTER }} />

        {/* After — slider mode */}
        {isSlider && (
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={aSrc} alt="After preset" draggable={false}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: AFTER_FILTER }} />
          </div>
        )}

        {/* After — lens mode */}
        {!isSlider && lens.active && (
          <div style={{ position: "absolute", inset: 0, clipPath: `circle(${LENS_R}px at ${lens.x}px ${lens.y}px)`, overflow: "hidden" }}>
            <img src={aSrc} alt="After preset" draggable={false}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: AFTER_FILTER, transform: "scale(1.22)", transformOrigin: `${lens.x}px ${lens.y}px` }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle ${LENS_R}px at ${lens.x}px ${lens.y}px, transparent 55%, rgba(0,0,0,0.18) 100%)` }} />
          </div>
        )}

        {/* Slider labels */}
        {isSlider && <>
          <div style={{ position: "absolute", bottom: "14px", left: "16px", background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.65)", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", padding: "0.22rem 0.6rem", borderRadius: "9999px", fontFamily: "'DM Sans', sans-serif", pointerEvents: "none" }}>Before</div>
          <div style={{ position: "absolute", bottom: "14px", right: "16px", background: "rgba(176,141,91,0.88)", color: "white", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", padding: "0.22rem 0.6rem", borderRadius: "9999px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, pointerEvents: "none" }}>After</div>
        </>}

        {/* Slider divider + handle */}
        {isSlider && (
          <div style={{ position: "absolute", top: 0, bottom: 0, zIndex: 20, pointerEvents: "none", left: `${pos}%`, transform: "translateX(-50%)" }}>
            <div style={{ height: "100%", width: "1.5px", background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)", boxShadow: "0 0 8px 2px rgba(176,141,91,0.5)" }} />
            <div style={{ position: "absolute", top: "50%", right: "8px", transform: "translateY(-50%)", pointerEvents: "auto", cursor: "col-resize" }}>
              <svg width="16" height="28" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9L9 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "8px", transform: "translateY(-50%)", pointerEvents: "auto", cursor: "col-resize" }}>
              <svg width="16" height="28" viewBox="0 0 10 18" fill="none"><path d="M1 1L9 9L1 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        )}

        {/* Lens ring + sheen */}
        {!isSlider && lens.active && (<>
          <div style={{ position: "absolute", pointerEvents: "none", zIndex: 25, left: lens.x, top: lens.y, width: LENS_R * 2, height: LENS_R * 2, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "1px solid rgba(201,169,110,0.55)", boxShadow: "0 0 0 3px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", pointerEvents: "none", zIndex: 26, left: lens.x, top: lens.y, width: LENS_R * 2 - 4, height: LENS_R * 2 - 4, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(ellipse at 32% 26%, rgba(255,250,235,0.14) 0%, transparent 48%)" }} />
        </>)}
      </div>
    </motion.div>
  );
}

export default function CollectionDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [revealMode, setRevealMode] = useState("slider");
  const [addedAnim, setAddedAnim] = useState(false);
  const { isMobile, isTablet } = useIsMobile();
  const { addItem } = useCart();
  const { content } = useContent();

  const col = (content.collectionData || COLLECTION_DATA)[id];

  const handleAddToCart = () => {
    if (!col) return;
    addItem({ id, name: col.name, price: col.price, img: col.hero });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  useSEO({
    title: col ? `${col.name} — pictureprefecttones` : "Collection — pictureprefecttones",
    description: col ? `${col.tagline}. ${col.count} Lightroom presets for Indian wedding photography. ${col.style}. Instant download — XMP + DNG.` : "Premium Lightroom preset collection for Indian wedding photographers.",
    path: `/collection/${id}`,
  });

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!col) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F1EB", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#2C2825", marginBottom: "1rem" }}>Collection not found</p>
          <button onClick={() => setLocation("/shop")} style={{ background: "#B08D5B", color: "white", border: "none", padding: "0.75rem 2rem", cursor: "pointer", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "0.7rem", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px" }}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1EB", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes kb-detail { from { transform: scale(1); } to { transform: scale(1.05); } }
      `}</style>

      {/* Grain */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, backgroundSize: "160px", opacity: 0.038, pointerEvents: "none", zIndex: 100, mixBlendMode: "multiply" }} />

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="collection-detail-nav" style={{ position: "sticky", top: 0, zIndex: 50, padding: "1.25rem 2.5rem", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", background: "rgba(245,241,235,0.94)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(176,141,91,0.1)" }}>
        <button
          onClick={() => setLocation("/shop")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.45rem", color: "#2C2825", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
        >
          <svg width="15" height="10" viewBox="0 0 15 10" fill="none">
            <path d="M1 5H14M1 5L4.5 1.5M1 5L4.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          All Collections
        </button>
        <span onClick={() => setLocation("/")} style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontStyle: "italic", fontWeight: 600, color: "#2C2825", cursor: "pointer" }}>
          pictureprefecttones
        </span>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CollectionCartBtn />
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "2.5rem 1.25rem 3rem" : isTablet ? "2.5rem 2rem 3.5rem" : "3rem 2rem 4rem", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "4rem", alignItems: "center" }}>

        {/* Left — hero image */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 60px rgba(0,0,0,0.12)" }}>
          <div style={{ paddingBottom: "150%", position: "relative" }}>
            <img
              src={col.hero}
              alt={col.name}
              draggable={false}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "kb-detail 12s ease-in-out infinite alternate" }}
            />
          </div>
          {col.badge && (
            <div style={{ position: "absolute", top: "1.25rem", left: "1.25rem", background: "#B08D5B", color: "white", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", padding: "0.28rem 0.72rem", borderRadius: "9999px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
              {col.badge}
            </div>
          )}
        </motion.div>

        {/* Right — info */}
        <motion.div variants={fadeUp} custom={0.15} initial="hidden" animate="visible">
          <p style={{ color: "#B08D5B", fontSize: "0.58rem", letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'DM Sans', sans-serif" }}>
            Lightroom Preset Collection
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "#2C2825", fontWeight: 500, lineHeight: 1.1, marginBottom: "0.75rem" }}>
            {col.name}
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#9A9088", fontSize: "1rem", marginBottom: "1.75rem" }}>
            {col.tagline}
          </p>
          <p style={{ color: "#5A544D", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.8, marginBottom: "2.25rem", maxWidth: "30rem" }}>
            {col.description}
          </p>

          {/* Price */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ color: "#9A9088", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.2rem" }}>
              One-time purchase
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#2C2825", fontWeight: 500, lineHeight: 1 }}>
              {col.price}
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <button
              onClick={handleAddToCart}
              style={{ padding: "1rem 2.5rem", background: "#2C2825", color: "#F5EDE0", border: "none", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderRadius: "2px", transition: "background 250ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
              onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              style={{ padding: "1rem 2rem", background: addedAnim ? "#2C2825" : "transparent", color: addedAnim ? "#F5EDE0" : "#2C2825", border: addedAnim ? "1px solid #2C2825" : "1px solid rgba(44,40,37,0.25)", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderRadius: "2px", transition: "all 250ms" }}
              onMouseEnter={e => { if (!addedAnim) { e.currentTarget.style.background = "#2C2825"; e.currentTarget.style.color = "#F5EDE0"; } }}
              onMouseLeave={e => { if (!addedAnim) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2C2825"; } }}
            >
              {addedAnim ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>

          <p style={{ color: "#9A9088", fontSize: "0.7rem", fontWeight: 300, letterSpacing: "0.04em" }}>
            Instant download &nbsp;·&nbsp; Lightroom compatible
          </p>

          {/* Quick spec strip */}
          <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(44,40,37,0.1)", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Presets", value: `${col.count} included` },
              { label: "Format", value: col.format },
              { label: "Works with", value: col.compat },
            ].map(s => (
              <div key={s.label}>
                <div style={{ color: "#9A9088", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.2rem" }}>{s.label}</div>
                <div style={{ color: "#2C2825", fontSize: "0.82rem", fontWeight: 400 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── TRANSFORMATIONS ───────────────────────────────── */}
      <section style={{ background: "#EDEAE4", padding: "5rem 0 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header — matches homepage Transformation section exactly */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center", marginBottom: "3rem", padding: "0 2rem" }}
          >
            <p style={{ color: "#B08D5B", fontSize: "0.625rem", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'DM Sans', sans-serif" }}>
              The Transformation
            </p>
            {/* Ornament divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.75rem" }}>
              <div style={{ height: "1px", width: "3rem", background: "rgba(176,141,91,0.4)" }} />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(176,141,91,0.5)" }} />
              <div style={{ height: "1px", width: "3rem", background: "rgba(176,141,91,0.4)" }} />
            </div>

            {/* Mode toggle — identical to homepage */}
            <div style={{ display: "inline-flex", background: "rgba(44,40,37,0.07)", borderRadius: "9999px", padding: "4px", marginBottom: "1.25rem", gap: "2px" }}>
              {[
                { id: "slider", label: "⟺  Slider" },
                { id: "lens",   label: "◉  Lens Reveal" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setRevealMode(id)}
                  style={{
                    padding: "0.45rem 1.2rem",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    transition: "all 200ms ease",
                    background: revealMode === id ? "#B08D5B" : "transparent",
                    color: revealMode === id ? "#FAFAF8" : "#7A7065",
                    boxShadow: revealMode === id ? "0 1px 6px rgba(176,141,91,0.35)" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <p style={{ color: "#7A7065", fontSize: "0.875rem", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              One preset. Every story transformed.
            </p>
          </motion.div>

          {/* ba-grid — same class as homepage (repeat(3,1fr) → 2col → 1col) */}
          <div className="ba-grid">
            {col.pairs.map((pair, i) => (
              <SliderPair key={i} before={pair.before || pair.img} after={pair.after || pair.img} mode={revealMode} />
            ))}
          </div>

          <div style={{ height: "4rem" }} />
        </div>
      </section>


      {/* ── GALLERY ───────────────────────────────────────── */}
      <section style={{ background: "#EDEAE4", padding: "2rem 0 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ color: "#B08D5B", fontSize: "0.58rem", letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>
              Edited with this preset
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", color: "#2C2825", fontWeight: 500 }}>
              Gallery
            </h2>
          </motion.div>

          <div style={{ columns: "auto 240px", columnGap: "10px" }}>
            {(col.gallery || []).map((src, i) => (
              <motion.div
                key={i}
                variants={fadeUp} custom={i * 0.05} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                style={{ breakInside: "avoid", marginBottom: "10px", borderRadius: "8px", overflow: "hidden" }}
              >
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  style={{ width: "100%", display: "block", objectFit: "cover", transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </motion.div>
            ))}
            {(col.gallery || []).length === 0 && (
              <p style={{ textAlign: "center", color: "#9A9189", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", padding: "3rem 0" }}>
                No gallery images yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <motion.section
        variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
        style={{ padding: "7rem 2rem", textAlign: "center" }}
      >
        <p style={{ color: "#B08D5B", fontSize: "0.58rem", letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: "1rem", fontFamily: "'DM Sans', sans-serif" }}>
          Ready to transform your edits?
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2825", fontWeight: 500, marginBottom: "0.5rem" }}>
          Get {col.name}
        </h2>
        <p style={{ color: "#9A9088", fontSize: "0.88rem", fontWeight: 300, marginBottom: "0.35rem" }}>
          {col.count} presets · {col.price} · Instant download
        </p>
        <p style={{ color: "#B8AFA6", fontSize: "0.72rem", fontWeight: 300, marginBottom: "2.75rem" }}>
          Lightroom Mobile &amp; Desktop · XMP + DNG
        </p>

        <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{ padding: "1.1rem 3rem", background: "#2C2825", color: "#F5EDE0", border: "none", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderRadius: "2px", transition: "background 250ms" }}
            onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
            onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
          >
            Get This Collection
          </button>
          <button
            onClick={() => setLocation("/shop")}
            style={{ padding: "1.1rem 2.25rem", background: "transparent", color: "#5A544D", border: "1px solid rgba(44,40,37,0.2)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, borderRadius: "2px", transition: "all 250ms" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(44,40,37,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Explore More Collections
          </button>
        </div>
      </motion.section>

      <Footer />

    </div>
  );
}
