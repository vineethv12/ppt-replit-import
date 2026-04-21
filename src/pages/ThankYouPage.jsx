import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Download, Mail, ArrowRight, ShoppingBag, Archive, AlertTriangle } from "lucide-react";

const WP_BASE = (import.meta.env.VITE_WP_URL || "").replace(/\/+$/, "");
const ORDER_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

function readOrder() {
  try {
    const raw = localStorage.getItem("ppt_last_order");
    if (!raw) return null;
    const order = JSON.parse(raw);
    // Fix 3: expire stale orders so old data never bleeds into a future session
    if (order.ordered_at && Date.now() - order.ordered_at > ORDER_TTL_MS) {
      localStorage.removeItem("ppt_last_order");
      return null;
    }
    return order;
  } catch {
    return null;
  }
}

export default function ThankYouPage() {
  const [, navigate] = useLocation();
  const [order] = useState(() => readOrder());

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const dlMap = {};
  if (order?.download_links?.length) {
    order.download_links.forEach((dl) => {
      if (dl.preset_id) {
        dlMap[String(dl.preset_id)] = {
          url:   dl.download_url || null,
          ready: dl.file_ready === true,
        };
      }
    });
  }

  const getDownload = (presetId) => {
    const id    = String(presetId);
    const entry = dlMap[id];
    if (entry?.ready && entry.url) return { url: entry.url, ready: true };
    if (entry && !entry.ready)     return { url: null, ready: false };
    if (order?.token && WP_BASE)
      return { url: `${WP_BASE}/wp-json/ppt/v1/download/${order.token}?item=${presetId}`, ready: false };
    return null;
  };

  function downloadAll() {
    if (!order?.items?.length) return;
    order.items.forEach((item, i) => {
      const dl = getDownload(item.id);
      if (!dl?.ready || !dl.url) return;
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = dl.url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 800);
    });
  }

  const hasReadyDownloads = order?.items?.some((item) => getDownload(item.id)?.ready);
  const hasSaveError      = order?.save_error === true;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9F6F0",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 560,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 8px 48px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div style={{
          background: "#B08D5B",
          padding: "2.5rem 2.5rem 2rem",
          textAlign: "center",
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5, type: "spring", stiffness: 200 }}
            style={{ display: "inline-flex", marginBottom: "1rem" }}
          >
            <CheckCircle size={56} color="white" strokeWidth={1.5} />
          </motion.div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.75rem",
            fontWeight: 500,
            color: "white",
            marginBottom: "0.4rem",
          }}>
            Payment Successful
          </h1>
          {order?.payment_id && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem", letterSpacing: "0.08em" }}>
              Payment ID: {order.payment_id}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "2rem 2.5rem" }}>

          {/* Thank you message */}
          {order?.customer_name && (
            <p style={{ color: "#2C2825", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Thank you, <strong>{order.customer_name}</strong>! Your order has been confirmed.
            </p>
          )}

          {/* Fix 2: Save error — clear message + WhatsApp fallback */}
          {hasSaveError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                background: "#FFF8F0",
                border: "1px solid rgba(176,100,60,0.3)",
                borderRadius: 10,
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <AlertTriangle size={18} color="#C0621A" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: "#2C2825", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Payment received — download links couldn't be generated
                </p>
                <p style={{ color: "#7A6A5A", fontSize: "0.73rem", lineHeight: 1.55, marginBottom: "0.5rem" }}>
                  Your payment went through successfully. Please contact us on WhatsApp with your Payment ID and we'll send your files right away.
                </p>
                <a
                  href={`https://wa.me/918962801172?text=${encodeURIComponent(`Hi! I completed a payment (ID: ${order?.payment_id || "N/A"}) but didn't receive my download links. Can you help?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    background: "#25D366",
                    color: "white",
                    padding: "0.4rem 0.85rem",
                    borderRadius: 6,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          )}

          {/* Email notice — shown when save was successful */}
          {!hasSaveError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                background: "#FDF9F3",
                border: "1px solid rgba(176,141,91,0.25)",
                borderRadius: 10,
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <Mail size={18} color="#B08D5B" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: "#2C2825", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                  Download links sent to your email
                </p>
                {order?.customer_email && (
                  <p style={{ color: "#9A9088", fontSize: "0.75rem" }}>
                    Sent to <strong style={{ color: "#5A544D" }}>{order.customer_email}</strong>
                  </p>
                )}
                <p style={{ color: "#9A9088", fontSize: "0.72rem", marginTop: "0.25rem", lineHeight: 1.5 }}>
                  Check your inbox (and spam folder) for the download email.
                </p>
              </div>
            </motion.div>
          )}

          {/* Items purchased */}
          {order?.items?.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.6rem", color: "#9A9088", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Your Purchases
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {order.items.map((item, i) => {
                  const dl = getDownload(item.id);
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#F9F6F0",
                      borderRadius: 8,
                      padding: "0.75rem 1rem",
                      gap: "0.75rem",
                    }}>
                      <div>
                        <p style={{ color: "#2C2825", fontSize: "0.85rem", fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                          {item.name}
                        </p>
                        <p style={{ color: "#9A9088", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                          Lightroom Preset Pack · XMP
                        </p>
                      </div>
                      {dl?.ready && (
                        <a
                          href={dl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`link-download-${item.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            background: "#B08D5B",
                            color: "white",
                            border: "none",
                            padding: "0.45rem 0.9rem",
                            borderRadius: 6,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            flexShrink: 0,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Download size={12} /> Download ZIP
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Download All ZIPs */}
              {hasReadyDownloads && order.items.length > 1 && (
                <button
                  onClick={downloadAll}
                  data-testid="button-download-all"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    background: "rgba(176,141,91,0.1)",
                    border: "1px solid rgba(176,141,91,0.35)",
                    color: "#B08D5B",
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    marginTop: "0.65rem",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    transition: "background 200ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(176,141,91,0.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(176,141,91,0.1)"}
                >
                  <Archive size={14} /> Download All ZIPs
                </button>
              )}

              {/* Single item — prominent ZIP download */}
              {hasReadyDownloads && order.items.length === 1 && getDownload(order.items[0].id)?.ready && (
                <a
                  href={getDownload(order.items[0].id).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-download-zip-single"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    background: "rgba(176,141,91,0.1)",
                    border: "1px solid rgba(176,141,91,0.35)",
                    color: "#B08D5B",
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    marginTop: "0.65rem",
                    textDecoration: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    boxSizing: "border-box",
                  }}
                >
                  <Archive size={14} /> Download ZIP File
                </a>
              )}
            </div>
          )}

          {/* Order total */}
          {order?.total && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(44,40,37,0.08)",
              marginBottom: "1.5rem",
            }}>
              <span style={{ color: "#9A9088", fontSize: "0.8rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
                Total Paid
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#2C2825" }}>
                ₹{Number(order.total).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <button
              onClick={() => navigate("/")}
              data-testid="button-back-home"
              style={{
                width: "100%",
                background: "#2C2825",
                color: "#F5EDE0",
                border: "none",
                padding: "0.85rem 1.5rem",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 250ms",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
              onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
            >
              Back to Home <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/shop")}
              data-testid="button-browse-more"
              style={{
                width: "100%",
                background: "transparent",
                color: "#5A544D",
                border: "1px solid rgba(44,40,37,0.15)",
                padding: "0.75rem 1.5rem",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 250ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(44,40,37,0.3)"; e.currentTarget.style.background = "rgba(44,40,37,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(44,40,37,0.15)"; e.currentTarget.style.background = "transparent"; }}
            >
              <ShoppingBag size={14} /> Browse More Presets
            </button>
          </div>

          {/* Support note */}
          <p style={{ color: "#C4B8A8", fontSize: "0.68rem", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.6 }}>
            Need help?{" "}
            <a href="https://wa.me/918962801172" target="_blank" rel="noopener noreferrer" style={{ color: "#B08D5B", textDecoration: "none" }}>
              Chat with us on WhatsApp
            </a>
          </p>
        </div>
      </motion.div>

      {/* Brand footer */}
      <p style={{ color: "#C4B8A8", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2rem" }}>
        Picture Perfect Tones
      </p>
    </div>
  );
}
