import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const WHATSAPP_NUMBER = "918962801172";

function formatTotal(num) {
  return "₹" + num.toLocaleString("en-IN");
}

function buildWhatsAppMsg(items, total) {
  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${formatTotal(i.priceNum * i.qty)}`
  );
  const msg = [
    "Hello! I'd like to order the following Lightroom presets:",
    "",
    ...lines,
    "",
    `Total: ${formatTotal(total)}`,
    "",
    "Please share the payment details.",
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQty, clearCart, cartCount, total } = useCart();

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9000,
              background: "rgba(14,10,6,0.6)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              zIndex: 9001,
              width: "min(460px, 100vw)",
              background: "#F5F1EB",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 48px rgba(0,0,0,0.22)",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: "1.5rem 1.75rem 1.25rem",
              borderBottom: "1px solid rgba(44,40,37,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              background: "#F5F1EB",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <ShoppingBag size={18} color="#2C2825" strokeWidth={1.5} />
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 500,
                  color: "#2C2825",
                }}>
                  Your Cart
                </span>
                {cartCount > 0 && (
                  <span style={{
                    background: "#B08D5B",
                    color: "white",
                    fontSize: "0.6rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "9999px",
                    letterSpacing: "0.05em",
                    minWidth: "20px",
                    textAlign: "center",
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    title="Clear cart"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9A9088", display: "flex", alignItems: "center",
                      padding: "0.3rem", borderRadius: "6px",
                      transition: "color 200ms, background 200ms",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#C85A5A"; e.currentTarget.style.background = "rgba(200,90,90,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#9A9088"; e.currentTarget.style.background = "none"; }}
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  style={{
                    background: "rgba(44,40,37,0.07)", border: "none", cursor: "pointer",
                    color: "#2C2825", display: "flex", alignItems: "center",
                    padding: "0.4rem", borderRadius: "8px",
                    transition: "background 200ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(44,40,37,0.14)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(44,40,37,0.07)"}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* ── Items list ── */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem 1.75rem",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(176,141,91,0.25) transparent",
            }}>
              {items.length === 0 ? (
                <EmptyState onClose={() => setCartOpen(false)} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onRemove={() => removeItem(item.id)}
                        onInc={() => updateQty(item.id, 1)}
                        onDec={() => updateQty(item.id, -1)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Footer / checkout ── */}
            {items.length > 0 && (
              <div style={{
                borderTop: "1px solid rgba(44,40,37,0.1)",
                padding: "1.25rem 1.75rem 1.75rem",
                flexShrink: 0,
                background: "#F5F1EB",
              }}>
                {/* Price breakdown */}
                <div style={{ marginBottom: "1rem" }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.74rem", color: "#9A9088", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                        {item.name}{item.qty > 1 ? ` × ${item.qty}` : ""}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "#5A544D", fontFamily: "'DM Sans', sans-serif" }}>
                        {formatTotal(item.priceNum * item.qty)}
                      </span>
                    </div>
                  ))}
                  <div style={{ height: "1px", background: "rgba(44,40,37,0.1)", margin: "0.75rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#2C2825", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Total
                    </span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 500, color: "#2C2825" }}>
                      {formatTotal(total)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.67rem", color: "#9A9088", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, marginTop: "0.3rem", textAlign: "right", letterSpacing: "0.02em" }}>
                    Incl. all taxes · Instant digital download
                  </p>
                </div>

                {/* Checkout via WhatsApp */}
                <a
                  href={buildWhatsAppMsg(items, total)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <button style={{
                    width: "100%",
                    background: "#2C2825",
                    color: "#F5EDE0",
                    border: "none",
                    padding: "1rem 1.5rem",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    transition: "background 250ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
                  onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
                  >
                    Checkout via WhatsApp
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </a>

                <p style={{ fontSize: "0.65rem", color: "#9A9088", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, marginTop: "0.75rem", textAlign: "center", letterSpacing: "0.02em", lineHeight: 1.5 }}>
                  We'll send your download link after payment confirmation.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItem({ item, onRemove, onInc, onDec }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        gap: "0.85rem",
        alignItems: "flex-start",
        padding: "0.9rem",
        background: "white",
        borderRadius: "10px",
        border: "1px solid rgba(44,40,37,0.07)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 60, height: 72, borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
        <img
          src={item.img}
          alt={item.name}
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "0.88rem",
          fontWeight: 500,
          color: "#2C2825",
          marginBottom: "0.2rem",
          lineHeight: 1.3,
        }}>
          {item.name}
        </p>
        <p style={{
          fontSize: "0.65rem",
          color: "#9A9088",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          marginBottom: "0.6rem",
          letterSpacing: "0.02em",
        }}>
          Lightroom Preset Pack · XMP + DNG
        </p>

        {/* Qty controls + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(44,40,37,0.06)", borderRadius: "9999px", padding: "2px" }}>
            <button
              onClick={onDec}
              style={{ background: "none", border: "none", cursor: "pointer", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#5A544D", borderRadius: "9999px", transition: "background 150ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(44,40,37,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Minus size={11} strokeWidth={2} />
            </button>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#2C2825", minWidth: 20, textAlign: "center" }}>
              {item.qty}
            </span>
            <button
              onClick={onInc}
              style={{ background: "none", border: "none", cursor: "pointer", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#5A544D", borderRadius: "9999px", transition: "background 150ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(44,40,37,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 500, color: "#B08D5B" }}>
            {formatTotal(item.priceNum * item.qty)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#C4B8A8", padding: "2px", flexShrink: 0, display: "flex", alignItems: "center", transition: "color 200ms" }}
        onMouseEnter={e => e.currentTarget.style.color = "#C85A5A"}
        onMouseLeave={e => e.currentTarget.style.color = "#C4B8A8"}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </motion.div>
  );
}

function EmptyState({ onClose }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <div style={{ marginBottom: "1.25rem", opacity: 0.25 }}>
        <ShoppingBag size={48} color="#2C2825" strokeWidth={1} />
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#2C2825", marginBottom: "0.5rem" }}>
        Your cart is empty
      </p>
      <p style={{ fontSize: "0.78rem", color: "#9A9088", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.6, marginBottom: "1.75rem" }}>
        Add a preset collection to get started.
      </p>
      <button
        onClick={onClose}
        style={{
          background: "#2C2825", color: "#F5EDE0",
          border: "none", padding: "0.75rem 2rem",
          fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          cursor: "pointer", borderRadius: "2px", transition: "background 250ms",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
        onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
      >
        Browse Collections
      </button>
    </div>
  );
}
