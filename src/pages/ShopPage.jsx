import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "../hooks/useSEO";
import { useLocation } from "wouter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";
import { useContent } from "../context/ContentContext";

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PRODUCTS = [
  {
    id: "ivory",
    name: "The Ivory Edit",
    tagline: "Soft, ethereal luminosity",
    price: "₹3,999",
    categories: ["all", "wedding", "portrait", "warm"],
    img: "/images/c-ivory-bride.jpg",
    badge: null,
    count: 12,
  },
  {
    id: "crimson",
    name: "The Crimson Edit",
    tagline: "Dramatic, regal richness",
    price: "₹4,499",
    categories: ["all", "wedding", "moody"],
    img: "/images/c-red-twirl.jpg",
    badge: "Bestseller",
    count: 14,
  },
  {
    id: "heritage",
    name: "The Heritage Edit",
    tagline: "Cinematic warmth & depth",
    price: "₹5,499",
    categories: ["all", "cinematic", "warm"],
    img: "/images/c-sofa-bride.jpg",
    badge: "New",
    count: 16,
  },
  {
    id: "celebration",
    name: "The Celebration Edit",
    tagline: "Vivid, joyful, true-to-life",
    price: "₹3,499",
    categories: ["all", "wedding", "cinematic"],
    img: "/images/c-celebration.jpg",
    badge: null,
    count: 10,
  },
  {
    id: "golden",
    name: "The Golden Hour Edit",
    tagline: "Honeyed light, sunlit glow",
    price: "₹3,999",
    categories: ["all", "cinematic", "warm", "portrait"],
    img: "/images/c-garden-couple.jpg",
    badge: null,
    count: 12,
  },
  {
    id: "portrait",
    name: "The Portrait Edit",
    tagline: "Clean skin, natural detail",
    price: "₹2,999",
    categories: ["all", "portrait", "warm"],
    img: "/images/c-ivory-couple.jpg",
    badge: null,
    count: 8,
  },
];

const DEFAULT_FILTER_LABELS = {
  wedding: "Wedding",
  cinematic: "Cinematic",
  warm: "Warm",
  moody: "Moody",
  portrait: "Portrait",
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function CollectionCard({ product, index, available }) {
  const [addedAnim, setAddedAnim] = useState(false);
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const isUnavailable = available === false;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isUnavailable) return;
    addItem({ id: product.id, name: product.name, price: product.price, img: product.img });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
      onClick={() => setLocation("/collection/" + product.id)}
    >
      {/* Image container — 2:3 ratio */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "150%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Image */}
        <img
          src={product.img}
          alt={product.name}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Permanent bottom gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 40%)",
            borderRadius: "16px",
          }}
        />

        {/* Badge — "Coming Soon" overrides product badge when unavailable */}
        {(isUnavailable || product.badge) && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: isUnavailable ? "rgba(44,40,37,0.75)" : "#B08D5B",
              color: "white",
              fontSize: "0.52rem",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              padding: "0.22rem 0.62rem",
              borderRadius: "9999px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              backdropFilter: isUnavailable ? "blur(4px)" : "none",
            }}
          >
            {isUnavailable ? "Coming Soon" : product.badge}
          </div>
        )}

        {/* "View Collection" overlay — always visible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "0.62rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              padding: "0.45rem 1.1rem",
              border: "1px solid rgba(255,255,255,0.65)",
              backdropFilter: "blur(4px)",
              background: "rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
              borderRadius: "2px",
            }}
          >
            View Collection
          </span>
        </div>
      </div>

      {/* Text below image */}
      <div style={{ padding: "0.9rem 0.25rem 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.2rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "#2C2825",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#B08D5B",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
              flexShrink: 0,
            }}
          >
            {product.price}
          </span>
        </div>
        <p
          style={{
            fontSize: "0.73rem",
            color: "#9A9088",
            fontWeight: 300,
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.01em",
            margin: "0 0 0.85rem",
          }}
        >
          {product.tagline} · {product.count} presets
        </p>

        {/* Quick-add row */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={handleAddToCart}
            disabled={isUnavailable}
            data-testid={`button-add-to-cart-${product.id}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              padding: "0.6rem 0.75rem",
              background: isUnavailable ? "rgba(44,40,37,0.04)" : addedAnim ? "#2C2825" : "rgba(44,40,37,0.06)",
              color: isUnavailable ? "#C4BAB1" : addedAnim ? "#F5EDE0" : "#5A544D",
              border: isUnavailable ? "1px solid rgba(44,40,37,0.08)" : addedAnim ? "1px solid #2C2825" : "1px solid rgba(44,40,37,0.12)",
              cursor: isUnavailable ? "not-allowed" : "pointer",
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              borderRadius: "4px",
              transition: "all 220ms ease",
            }}
            onMouseEnter={e => { if (!addedAnim && !isUnavailable) { e.currentTarget.style.background = "#2C2825"; e.currentTarget.style.color = "#F5EDE0"; e.currentTarget.style.borderColor = "#2C2825"; } }}
            onMouseLeave={e => { if (!addedAnim && !isUnavailable) { e.currentTarget.style.background = "rgba(44,40,37,0.06)"; e.currentTarget.style.color = "#5A544D"; e.currentTarget.style.borderColor = "rgba(44,40,37,0.12)"; } }}
          >
            <ShoppingBag size={12} strokeWidth={1.8} />
            {isUnavailable ? "Coming Soon" : addedAnim ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}


export default function ShopPage() {
  useSEO({
    title: "Shop Presets — pictureprefecttones",
    description: "Browse the full pictureprefecttones collection. Luxury Lightroom preset packs designed for Indian wedding photographers — instant download, XMP format.",
    path: "/shop",
  });
  const { content, availablePresets } = useContent();
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");

  const fl = { ...DEFAULT_FILTER_LABELS, ...(content.filterLabels || {}) };
  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "wedding",   label: fl.wedding },
    { key: "cinematic", label: fl.cinematic },
    { key: "warm",      label: fl.warm },
    { key: "moody",     label: fl.moody },
    { key: "portrait",  label: fl.portrait },
  ];

  const allProducts = (content.products || PRODUCTS).filter(p => p.enabled !== false);
  const filtered = allProducts.filter((p) => (p.categories || ["all"]).includes(activeFilter));

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1EB", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      <style>{`
        @keyframes shop-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shop-bar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      {/* Grain overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, backgroundSize: "160px", opacity: 0.038, pointerEvents: "none", zIndex: 100, mixBlendMode: "multiply" }} />

      <Navbar activePath="/shop" />

      {/* ── EDITORIAL HEADER ──────────────────────────────────── */}
      <header style={{ background: "#F0EBE3", animation: "shop-fadein 0.65s ease-out both" }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "calc(var(--nav-h) + 1.5rem) 2.5rem 2rem",
          display: "flex",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem 2rem",
        }}>

          {/* Left — label + heading + subtext */}
          <div style={{ flex: "1 1 260px" }}>
            {/* Gold label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.65rem" }}>
              <div style={{
                width: "1.75rem", height: "1px",
                background: "#B08D5B",
                transformOrigin: "left",
                animation: "shop-bar 0.6s 0.25s ease-out both",
              }} />
              <span style={{
                color: "#B08D5B",
                fontSize: "0.56rem",
                letterSpacing: "0.44em",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}>
                Collections
              </span>
            </div>

            {/* Heading — smaller, tighter */}
            <h1 className="shop-h1" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.5rem, 2.2vw, 2.1rem)",
              color: "#1E1B18",
              fontWeight: 500,
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}>
              Preset{" "}
              <span style={{ fontStyle: "italic", fontWeight: 300, color: "#B08D5B" }}>
                Collections
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              color: "#7A7065",
              fontSize: "0.8rem",
              fontWeight: 300,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
              margin: 0,
            }}>
              Hand-crafted for the richness, colour and grandeur of Indian weddings.
            </p>
          </div>

          {/* Right — filter pills, always floated to right edge */}
          <div className="shop-filter-bar" style={{ flexShrink: 0, marginLeft: "auto", alignSelf: "flex-end", width: "auto", maxWidth: "100%" }}>
          <div style={{
            display: "inline-flex",
            background: "rgba(44,40,37,0.07)",
            borderRadius: "9999px",
            padding: "4px",
            gap: "2px",
            flexShrink: 0,
          }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  padding: "0.42rem 1.15rem",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.67rem",
                  letterSpacing: "0.1em",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: activeFilter === f.key ? 600 : 400,
                  background: activeFilter === f.key ? "#2C2825" : "transparent",
                  color: activeFilter === f.key ? "#F5EDE0" : "#7A7065",
                  boxShadow: activeFilter === f.key ? "0 2px 10px rgba(0,0,0,0.14)" : "none",
                  transition: "all 200ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ height: "1px", background: "rgba(44,40,37,0.1)" }} />
        </div>
      </header>

      {/* ── GRID ──────────────────────────────────────────────── */}
      <section id="shop-grid" style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 2.5rem 5rem" }}>
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shop-grid"
            >
              {filtered.map((product, i) => (
                <CollectionCard
                  key={product.id}
                  product={product}
                  index={i}
                  available={availablePresets === null ? undefined : availablePresets.has(product.id)}
                />
              ))}
            </motion.div>
          ) : (
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#9A9088" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", marginBottom: "0.4rem", color: "#5A544D" }}>
                Coming soon
              </p>
              <p style={{ fontSize: "0.82rem", fontWeight: 300 }}>
                No presets in this category yet.
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      <Footer />

    </div>
  );
}
