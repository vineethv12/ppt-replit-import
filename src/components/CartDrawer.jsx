import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, User, Mail, Phone, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLocation } from "wouter";
import { saveOrder, prepareOrder } from "../lib/api";

const WHATSAPP_NUMBER = "918962801172";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

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

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQty, clearCart, cartCount, total } = useCart();
  const [, navigate] = useLocation();

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [slowCheckout, setSlowCheckout] = useState(false);
  const slowTimerRef = useRef(null);

  useEffect(() => {
    return () => { clearTimeout(slowTimerRef.current); };
  }, []);

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
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showDetailsForm) setShowDetailsForm(false);
        else setCartOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen, showDetailsForm]);

  const handleRazorpayCheckout = useCallback(async (customerData) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay. Please check your connection and try again.");
      return;
    }

    const itemsSummary = items.map((i) => `${i.name} ×${i.qty}`).join(", ");

    // Pre-register order data on the server so the webhook can reconstruct
    // structured item data independent of the client-side success callback.
    const orderItems = items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.priceNum * i.qty }));
    const refId = await prepareOrder({
      customer_name:  customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      items:          orderItems,
      total,
    });

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: "INR",
      name: "Picture Perfect Tones",
      description: itemsSummary,
      image: "/logo.png",
      handler: async function (response) {
        setCartOpen(false);
        clearCart();

        // Show overlay immediately — payment confirmed, save running
        setCheckingOut(true);
        setSlowCheckout(false);
        slowTimerRef.current = setTimeout(() => setSlowCheckout(true), 5000);

        const orderData = {
          customer_name:  customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          items:          orderItems,
          total,
          payment_id:     response.razorpay_payment_id,
          ref_id:         refId,
          ordered_at:     Date.now(),
        };

        let result = null;
        let saveError = false;

        // Run save + minimum 1.5 s display time in parallel.
        // Errors are caught inside so the min-delay always completes.
        const minDelay = new Promise((r) => setTimeout(r, 1500));
        const savePromise = (async () => {
          const hardTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("save-order timed out after 30 s")), 30000)
          );
          try {
            return await Promise.race([saveOrder(orderData), hardTimeout]);
          } catch (err) {
            console.error("Failed to save order:", err);
            saveError = true;
            return null;
          }
        })();
        [result] = await Promise.all([savePromise, minDelay]);

        clearTimeout(slowTimerRef.current);
        localStorage.setItem("ppt_last_order", JSON.stringify({
          ...orderData,
          processing:     false,
          token:          result?.token          || null,
          download_links: result?.download_links || null,
          save_error:     saveError,
        }));
        setCheckingOut(false);
        navigate("/thank-you");
      },
      prefill: {
        name:    customerData.name  || "",
        email:   customerData.email || "",
        contact: customerData.phone || "",
      },
      notes: {
        items:  itemsSummary,
        total:  formatTotal(total),
        ref_id: refId || "",
      },
      theme: { color: "#B08D5B" },
      modal: { ondismiss: function () {} },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert(`Payment failed: ${response.error.description}\nPlease try again or contact us via WhatsApp.`);
    });
    rzp.open();
  }, [items, total, setCartOpen, clearCart, navigate]);

  const updateField = (key, val) => {
    setCustomer(prev => ({ ...prev, [key]: val }));
    setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!customer.name.trim()) errs.name = "Full name is required";
    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))
      errs.email = "Valid email address required";
    if (!customer.phone.trim() || !/^[6-9]\d{9}$/.test(customer.phone.replace(/[\s\-()]/g, "")))
      errs.phone = "Valid 10-digit Indian mobile number required";
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    setFormLoading(true);
    setShowDetailsForm(false);
    await handleRazorpayCheckout({ ...customer });
    setFormLoading(false);
  };

  return (
    <>
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

                {/* ── Pay with Razorpay (primary) ── */}
                <button
                  data-testid="button-razorpay-checkout"
                  onClick={() => setShowDetailsForm(true)}
                  disabled={formLoading}
                  style={{
                    width: "100%",
                    background: "#B08D5B",
                    color: "white",
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
                    marginBottom: "0.65rem",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#9A7A48"}
                  onMouseLeave={e => e.currentTarget.style.background = "#B08D5B"}
                >
                  Pay with Razorpay
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10H22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(44,40,37,0.1)" }} />
                  <span style={{ fontSize: "0.6rem", color: "#B0A89E", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(44,40,37,0.1)" }} />
                </div>

                {/* ── Checkout via WhatsApp (secondary) ── */}
                <a
                  href={buildWhatsAppMsg(items, total)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <button
                    data-testid="button-whatsapp-checkout"
                    style={{
                      width: "100%",
                      background: "transparent",
                      color: "#2C2825",
                      border: "1.5px solid rgba(44,40,37,0.2)",
                      padding: "0.85rem 1.5rem",
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
                      transition: "all 250ms",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(44,40,37,0.06)"; e.currentTarget.style.borderColor = "rgba(44,40,37,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(44,40,37,0.2)"; }}
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

          {/* ── Customer Details Form Modal ── */}
          <AnimatePresence>
            {showDetailsForm && (
              <motion.div
                key="customer-form-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowDetailsForm(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 9100,
                  background: "rgba(14,10,6,0.55)",
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                  padding: "0 0 0 0",
                }}
              >
                <motion.div
                  key="customer-form-panel"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: "min(460px, 100vw)",
                    background: "#F5F1EB",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: "2rem 1.75rem 2.25rem",
                    boxShadow: "0 -8px 48px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#2C2825", marginBottom: "0.2rem" }}>
                        Your Details
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "#9A9088", fontFamily: "'DM Sans', sans-serif" }}>
                        We'll send your download link to your email.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailsForm(false)}
                      style={{ background: "rgba(44,40,37,0.07)", border: "none", cursor: "pointer", color: "#2C2825", display: "flex", alignItems: "center", padding: "0.4rem", borderRadius: "8px" }}
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} noValidate>
                    {/* Full Name */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7A7068", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.4rem" }}>
                        Full Name <span style={{ color: "#B08D5B" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <User size={14} color="#C4B8A8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          data-testid="input-customer-name"
                          type="text"
                          value={customer.name}
                          onChange={e => updateField("name", e.target.value)}
                          placeholder="Priya Sharma"
                          autoComplete="name"
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "0.7rem 0.75rem 0.7rem 2.25rem",
                            background: "white",
                            border: `1.5px solid ${formErrors.name ? "#C85A5A" : "rgba(44,40,37,0.12)"}`,
                            borderRadius: 8, fontSize: "0.88rem",
                            color: "#2C2825", fontFamily: "'DM Sans', sans-serif",
                            outline: "none", transition: "border-color 180ms",
                          }}
                          onFocus={e => e.target.style.borderColor = formErrors.name ? "#C85A5A" : "#B08D5B"}
                          onBlur={e => e.target.style.borderColor = formErrors.name ? "#C85A5A" : "rgba(44,40,37,0.12)"}
                        />
                      </div>
                      {formErrors.name && <p style={{ color: "#C85A5A", fontSize: "0.68rem", marginTop: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>{formErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7A7068", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.4rem" }}>
                        Email Address <span style={{ color: "#B08D5B" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={14} color="#C4B8A8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          data-testid="input-customer-email"
                          type="email"
                          value={customer.email}
                          onChange={e => updateField("email", e.target.value)}
                          placeholder="priya@example.com"
                          autoComplete="email"
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "0.7rem 0.75rem 0.7rem 2.25rem",
                            background: "white",
                            border: `1.5px solid ${formErrors.email ? "#C85A5A" : "rgba(44,40,37,0.12)"}`,
                            borderRadius: 8, fontSize: "0.88rem",
                            color: "#2C2825", fontFamily: "'DM Sans', sans-serif",
                            outline: "none", transition: "border-color 180ms",
                          }}
                          onFocus={e => e.target.style.borderColor = formErrors.email ? "#C85A5A" : "#B08D5B"}
                          onBlur={e => e.target.style.borderColor = formErrors.email ? "#C85A5A" : "rgba(44,40,37,0.12)"}
                        />
                      </div>
                      {formErrors.email && <p style={{ color: "#C85A5A", fontSize: "0.68rem", marginTop: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>{formErrors.email}</p>}
                      <p style={{ color: "#B0A89E", fontSize: "0.65rem", marginTop: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>
                        Download link will be sent here
                      </p>
                    </div>

                    {/* Mobile */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7A7068", fontFamily: "'DM Sans', sans-serif", marginBottom: "0.4rem" }}>
                        Mobile Number <span style={{ color: "#B08D5B" }}>*</span>
                      </label>
                      <div style={{ position: "relative", display: "flex" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9A9088", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif", pointerEvents: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Phone size={13} color="#C4B8A8" />
                          <span style={{ marginLeft: "0.15rem" }}>+91</span>
                        </span>
                        <input
                          data-testid="input-customer-phone"
                          type="tel"
                          value={customer.phone}
                          onChange={e => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="9876543210"
                          autoComplete="tel"
                          maxLength={10}
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "0.7rem 0.75rem 0.7rem 3.75rem",
                            background: "white",
                            border: `1.5px solid ${formErrors.phone ? "#C85A5A" : "rgba(44,40,37,0.12)"}`,
                            borderRadius: 8, fontSize: "0.88rem",
                            color: "#2C2825", fontFamily: "'DM Sans', sans-serif",
                            outline: "none", transition: "border-color 180ms",
                          }}
                          onFocus={e => e.target.style.borderColor = formErrors.phone ? "#C85A5A" : "#B08D5B"}
                          onBlur={e => e.target.style.borderColor = formErrors.phone ? "#C85A5A" : "rgba(44,40,37,0.12)"}
                        />
                      </div>
                      {formErrors.phone && <p style={{ color: "#C85A5A", fontSize: "0.68rem", marginTop: "0.3rem", fontFamily: "'DM Sans', sans-serif" }}>{formErrors.phone}</p>}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      data-testid="button-proceed-payment"
                      style={{
                        width: "100%", background: "#B08D5B", color: "white",
                        border: "none", padding: "1rem 1.5rem",
                        fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                        cursor: "pointer", borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                        transition: "background 250ms",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#9A7A48"}
                      onMouseLeave={e => e.currentTarget.style.background = "#B08D5B"}
                    >
                      Proceed to Payment
                      <ArrowRight size={15} />
                    </button>

                    <p style={{ fontSize: "0.63rem", color: "#B0A89E", fontFamily: "'DM Sans', sans-serif", textAlign: "center", marginTop: "0.85rem", lineHeight: 1.5 }}>
                      Secured by Razorpay · Your info is used only to deliver your purchase.
                    </p>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>

    {/* ── Checkout processing overlay ── */}
    <AnimatePresence>
      {checkingOut && (
        <motion.div
          key="checkout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(14,10,6,0.93)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "1.5rem",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
            style={{ color: "#B08D5B", display: "flex" }}
          >
            <Loader2 size={40} strokeWidth={1.5} />
          </motion.div>
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              fontWeight: 500,
              color: "#F5EDE0",
              marginBottom: "0.4rem",
            }}>
              {slowCheckout ? "Almost there…" : "Finalising your order…"}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 300,
              color: "rgba(245,237,224,0.55)",
              letterSpacing: "0.04em",
            }}>
              Please don't close this page
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
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
          Lightroom Preset Pack · XMP
        </p>

        {/* Qty controls + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(44,40,37,0.06)", borderRadius: "9999px", padding: "2px" }}>
            <button
              data-testid={`button-dec-qty-${item.id}`}
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
              data-testid={`button-inc-qty-${item.id}`}
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
        data-testid={`button-remove-item-${item.id}`}
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
