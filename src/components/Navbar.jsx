import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, Menu, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const LINKS = [
  { label: "Home",    path: "/" },
  { label: "Presets", path: "/shop" },
  { label: "Gallery", path: "/gallery" },
  { label: "Process", path: "/process" },
  { label: "About",   path: "/about" },
  { label: "Contact", path: "/contact" },
];

function CartIconBtn({ cartCount, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open cart"
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        color: "white",
        cursor: "pointer",
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        transition: "background 220ms, border-color 220ms",
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
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
          boxShadow: "0 0 0 2px rgba(0,0,0,0.3)",
        }}>
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );
}

export default function Navbar({ activePath }) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setCartOpen } = useCart();
  const [scrolled, setScrolled]  = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 639) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, [menuOpen]);

  const navigate = (path) => {
    setMenuOpen(false);
    setLocation(path);
  };

  return (
    <nav
      ref={drawerRef}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        paddingTop: scrolled ? "0.75rem" : "1.5rem",
        paddingBottom: scrolled ? "0.5rem" : "0.9rem",
        paddingLeft:  "clamp(1.25rem, 5vw, 3rem)",
        paddingRight: "clamp(1.25rem, 5vw, 3rem)",
        background: menuOpen
          ? "rgba(18,11,6,0.98)"
          : scrolled
            ? "rgba(20,12,6,0.92)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.44) 0%, transparent 100%)",
        backdropFilter: (scrolled || menuOpen) ? "blur(18px)" : "none",
        borderBottom: scrolled || menuOpen
          ? "1px solid rgba(255,255,255,0.07)"
          : "none",
        transition: "padding 350ms ease, background 350ms ease",
      }}
    >
      {/* ── Desktop two-row nav ── */}
      <div className="nav-desktop" style={{ flexDirection: "column" }}>
        {/* Row 1: space | logo | Shop Now */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", marginBottom: "0.5rem" }}>
          <div />
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.875rem", fontWeight: 600, fontStyle: "italic", letterSpacing: "0.025em", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          >
            pictureprefecttones
          </button>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.6rem" }}>
            <button
              onClick={() => { navigate("/shop"); window.scrollTo({ top: 0, behavior: "instant" }); }}
              style={{ background: "#2C2825", color: "#F5F1EB", border: "none", padding: "0.6rem 1.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", borderRadius: "9999px", transition: "background 250ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
              onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
            >
              Shop Now
            </button>
            <CartIconBtn cartCount={cartCount} onClick={() => setCartOpen(true)} />
          </div>
        </div>
        {/* Row 2: nav links */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2.25rem" }}>
          {LINKS.map(({ label, path }) => {
            const isActive = activePath === path || (!activePath && path === "/");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: isActive ? "#F0C97A" : "rgba(255,255,255,0.9)",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  fontWeight: 600, fontSize: "0.72rem",
                  fontFamily: "'DM Sans', sans-serif",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  transition: "color 0.2s", padding: 0,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#F0C97A"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile single-row bar ── */}
      <div className="nav-mobile" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.35rem", fontWeight: 600, fontStyle: "italic", letterSpacing: "0.025em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          pictureprefecttones
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <CartIconBtn cartCount={cartCount} onClick={() => setCartOpen(true)} />
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0.3rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down drawer (sits below bar, page stays visible) ── */}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(18,11,6,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          maxHeight: menuOpen ? "420px" : "0px",
          opacity: menuOpen ? 1 : 0,
          transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease",
          pointerEvents: menuOpen ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Nav links */}
        <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem 0" }}>
          {LINKS.map(({ label, path }) => {
            const isActive = activePath === path || (!activePath && path === "/");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "#F0C97A" : "rgba(255,255,255,0.82)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.78rem",
                  fontFamily: "'DM Sans', sans-serif",
                  padding: "0.9rem 1.75rem",
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "color 0.15s, background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#F0C97A";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.82)";
                    e.currentTarget.style.background = "none";
                  }
                }}
              >
                <span>{label}</span>
                {isActive && (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F0C97A", display: "inline-block" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Shop CTA */}
        <div style={{ padding: "1rem 1.75rem 1.5rem" }}>
          <button
            onClick={() => { navigate("/shop"); window.scrollTo({ top: 0, behavior: "instant" }); }}
            style={{
              width: "100%",
              background: "#B08D5B",
              color: "white",
              border: "none",
              padding: "0.85rem 1.5rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: "0.72rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              borderRadius: "9999px",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#96783e"}
            onMouseLeave={e => e.currentTarget.style.background = "#B08D5B"}
          >
            Shop Presets →
          </button>
        </div>
      </div>
    </nav>
  );
}
