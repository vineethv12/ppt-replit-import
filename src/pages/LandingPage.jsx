import { useEffect, useState, useRef, useCallback } from "react";
import { useIsMobile } from "../hooks/useWindowSize";
import { useSEO } from "../hooks/useSEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useContent } from "../context/ContentContext";

const LENS_R = 82;

function BeforeAfterSlider({ beforeSrc, afterSrc, alt, mode }) {
  const [pos, setPos] = useState(50);
  const [lens, setLens] = useState({ x: 0, y: 0, active: false });
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const moveSlider = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
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

  const isSlider = mode !== "lens";
  const clipAfter = `inset(0 ${100 - pos}% 0 0)`;

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", overflow: "hidden", aspectRatio: "2/3", borderRadius: "1rem", cursor: isSlider ? "col-resize" : "none", userSelect: "none" }}
      onMouseMove={e => { if (isSlider) { if (dragging.current) moveSlider(e.clientX); } else moveLens(e.clientX, e.clientY); }}
      onMouseDown={e => { if (isSlider) { dragging.current = true; moveSlider(e.clientX); } }}
      onMouseLeave={() => { if (!isSlider) setLens(l => ({ ...l, active: false })); }}
      onTouchMove={e => { e.preventDefault(); if (isSlider) moveSlider(e.touches[0].clientX); else moveLens(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchStart={e => { if (isSlider) moveSlider(e.touches[0].clientX); else moveLens(e.touches[0].clientX, e.touches[0].clientY); }}
    >
      {/* Before image */}
      <img src={beforeSrc} alt={alt} draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* After image — clipped (slider mode) */}
      {isSlider && (
        <div style={{ position: "absolute", inset: 0, clipPath: clipAfter }}>
          <img src={afterSrc} alt={alt} draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* After image — magnifier lens (lens mode) */}
      {!isSlider && lens.active && (
        <div style={{
          position: "absolute", inset: 0,
          clipPath: `circle(${LENS_R}px at ${lens.x}px ${lens.y}px)`,
          overflow: "hidden",
        }}>
          <img src={afterSrc} alt={alt} draggable={false}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transform: "scale(1.22)",
              transformOrigin: `${lens.x}px ${lens.y}px`,
            }} />
          {/* Subtle inner vignette to reinforce glass feel */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle ${LENS_R}px at ${lens.x}px ${lens.y}px, transparent 55%, rgba(0,0,0,0.18) 100%)`,
          }} />
        </div>
      )}

      {/* SLIDER MODE: divider line + chevrons */}
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

      {/* LENS MODE: glass ring border */}
      {!isSlider && lens.active && (
        <>
          {/* Outer ring — clean golden glass edge */}
          <div style={{
            position: "absolute", pointerEvents: "none", zIndex: 25,
            left: lens.x, top: lens.y,
            width: LENS_R * 2, height: LENS_R * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid rgba(201,169,110,0.55)",
            boxShadow: "0 0 0 3px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)",
          }} />
          {/* Glass highlight arc — top-left sheen */}
          <div style={{
            position: "absolute", pointerEvents: "none", zIndex: 26,
            left: lens.x, top: lens.y,
            width: LENS_R * 2 - 4, height: LENS_R * 2 - 4,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 32% 26%, rgba(255,250,235,0.14) 0%, transparent 48%)",
          }} />
          {/* Tiny crosshair — 2 fine lines, 14px each side */}
          <div style={{
            position: "absolute", pointerEvents: "none", zIndex: 27,
            left: lens.x, top: lens.y,
            transform: "translate(-50%, -50%)",
            width: 28, height: 28,
          }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.55)", transform: "translateY(-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.55)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 4, height: 4, borderRadius: "50%", background: "rgba(201,169,110,0.9)", transform: "translate(-50%,-50%)", boxShadow: "0 0 5px rgba(201,169,110,0.7)" }} />
          </div>
        </>
      )}

      {/* LENS MODE: hover hint when not hovering */}
      {!isSlider && !lens.active && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 15, pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)",
            borderRadius: "9999px", padding: "0.45rem 1rem",
            color: "rgba(255,255,255,0.65)", fontSize: "0.65rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            Move to reveal
          </div>
        </div>
      )}
    </div>
  );
}

const TESTIMONIAL_IMAGES = [
  "/images/t1.webp",
  "/images/t2.webp",
  "/images/t3.webp",
  "/images/t4.webp",
];

const PRESET_GRADES = [
  { overlay: "rgba(170,190,215,0.10)", quote: "Every frame transformed effortlessly —\ninto something truly unforgettable." },
  { overlay: "rgba(215,140,75,0.10)",  quote: "What we captured was beautiful —\nwhat it became was extraordinary." },
  { overlay: "rgba(230,210,175,0.09)", quote: "Effortless edits.\nStunning, story-driven results." },
  { overlay: "rgba(160,100,45,0.11)",  quote: "Where every detail is elevated —\nwith just a single preset." },
];

/* ─── FAQ DATA ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What are Lightroom presets and how do they work?",
    a: "Lightroom presets are one-click editing profiles that apply a curated look to your photos instantly. Each preset in our collection is handcrafted specifically for the rich tones, skin tones, and lighting conditions of Indian weddings — giving you a consistent, polished aesthetic in seconds.",
  },
  {
    q: "Which versions of Lightroom are compatible?",
    a: "Our presets work seamlessly with Adobe Lightroom Classic, Lightroom CC (desktop), and Lightroom Mobile. We provide both .XMP and .DNG formats so you're covered regardless of which version you use.",
  },
  {
    q: "Can I use these presets on my phone?",
    a: "Yes. Every collection includes .DNG files which you can import directly into the free Lightroom Mobile app on both iOS and Android. Full editing power — no desktop required.",
  },
  {
    q: "Will the presets look exactly the same on my photos?",
    a: "Presets are starting points, not one-size-fits-all filters. Because every photo has different lighting and exposure, minor adjustments to exposure or white balance may be needed. Our presets are designed to be flexible and easy to tweak.",
  },
  {
    q: "How do I install the presets after purchasing?",
    a: "After purchase, you'll receive a download link with a step-by-step installation guide. In Lightroom Classic, simply import the .XMP files into your Presets panel. For mobile, import the .DNG files directly into the app. The whole process takes under 5 minutes.",
  },
  {
    q: "Do I receive updates if you improve a collection?",
    a: "Yes — all updates to a collection you've purchased are free, forever. We continue refining and expanding our preset collections, and existing customers always get access to the latest versions.",
  },
  {
    q: "Can I use these presets for client and commercial work?",
    a: "Absolutely. Every purchase grants you a lifetime personal and commercial licence. Use them on as many client shoots as you like — weddings, portraits, editorial — with no additional fees.",
  },
  {
    q: "What is your refund policy?",
    a: "Since our presets are digital downloads, we don't offer refunds after delivery. If you experience a technical issue or the files don't work as expected, reach out to us on WhatsApp or email and we'll resolve it promptly.",
  },
];

/* ─── FAQ ITEM ─────────────────────────────────────────────── */
function FAQItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(44,40,37,0.1)",
        padding: "0",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1.5rem", padding: "1.5rem 0", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1rem", fontWeight: 400, color: "#1E1B18",
          lineHeight: 1.4, letterSpacing: "0.01em",
        }}>
          {item.q}
        </span>
        <span style={{
          flexShrink: 0, width: "26px", height: "26px",
          borderRadius: "50%",
          border: "1px solid",
          borderColor: isOpen ? "#B08D5B" : "rgba(44,40,37,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isOpen ? "#B08D5B" : "#7A7065",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          transition: "all 300ms cubic-bezier(0.22,1,0.36,1)",
          fontSize: "1rem", lineHeight: 1, fontWeight: 300,
        }}>
          +
        </span>
      </button>
      <div style={{
        overflow: "hidden",
        height: height + "px",
        transition: "height 360ms cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div ref={bodyRef} style={{ paddingBottom: "1.5rem" }}>
          <p style={{
            color: "#7A7065", fontSize: "0.88rem", fontWeight: 300,
            lineHeight: 1.85, margin: 0, fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.01em",
          }}>
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ SECTION ──────────────────────────────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const left  = FAQS.filter((_, i) => i % 2 === 0);
  const right = FAQS.filter((_, i) => i % 2 !== 0);

  const toggle = (globalIdx) =>
    setOpenIndex((prev) => (prev === globalIdx ? null : globalIdx));

  return (
    <section style={{ background: "#F5F1EB", padding: "7rem 0 7rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2.5rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1.1rem" }}>
            <div style={{ width: "2rem", height: "1px", background: "#B08D5B" }} />
            <span style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.42em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>FAQ</span>
            <div style={{ width: "2rem", height: "1px", background: "#B08D5B" }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1E1B18", fontWeight: 400, lineHeight: 1.1, margin: "0 0 1rem" }}>
            Everything You Need<br />
            <span style={{ fontStyle: "italic", fontWeight: 300, color: "#B08D5B" }}>to Know</span>
          </h2>
          <p style={{ color: "#7A7065", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
            Simple answers to help you get started.
          </p>
        </motion.div>

        {/* 2-column accordion grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "0 4rem",
          }}
        >
          {/* Left column */}
          <div style={{ borderTop: "1px solid rgba(44,40,37,0.1)" }}>
            {left.map((item, i) => {
              const globalIdx = i * 2;
              return (
                <FAQItem
                  key={globalIdx}
                  item={item}
                  isOpen={openIndex === globalIdx}
                  onToggle={() => toggle(globalIdx)}
                />
              );
            })}
          </div>

          {/* Right column */}
          <div style={{ borderTop: "1px solid rgba(44,40,37,0.1)" }}>
            {right.map((item, i) => {
              const globalIdx = i * 2 + 1;
              return (
                <FAQItem
                  key={globalIdx}
                  item={item}
                  isOpen={openIndex === globalIdx}
                  onToggle={() => toggle(globalIdx)}
                />
              );
            })}
          </div>
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginTop: "4.5rem" }}
        >
          <p style={{ color: "#7A7065", fontSize: "0.84rem", fontWeight: 300, fontFamily: "'DM Sans', sans-serif", marginBottom: "1.25rem" }}>
            Still have a question? We're happy to help.
          </p>
          <a
            href="https://wa.me/918962801172"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              padding: "0.75rem 2rem",
              border: "1px solid #B08D5B", borderRadius: "2px",
              color: "#B08D5B", textDecoration: "none",
              fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              transition: "all 220ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#B08D5B"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B08D5B"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.073 23.927l6.244-1.636A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.002-1.368l-.36-.214-3.707.972.988-3.61-.235-.371A9.819 9.819 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </motion.div>

      </div>
    </section>
  );
}

function CinematicTestimonial() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % TESTIMONIAL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {TESTIMONIAL_IMAGES.map((src, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              transition: "opacity 1600ms ease-in-out",
              zIndex: isActive ? 1 : 0,
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover origin-center"
              style={{
                transform: isActive ? "scale(1.07)" : "scale(1)",
                transition: isActive ? "transform 6500ms ease-in-out" : "transform 0ms",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      <div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          width: "35%",
          background: "linear-gradient(to right, transparent 0%, rgba(255,245,220,0.055) 50%, transparent 100%)",
          animation: "lightsweep 14s ease-in-out infinite",
          zIndex: 4,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[4]"
        style={{
          background: PRESET_GRADES[activeIdx].overlay,
          transition: "background 1800ms ease-in-out",
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute inset-0 z-[5]" style={{ background: "linear-gradient(to bottom, rgba(10,7,5,0.15) 0%, rgba(10,7,5,0.65) 100%)" }} />
      <div className="absolute inset-0 z-[5]" style={{ background: "radial-gradient(ellipse at 50% 58%, rgba(176,141,91,0.10) 0%, transparent 62%)" }} />
      <div className="absolute inset-0 z-[6]" style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,0.46)" }} />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-[7]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "160px" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center px-8 max-w-3xl mx-auto flex flex-col items-center"
        style={{ zIndex: 10 }}
      >
        <div
          className="text-white select-none leading-none font-medium"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(7rem, 14vw, 11rem)", opacity: 0.08, marginBottom: "-2.2rem" }}
          aria-hidden="true"
        >
          &ldquo;
        </div>

        <blockquote
          key={activeIdx}
          className="font-light leading-[1.22] mb-10 text-white"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.55rem, 3.2vw, 2.6rem)", textShadow: "0 2px 40px rgba(0,0,0,0.5)", animation: "fade-up 0.9s ease-out forwards" }}
        >
          {PRESET_GRADES[activeIdx].quote.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </blockquote>

        <div className="h-px w-10 mb-8" style={{ background: "rgba(176,141,91,0.75)" }} />

        <p className="text-white/50 text-[10px] tracking-[0.5em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Priya &amp; Arjun &nbsp;·&nbsp; Mumbai
        </p>

        <div className="flex gap-2 mt-5">
          {TESTIMONIAL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: i === activeIdx ? "rgba(176,141,91,0.9)" : "rgba(255,255,255,0.3)",
                transform: i === activeIdx ? "scale(1.4)" : "scale(1)"
              }}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const ROW1_CARDS = [
  { src: "/images/photo-1.webp", alt: "Couple ceremony",  rotate: "-2deg",  h: "280px" },
  { src: "/images/photo-2.jpg",  alt: "Bride lehenga",    rotate: "1.5deg", h: "320px" },
  { src: "/images/photo-3.jpg",  alt: "Beach ceremony",   rotate: "-1deg",  h: "290px" },
  { src: "/images/photo-4.jpg",  alt: "Bride in saree",   rotate: "2deg",   h: "300px" },
  { src: "/images/photo-5.jpg",  alt: "Couple corridor",  rotate: "-1.5deg",h: "310px" },
  { src: "/images/photo-6.jpg",  alt: "Couple suite",     rotate: "1.8deg", h: "290px" },
  { src: "/images/photo-7.jpg",  alt: "Bride mirror",     rotate: "-2.2deg",h: "300px" },
  { src: "/images/photo-8.jpg",  alt: "Bride seated",     rotate: "1.2deg", h: "280px" },
];

const ROW2_CARDS = [
  { src: "/images/photo-5.jpg",  alt: "Couple corridor",  rotate: "2deg",   h: "240px" },
  { src: "/images/photo-7.jpg",  alt: "Bride mirror",     rotate: "-1.2deg",h: "260px" },
  { src: "/images/photo-1.webp", alt: "Couple ceremony",  rotate: "1.5deg", h: "240px" },
  { src: "/images/photo-8.jpg",  alt: "Bride seated",     rotate: "-2deg",  h: "255px" },
  { src: "/images/photo-3.jpg",  alt: "Beach ceremony",   rotate: "1.8deg", h: "245px" },
  { src: "/images/photo-6.jpg",  alt: "Couple suite",     rotate: "-1.5deg",h: "250px" },
  { src: "/images/photo-2.jpg",  alt: "Bride lehenga",    rotate: "2.2deg", h: "260px" },
  { src: "/images/photo-4.jpg",  alt: "Bride in saree",   rotate: "-1deg",  h: "240px" },
];

const COLLECTIONS_FALLBACK = [
  {
    id: "ivory",
    num: "01",
    name: "The Ivory Edit",
    mood: ["Soft", "Ethereal", "Luminous"],
    tagline: "For stories told in whispers and light.",
    description: "Film-like luminosity for photographers who live for soft candlelight and intimate moments. Skin tones glow, whites stay clean, and every frame feels like it was shot on medium format.",
    includes: ["12 Lightroom Presets", "Mobile DNG Profiles", "One-Click Apply", "Free Lifetime Updates"],
    price: "₹3,999",
    images: {
      hero: "/images/c-ivory-bride.jpg",
      mid:  "/images/c-ivory-stairs.jpg",
      sm:   "/images/c-ivory-couple.jpg",
      alt:  "/images/c-ivory-walk.jpg",
    },
    accent: "rgba(230,210,180,0.12)",
    flip: false,
  },
  {
    id: "crimson",
    num: "02",
    name: "The Crimson Edit",
    mood: ["Dramatic", "Regal", "Bold"],
    tagline: "Where every frame commands the room.",
    description: "Built for the richness of traditional Indian ceremonies. Deep reds stay true, gold embroidery gleams, and the grandeur of a lehenga fills every corner of the frame.",
    includes: ["14 Lightroom Presets", "Camera Raw Profiles", "Mobile DNG Profiles", "Wedding Day Workflow Guide"],
    price: "₹4,499",
    images: {
      hero: "/images/c-red-twirl.jpg",
      mid:  "/images/c-red-seated.webp",
      sm:   "/images/c-red-bride.webp",
      alt:  "/images/c-jewelry.jpg",
    },
    accent: "rgba(160,40,40,0.1)",
    flip: true,
  },
  {
    id: "heritage",
    num: "03",
    name: "The Heritage Edit",
    mood: ["Cinematic", "Warm", "Timeless"],
    tagline: "Palaces, mandaps, and golden light.",
    description: "Inspired by heritage venues and the warmth of candlelit mandaps. A cinematic grade that brings depth and richness to any setting — from rooftop ceremonies to forest retreats.",
    includes: ["16 Lightroom Presets", "Video LUTs Included", "Mobile + Desktop Profiles", "Private Editing Masterclass"],
    price: "₹5,499",
    images: {
      hero: "/images/c-sofa-bride.jpg",
      mid:  "/images/c-window.jpg",
      sm:   "/images/c-garden-couple.jpg",
      alt:  "/images/c-mandap.jpg",
    },
    accent: "rgba(140,95,40,0.10)",
    flip: false,
  },
];

function CollectionImageGrid({ images, flip }) {
  const { isMobile, isTablet } = useIsMobile();
  if (isMobile) {
    return (
      <div style={{ width: "100%", height: "280px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
        <img src={images.hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: flip ? "1fr 1.55fr" : "1.55fr 1fr",
      gridTemplateRows: "1fr 1fr",
      gap: "10px",
      height: isTablet ? "420px" : "560px",
      flexShrink: 0,
      width: isTablet ? "50%" : "58%",
    }}>
      {/* Hero image — tall, spans both rows on the larger column */}
      <div style={{
        gridColumn: flip ? "2" : "1",
        gridRow: "1 / 3",
        overflow: "hidden",
        borderRadius: "4px",
      }}>
        <img src={images.hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 700ms cubic-bezier(0.25,1,0.5,1)" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      </div>
      {/* Mid image */}
      <div style={{ gridColumn: flip ? "1" : "2", gridRow: "1", overflow: "hidden", borderRadius: "4px" }}>
        <img src={images.mid} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 700ms cubic-bezier(0.25,1,0.5,1)" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      </div>
      {/* Small image */}
      <div style={{ gridColumn: flip ? "1" : "2", gridRow: "2", overflow: "hidden", borderRadius: "4px" }}>
        <img src={images.sm} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 700ms cubic-bezier(0.25,1,0.5,1)" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      </div>
    </div>
  );
}

const MODAL_CYCLE_MS = 4200;
const BEFORE_HOLD_MS = 1400;

function CollectionPreviewModal({ collection, onClose }) {
  const [, setLocation] = useLocation();
  const [imgIdx, setImgIdx]     = useState(0);
  const [phase, setPhase]       = useState("before");
  const [phaseVisible, setPhaseVisible] = useState(true);
  const [visible, setVisible]   = useState(false);
  const images = [collection.images.hero, collection.images.mid, collection.images.sm, collection.images.alt];

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    setPhase("before");
    setPhaseVisible(true);
    const t1 = setTimeout(() => {
      setPhaseVisible(false);
      setTimeout(() => { setPhase("after"); setPhaseVisible(true); }, 350);
    }, BEFORE_HOLD_MS);
    const t2 = setTimeout(() => {
      setImgIdx(prev => (prev + 1) % images.length);
    }, MODAL_CYCLE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [imgIdx]);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 420);
  };

  const goTo = idx => setImgIdx((idx + images.length) % images.length);

  const beforeFilter = "saturate(0.5) brightness(0.82) contrast(0.88)";
  const afterFilter  = "saturate(1.05) brightness(1) contrast(1)";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(6,4,2,0.97)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.975)",
        transition: "opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)",
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.055, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "140px", pointerEvents: "none", zIndex: 1 }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none", zIndex: 2 }} />

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute", top: "2rem", right: "2rem", zIndex: 10,
          background: "none", border: "none", cursor: "pointer",
          width: 40, height: 40,
          color: "rgba(255,255,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "color 200ms",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.95)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
        aria-label="Close"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Collection label — top */}
      <div style={{ position: "absolute", top: "2.25rem", left: 0, right: 0, textAlign: "center", zIndex: 5, pointerEvents: "none" }}>
        <span style={{ color: "#B08D5B", fontSize: "0.58rem", letterSpacing: "0.45em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          Collection {collection.num} &nbsp;·&nbsp; {collection.name}
        </span>
      </div>

      {/* Main image area */}
      <div style={{ position: "relative", zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", height: "74vh" }}>
        {/* Prev ghost */}
        <div
          onClick={() => goTo(imgIdx - 1)}
          style={{ width: "10vw", maxWidth: 130, height: "100%", position: "relative", overflow: "hidden", borderRadius: "4px", cursor: "pointer", opacity: 0.22, flexShrink: 0, transition: "opacity 300ms" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.38"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.22"}
        >
          <img src={images[(imgIdx - 1 + images.length) % images.length]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Active image */}
        <div style={{ position: "relative", height: "100%", aspectRatio: "2/3", borderRadius: "6px", overflow: "hidden", flexShrink: 0, boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>
          {/* Ken Burns image */}
          <img
            key={imgIdx}
            src={images[imgIdx]}
            alt=""
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: phase === "before" ? beforeFilter : afterFilter,
              transform: "scale(1.06)",
              transformOrigin: "center center",
              animation: "kenburns-modal 4.5s ease-in-out forwards",
              transition: "filter 1.1s cubic-bezier(0.4,0,0.2,1)",
            }}
            draggable={false}
          />
          {/* Phase badge */}
          <div style={{
            position: "absolute", bottom: "1.25rem", left: "1.25rem", zIndex: 6,
            opacity: phaseVisible ? 1 : 0,
            transition: "opacity 350ms ease",
            pointerEvents: "none",
          }}>
            <span style={{
              background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
              color: phase === "before" ? "rgba(255,255,255,0.7)" : "rgba(201,169,110,0.95)",
              fontSize: "0.56rem", letterSpacing: "0.3em", textTransform: "uppercase",
              padding: "0.3rem 0.7rem", borderRadius: "9999px",
              border: phase === "before" ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(201,169,110,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 500ms, border-color 500ms",
            }}>
              {phase === "before" ? "Before" : "After Preset"}
            </span>
          </div>
        </div>

        {/* Next ghost */}
        <div
          onClick={() => goTo(imgIdx + 1)}
          style={{ width: "10vw", maxWidth: 130, height: "100%", position: "relative", overflow: "hidden", borderRadius: "4px", cursor: "pointer", opacity: 0.22, flexShrink: 0, transition: "opacity 300ms" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.38"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.22"}
        >
          <img src={images[(imgIdx + 1) % images.length]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Bottom: tagline + dots + CTA */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5, textAlign: "center", padding: "0 2rem 2.5rem" }}>
        {/* Tagline */}
        <p style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          color: "rgba(232,223,208,0.55)", fontSize: "0.95rem",
          marginBottom: "1.25rem", letterSpacing: "0.02em",
        }}>
          {collection.tagline}
        </p>

        {/* Dots */}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.75rem" }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === imgIdx ? 20 : 5, height: 5,
                borderRadius: 9999, border: "none", cursor: "pointer", padding: 0,
                background: i === imgIdx ? "#B08D5B" : "rgba(255,255,255,0.22)",
                transition: "all 400ms cubic-bezier(0.25,1,0.5,1)",
              }}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            padding: "0.9rem 2.75rem",
            background: "#B08D5B",
            color: "#0A0705",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "2px",
            transition: "all 250ms ease",
          }}
          onClick={() => { onClose(); setLocation("/collection/" + collection.id); }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C9A96E"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#B08D5B"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          View Collection &nbsp;→
        </button>
      </div>
    </div>
  );
}

function PresetCollection() {
  const [previewCollection, setPreviewCollection] = useState(null);
  const [, setLocation] = useLocation();
  const { isMobile, isTablet } = useIsMobile();
  const { content } = useContent();
  const COLLECTIONS = content.landingCollections || COLLECTIONS_FALLBACK;
  return (
    <>
    <section id="collections" style={{ background: "#131110", color: "#E8DFD0", position: "relative", overflow: "hidden" }}>
      {/* Grain overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "160px", pointerEvents: "none", zIndex: 0 }} />

      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", padding: "7rem 2rem 5rem", position: "relative", zIndex: 1 }}
      >
        <p style={{ color: "#B08D5B", fontSize: "0.6rem", letterSpacing: "0.45em", textTransform: "uppercase", marginBottom: "1.25rem" }}>The Signature Collections</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 5.5vw, 4rem)", color: "#F5EDE0", fontWeight: 500, marginBottom: "1.5rem", lineHeight: 1.1 }}>
          Presets That Speak<br /><span style={{ fontStyle: "italic", fontWeight: 300, color: "#B08D5B" }}>Your Language</span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <div style={{ height: "1px", width: "3.5rem", background: "rgba(176,141,91,0.35)" }} />
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(176,141,91,0.5)" }} />
          <div style={{ height: "1px", width: "3.5rem", background: "rgba(176,141,91,0.35)" }} />
        </div>
      </motion.div>

      {/* Collections */}
      {COLLECTIONS.map((col, idx) => (
        <motion.div
          key={col.num}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Top border */}
          <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(176,141,91,0.2) 20%, rgba(176,141,91,0.2) 80%, transparent)", margin: "0 4rem" }} />

          {/* Ambient glow for this collection */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${col.flip ? "70%" : "30%"} 50%, ${col.accent}, transparent 65%)`, pointerEvents: "none" }} />

          <div style={{
            maxWidth: "88rem", margin: "0 auto",
            padding: isMobile ? "3rem 1.25rem" : isTablet ? "3.5rem 2rem" : "5rem 4rem",
            display: "flex",
            flexDirection: isMobile ? "column" : (col.flip ? "row-reverse" : "row"),
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? "1.5rem" : isTablet ? "2.5rem" : "5rem",
          }}>
            {/* Images */}
            <CollectionImageGrid images={col.images} flip={col.flip} />

            {/* Text panel */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Collection number */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ color: "#B08D5B", fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Collection {col.num}</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(176,141,91,0.25)" }} />
              </div>

              {/* Name */}
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 3.5vw, 3rem)", color: "#F5EDE0", fontWeight: 500, marginBottom: "0.6rem", lineHeight: 1.1 }}>
                {col.name}
              </h3>

              {/* Tagline */}
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#B08D5B", fontSize: "1rem", marginBottom: "1.5rem", letterSpacing: "0.02em" }}>
                {col.tagline}
              </p>

              {/* Mood tags */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
                {col.mood.map(m => (
                  <span key={m} style={{
                    border: "1px solid rgba(176,141,91,0.3)",
                    color: "rgba(176,141,91,0.8)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{m}</span>
                ))}
              </div>

              {/* Description */}
              <p style={{ color: "rgba(232,223,208,0.65)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "2rem", fontWeight: 300, maxWidth: "30rem" }}>
                {col.description}
              </p>

              {/* Includes list */}
              <div style={{ marginBottom: "2.5rem" }}>
                <p style={{ color: "rgba(176,141,91,0.6)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>What's Included</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {col.includes.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#B08D5B", flexShrink: 0 }} />
                      <span style={{ color: "rgba(232,223,208,0.75)", fontSize: "0.825rem", letterSpacing: "0.05em", fontWeight: 300 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "rgba(176,141,91,0.5)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.2rem" }}>One-time purchase</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#F5EDE0", fontWeight: 500 }}>{col.price}</div>
                </div>
                <button
                  style={{
                    padding: "1rem 2.25rem",
                    background: "#B08D5B",
                    color: "#131110",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: "2px",
                    transition: "all 250ms ease",
                  }}
                  onClick={() => setLocation("/collection/" + col.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = "#C9A96E"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#B08D5B"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Get This Collection
                </button>
                <button
                  onClick={() => setPreviewCollection(col)}
                  style={{
                    padding: "1rem 1.5rem",
                    background: "transparent",
                    color: "rgba(232,223,208,0.5)",
                    border: "1px solid rgba(232,223,208,0.15)",
                    cursor: "pointer",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    fontWeight: 400,
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: "2px",
                    transition: "all 250ms ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#E8DFD0"; e.currentTarget.style.borderColor = "rgba(232,223,208,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(232,223,208,0.5)"; e.currentTarget.style.borderColor = "rgba(232,223,208,0.15)"; }}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* ── Explore More CTA ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", padding: "5rem 2rem 6rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ height: "1px", width: "4rem", background: "rgba(176,141,91,0.3)" }} />
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(176,141,91,0.5)" }} />
          <div style={{ height: "1px", width: "4rem", background: "rgba(176,141,91,0.3)" }} />
        </div>
        <p style={{ color: "rgba(232,223,208,0.5)", fontSize: "0.65rem", letterSpacing: "0.42em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: "1.25rem" }}>
          There's more waiting for you
        </p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#F5EDE0", fontWeight: 400, marginBottom: "0.6rem", lineHeight: 1.2 }}>
          Find Your Perfect <span style={{ fontStyle: "italic", color: "#B08D5B" }}>Palette</span>
        </h3>
        <p style={{ color: "rgba(232,223,208,0.45)", fontSize: "0.9rem", fontWeight: 300, maxWidth: "28rem", margin: "0 auto 2.5rem", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          Browse the full collection — every preset crafted for Indian light, skin tones, and wedding moments.
        </p>
        <button
          onClick={() => setLocation("/shop")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.75rem",
            padding: "1.1rem 3rem",
            background: "transparent",
            border: "1px solid rgba(176,141,91,0.55)",
            color: "#B08D5B",
            cursor: "pointer",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.72rem",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "9999px",
            transition: "all 300ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#B08D5B"; e.currentTarget.style.color = "#131110"; e.currentTarget.style.borderColor = "#B08D5B"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(176,141,91,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B08D5B"; e.currentTarget.style.borderColor = "rgba(176,141,91,0.55)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          Explore All Collections
          <ArrowRight size={16} />
        </button>
      </motion.div>

    </section>

      {previewCollection && (
        <CollectionPreviewModal
          collection={previewCollection}
          onClose={() => setPreviewCollection(null)}
        />
      )}
    </>
  );
}

const ROW1_DOUBLED = [...ROW1_CARDS, ...ROW1_CARDS];
const ROW2_DOUBLED = [...ROW2_CARDS, ...ROW2_CARDS];

export default function LandingPage() {
  useSEO({
    title: "pictureprefecttones — Luxury Lightroom Presets for Indian Wedding Photographers",
    description: "Premium Lightroom preset collections crafted exclusively for Indian wedding photographers. Cinematic colour grades for every skin tone, ceremony, and light condition. Instant download — XMP + DNG.",
    path: "/",
  });
  const { content } = useContent();
  const BA_PAIRS = content.baPairs;
  const [revealMode, setRevealMode] = useState("slider");
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FAFAF8", color: "#2C2825", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenburns-modal {
          0%   { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes lightsweep {
          0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          8%   { opacity: 1; }
          42%  { opacity: 0.7; }
          50%  { transform: translateX(220%) skewX(-18deg); opacity: 0; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marquee-left 55s linear infinite;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marquee-right 70s linear infinite;
        }
        .marquee-track-left:hover,
        .marquee-track-right:hover { animation-play-state: paused; }
        .photo-card {
          flex-shrink: 0;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease;
        }
        .photo-card:hover {
          transform: scale(1.04) rotate(0deg) !important;
          box-shadow: 0 28px 56px -10px rgba(176,141,91,0.28) !important;
          z-index: 10;
          position: relative;
        }
        .gallery-vignette { position: relative; }
        .gallery-vignette::before,
        .gallery-vignette::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 180px;
          z-index: 10;
          pointer-events: none;
        }
        .gallery-vignette::before {
          left: 0;
          background: linear-gradient(to right, #FAFAF8, transparent);
        }
        .gallery-vignette::after {
          right: 0;
          background: linear-gradient(to left, #FAFAF8, transparent);
        }
        .bg-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          pointer-events: none;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #E5D7C5; color: #2C2825; }
      `}</style>

      {/* Noise overlay */}
      <div className="fixed inset-0 bg-grain mix-blend-multiply z-50 pointer-events-none" />

      <Navbar activePath="/" />

      {/* Hero Section */}
      <section id="home" style={{ position: "relative", height: "100svh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "6vh" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {/* Ken Burns — slow drift loop */}
          <motion.img
            src="/images/gallery/dress-14.webp"
            alt="Indian bridal preparation"
            initial={{ scale: 1.12, x: 18, y: -8 }}
            animate={{ scale: [1.12, 1.04, 1.08, 1.02, 1.12], x: [18, 0, -10, 6, 18], y: [-8, 0, 8, -4, -8] }}
            transition={{ duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "loop", times: [0, 0.25, 0.5, 0.75, 1] }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }}
          />
          {/* Base dark wash */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(22,12,4,0.42)" }} />
          {/* Pulsing edge vignette */}
          <div className="hero-vignette-pulse" />
          {/* Golden light leaks */}
          <div className="hero-light-leak-1" />
          <div className="hero-light-leak-2" />
          {/* Film grain */}
          <div className="hero-grain" />
          {/* Bottom text fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(16,8,2,0.82) 0%, rgba(16,8,2,0.28) 55%, transparent 100%)", pointerEvents: "none" }} />
        </div>

        {/* ── Centre block: eyebrow + headline ── */}
        <div className="hero-content">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1.6rem" }}
          >
            <div style={{ height: "1px", width: "2.5rem", background: "linear-gradient(to right, transparent, rgba(232,201,122,0.7))" }} />
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(232,201,122,0.9)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
              Lightroom Presets · Indian Wedding
            </span>
            <div style={{ height: "1px", width: "2.5rem", background: "linear-gradient(to left, transparent, rgba(232,201,122,0.7))" }} />
          </motion.div>

          {/* Single-line heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.25 }}
            className="hero-headline"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 400, color: "#FAF6F0", margin: 0, lineHeight: 1.1, textShadow: "0 4px 32px rgba(0,0,0,0.5)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}
          >
            Colors That{" "}
            <span style={{ fontStyle: "italic", fontWeight: 300, color: "#E8C97A", textShadow: "0 4px 40px rgba(180,130,50,0.45)" }}>
              Tell a Story
            </span>
          </motion.h1>
        </div>

        {/* ── Bottom block: body + buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55 }}
          style={{ position: "absolute", bottom: "7vh", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "0 2rem" }}
        >
          {/* Ornament */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ height: "1px", width: "3rem", background: "linear-gradient(to right, transparent, rgba(232,201,122,0.5))" }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(232,201,122,0.7)" }} />
            <div style={{ height: "1px", width: "3rem", background: "linear-gradient(to left, transparent, rgba(232,201,122,0.5))" }} />
          </div>

          <p style={{ fontSize: "0.75rem", color: "rgba(255,245,230,0.72)", margin: 0, fontWeight: 300, lineHeight: 1.9, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
            A luxury preset collection · crafted for the richness of Indian weddings
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setLocation("/shop")}
              style={{ background: "rgba(176,141,91,0.9)", color: "#FAF6F0", padding: "0.9rem 2.5rem", border: "1px solid rgba(232,201,122,0.4)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem", fontWeight: 500, transition: "all 0.35s", borderRadius: "9999px", backdropFilter: "blur(6px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(210,170,100,0.95)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(176,141,91,0.9)"; }}
            >
              Shop Now <ArrowRight size={13} />
            </button>
            <button
              onClick={() => setLocation("/gallery")}
              style={{ background: "rgba(255,245,230,0.06)", color: "rgba(255,245,230,0.9)", padding: "0.9rem 2.5rem", border: "1px solid rgba(255,245,230,0.28)", cursor: "pointer", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem", fontWeight: 400, transition: "all 0.35s", borderRadius: "9999px", backdropFilter: "blur(6px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,245,230,0.14)"; e.currentTarget.style.borderColor = "rgba(255,245,230,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,245,230,0.06)"; e.currentTarget.style.borderColor = "rgba(255,245,230,0.28)"; }}
            >
              View Gallery
            </button>
          </div>
        </motion.div>
      </section>

      {/* Marquee Gallery Section */}
      <section id="gallery" style={{ position: "relative", zIndex: 10, padding: "6rem 0", overflow: "hidden", background: "#FAFAF8" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          style={{ textAlign: "center", marginBottom: "4rem", padding: "0 2rem" }}
        >
          <span style={{ display: "inline-block", color: "#B08D5B", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "1rem" }}>The Gallery</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 500, color: "#2C2825", marginBottom: "1rem" }}>
            Colours That Inspire
          </h2>
          <p style={{ fontFamily: "'Playfair Display', serif", color: "#5A544D", fontSize: "1.125rem", maxWidth: "32rem", margin: "0 auto", fontStyle: "italic" }}>
            Crafted for timeless Indian wedding stories
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "2rem" }}>
            <div style={{ height: "1px", width: "4rem", background: "linear-gradient(to right, transparent, rgba(176,141,91,0.6))" }} />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(176,141,91,0.6)" }} />
            <div style={{ height: "1px", width: "4rem", background: "linear-gradient(to left, transparent, rgba(176,141,91,0.6))" }} />
          </div>
        </motion.div>

        <div className="gallery-vignette overflow-hidden" style={{ marginBottom: "1.25rem" }}>
          <div className="marquee-track-left">
            {ROW1_DOUBLED.map((card, i) => (
              <div
                key={i}
                className="photo-card"
                style={{ margin: "0 0.75rem", padding: "0.625rem", background: "white", boxShadow: "0 10px 30px -5px rgba(0,0,0,0.12)", borderRadius: "2px", overflow: "hidden", transform: `rotate(${card.rotate})`, height: card.h }}
              >
                <img src={card.src} alt={card.alt} style={{ height: "100%", width: "auto", minWidth: "180px", objectFit: "cover", borderRadius: "2px", display: "block" }} />
              </div>
            ))}
          </div>
        </div>

        <div className="gallery-vignette overflow-hidden">
          <div className="marquee-track-right">
            {ROW2_DOUBLED.map((card, i) => (
              <div
                key={i}
                className="photo-card"
                style={{ margin: "0 0.75rem", padding: "0.625rem", background: "white", boxShadow: "0 6px 20px -5px rgba(0,0,0,0.1)", borderRadius: "2px", overflow: "hidden", transform: `rotate(${card.rotate})`, height: card.h }}
              >
                <img src={card.src} alt={card.alt} style={{ height: "100%", width: "auto", minWidth: "160px", objectFit: "cover", borderRadius: "2px", display: "block" }} />
              </div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ textAlign: "center", color: "rgba(176,141,91,0.6)", fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "3rem" }}
        >
          Hover to pause · All images edited with pictureprefecttones Presets
        </motion.p>
      </section>

      {/* Before & After Section */}
      <section id="presets" style={{ paddingTop: "5rem", paddingBottom: 0, overflow: "hidden", position: "relative", background: "linear-gradient(to bottom, #FAFAF8 0%, #EDE6DC 18%, #E8DFCF 40%, #EDE6DC 72%, #FAFAF8 90%)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8rem", background: "linear-gradient(to top, #FAFAF8, transparent)", pointerEvents: "none", zIndex: 10 }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "3rem", padding: "0 2rem" }}
        >
          <p style={{ color: "#B08D5B", fontSize: "0.625rem", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "1rem" }}>The Transformation</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#2C2825", marginBottom: "1rem" }}>
            {revealMode === "slider" ? "Drag to Reveal" : "Lens Reveal"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <div style={{ height: "1px", width: "3rem", background: "rgba(176,141,91,0.4)" }} />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(176,141,91,0.5)" }} />
            <div style={{ height: "1px", width: "3rem", background: "rgba(176,141,91,0.4)" }} />
          </div>

          {/* Mode toggle */}
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

        <div className="ba-grid">
          {BA_PAIRS.map((pair, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.1, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <BeforeAfterSlider beforeSrc={pair.b} afterSrc={pair.a} alt={pair.alt} mode={revealMode} />
            </motion.div>
          ))}
        </div>
        <div style={{ height: "6rem" }} />
      </section>

      <PresetCollection />

      <FAQSection />

      <CinematicTestimonial />

      <Footer />
    </div>
  );
}
