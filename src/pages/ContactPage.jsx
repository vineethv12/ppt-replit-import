import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSEO } from "../hooks/useSEO";
import { useLocation } from "wouter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";


const INPUT = {
  width: "100%",
  background: "white",
  border: "1px solid rgba(44,40,37,0.14)",
  borderRadius: "2px",
  padding: "0.9rem 1.1rem",
  fontSize: "0.85rem",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 300,
  color: "#2C2825",
  outline: "none",
  transition: "border-color 200ms",
  boxSizing: "border-box",
};

const LABEL = {
  display: "block",
  fontSize: "0.58rem",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  color: "#9A9088",
  marginBottom: "0.5rem",
};

export default function ContactPage() {
  useSEO({
    title: "Contact — pictureprefecttones",
    description: "Get in touch with pictureprefecttones. Questions about presets, custom orders, or collaborations — we'd love to hear from you.",
    path: "/contact",
  });
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true);
  };

  const focusStyle = name => name === focused
    ? { ...INPUT, borderColor: "#B08D5B", boxShadow: "0 0 0 3px rgba(176,141,91,0.12)" }
    : INPUT;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1EB", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      {/* Grain */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: GRAIN, backgroundSize: "160px", opacity: 0.038, pointerEvents: "none", zIndex: 100, mixBlendMode: "multiply" }} />

      <Navbar activePath="/contact" />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: "#2C2825",
        position: "relative",
        overflow: "hidden",
        paddingTop: "calc(var(--nav-h) + 2rem)",
        paddingBottom: "5rem",
      }}>
        {/* Grain on hero */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "120px", opacity: 0.07, pointerEvents: "none", mixBlendMode: "screen" }} />

        {/* Gold top rule */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, #B08D5B 30%, #B08D5B 70%, transparent)", opacity: 0.4 }} />

        {/* Radial warm glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(176,141,91,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "2rem", height: "1px", background: "#B08D5B" }} />
              <span style={{ color: "#B08D5B", fontSize: "0.56rem", letterSpacing: "0.44em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                Get in Touch
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(3rem, 5vw, 5rem)",
              color: "#F5F1EB",
              fontWeight: 500,
              lineHeight: 1.08,
              marginBottom: "1.25rem",
            }}>
              Let's{" "}
              <span style={{ fontStyle: "italic", fontWeight: 300, color: "#B08D5B" }}>Connect</span>
            </h1>

            <p style={{
              color: "rgba(245,241,235,0.52)",
              fontSize: "0.9rem",
              fontWeight: 300,
              lineHeight: 1.8,
              maxWidth: "34rem",
              letterSpacing: "0.02em",
            }}>
              Whether you have a question about our presets, need support, or simply want to say hello — we'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT GRID ─────────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem clamp(1.25rem, 5vw, 2.5rem) 6rem" }}>
        <div className="contact-grid">

          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "1.25rem", height: "1px", background: "#B08D5B" }} />
                <span style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.42em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  Contact Info
                </span>
              </div>

              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", color: "#1E1B18", fontWeight: 500, lineHeight: 1.2, marginBottom: "1rem" }}>
                We're Here<br />
                <span style={{ fontStyle: "italic", fontWeight: 300, color: "#B08D5B" }}>to Help</span>
              </h2>
              <p style={{ color: "#7A7065", fontSize: "0.84rem", fontWeight: 300, lineHeight: 1.8 }}>
                Reach out for preset support, licensing questions, collaboration inquiries, or anything else.
              </p>
            </div>

            {/* Contact methods */}
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 6.5L22 7" />
                  </svg>
                ),
                label: "Email",
                value: "pictureperfecttone@gmail.com",
                href: "mailto:pictureperfecttone@gmail.com",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
                  </svg>
                ),
                label: "Instagram",
                value: "@picture_perfect_tones",
                href: "https://www.instagram.com/picture_perfect_tones/",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.073 23.927l6.244-1.636A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.002-1.368l-.36-.214-3.707.972.988-3.61-.235-.371A9.819 9.819 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                ),
                label: "WhatsApp",
                value: "+91 89628 01172",
                href: "https://wa.me/918962801172",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                ),
                label: "Telegram",
                value: "Join our community",
                href: "https://t.me/+6mzV9jmAyt81OTA1",
              },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "flex-start", gap: "1rem",
                  padding: "1.25rem 0",
                  borderBottom: "1px solid rgba(44,40,37,0.08)",
                  textDecoration: "none",
                  transition: "all 200ms",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.paddingLeft = "0.25rem"}
                onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "rgba(176,141,91,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#B08D5B", flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9A9088", fontWeight: 500, marginBottom: "0.2rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.84rem", color: "#2C2825", fontWeight: 400 }}>{item.value}</div>
                </div>
              </a>
            ))}

            {/* Response time note */}
            <div style={{ marginTop: "2rem", padding: "1.25rem 1.5rem", background: "rgba(176,141,91,0.06)", borderLeft: "2px solid #B08D5B", borderRadius: "2px" }}>
              <p style={{ fontSize: "0.78rem", color: "#7A7065", lineHeight: 1.7, fontWeight: 300 }}>
                We typically respond within <strong style={{ color: "#5A544D", fontWeight: 500 }}>24 hours</strong>. For urgent preset support, Telegram is the fastest way to reach us.
              </p>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ background: "white", borderRadius: "4px", padding: "2.5rem", boxShadow: "0 4px 40px rgba(44,40,37,0.07)", border: "1px solid rgba(44,40,37,0.06)" }}>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "3rem 1rem" }}
                >
                  {/* Gold check */}
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(176,141,91,0.1)", border: "1px solid rgba(176,141,91,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B08D5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#1E1B18", fontWeight: 500, marginBottom: "0.75rem" }}>
                    Message <span style={{ fontStyle: "italic", color: "#B08D5B" }}>Received</span>
                  </h3>
                  <p style={{ color: "#7A7065", fontSize: "0.84rem", lineHeight: 1.8, fontWeight: 300, maxWidth: "22rem", margin: "0 auto 2rem" }}>
                    Thank you for reaching out. We'll be in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{ padding: "0.75rem 2rem", background: "#2C2825", color: "#F5EDE0", border: "none", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderRadius: "2px", transition: "background 200ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <>
                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                      <div style={{ width: "1rem", height: "1px", background: "#B08D5B" }} />
                      <span style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Send a Message</span>
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#1E1B18", fontWeight: 500 }}>
                      We'd love to <span style={{ fontStyle: "italic", color: "#B08D5B" }}>hear from you</span>
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    <div className="form-two-col">
                      <div>
                        <label style={LABEL}>Your Name</label>
                        <input
                          name="name" type="text" required
                          value={form.name} onChange={handleChange}
                          placeholder="Priya Sharma"
                          style={focusStyle("name")}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label style={LABEL}>Email Address</label>
                        <input
                          name="email" type="email" required
                          value={form.email} onChange={handleChange}
                          placeholder="priya@example.com"
                          style={focusStyle("email")}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={LABEL}>Subject</label>
                      <select
                        name="subject"
                        value={form.subject} onChange={handleChange}
                        style={{ ...focusStyle("subject"), appearance: "none", cursor: "pointer" }}
                        onFocus={() => setFocused("subject")}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="general">General Enquiry</option>
                        <option value="support">Preset Support</option>
                        <option value="collaboration">Collaboration</option>
                        <option value="licensing">Licensing</option>
                        <option value="other">Something Else</option>
                      </select>
                    </div>

                    <div>
                      <label style={LABEL}>Your Message</label>
                      <textarea
                        name="message" required rows={5}
                        value={form.message} onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        style={{ ...focusStyle("message"), resize: "vertical", minHeight: "130px" }}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%", padding: "1rem", background: "#2C2825", color: "#F5EDE0",
                        border: "none", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.22em",
                        textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                        borderRadius: "2px", transition: "background 250ms",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#B08D5B"}
                      onMouseLeave={e => e.currentTarget.style.background = "#2C2825"}
                    >
                      Send Message
                      <svg width="16" height="10" viewBox="0 0 20 10" fill="none">
                        <path d="M1 5H19M19 5L14.5 1M19 5L14.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>

                    <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#B0A898", fontWeight: 300, letterSpacing: "0.02em" }}>
                      We respect your privacy. No spam, ever.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
