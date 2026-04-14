import { useLocation } from "wouter";

const GRAIN = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const COLLECTIONS = [
  { id: "ivory",       name: "The Ivory Edit"        },
  { id: "crimson",     name: "The Crimson Edit"       },
  { id: "heritage",    name: "The Heritage Edit"      },
  { id: "celebration", name: "The Celebration Edit"   },
  { id: "golden",      name: "The Golden Hour Edit"   },
  { id: "portrait",    name: "The Portrait Edit"      },
];

const EXPLORE = [
  { label: "Shop All Presets",    path: "/shop"             },
  { label: "How Presets Work",    path: null                },
  { label: "Before & After",      path: "/"                 },
  { label: "About pictureprefecttones",path: null                },
];

const SUPPORT = [
  { label: "Contact Us"    },
  { label: "Refund Policy" },
  { label: "FAQ"           },
  { label: "Compatibility" },
];

function IconInstagram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPinterest() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.64 1.267 1.408 0 .858-.546 2.141-.828 3.33-.236.994.497 1.806 1.476 1.806 1.772 0 3.138-1.868 3.138-4.566 0-2.388-1.717-4.058-4.165-4.058-2.837 0-4.5 2.126-4.5 4.326 0 .856.33 1.773.741 2.274a.3.3 0 0 1 .069.285c-.075.314-.245 1-.278 1.14-.044.184-.147.223-.339.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446C17.523 22 22 17.523 22 12S17.523 2 12 2z" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.073 23.927l6.244-1.636A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.002-1.368l-.36-.214-3.707.972.988-3.61-.235-.371A9.819 9.819 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  );
}

const SOCIAL = [
  { icon: <IconInstagram />, label: "Instagram", href: "https://www.instagram.com/picture_perfect_tones/" },
  { icon: <IconPinterest />, label: "Pinterest",  href: "#"                                               },
  { icon: <IconYoutube />,   label: "YouTube",    href: "#"                                               },
  { icon: <IconTelegram />,  label: "Telegram",   href: "https://t.me/+6mzV9jmAyt81OTA1"                 },
  { icon: <IconWhatsApp />,  label: "WhatsApp",   href: "https://wa.me/918962801172"                      },
];

function ColLabel({ children }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      marginBottom: "1.5rem",
    }}>
      <div style={{
        width: "1.25rem",
        height: "1px",
        background: "#B08D5B",
        flexShrink: 0,
      }} />
      <span style={{
        color: "#B08D5B",
        fontSize: "0.52rem",
        letterSpacing: "0.42em",
        textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
      }}>
        {children}
      </span>
    </div>
  );
}

export default function Footer() {
  const [, setLocation] = useLocation();

  const linkStyle = {
    display: "block",
    color: "rgba(245,241,235,0.52)",
    fontSize: "0.82rem",
    fontWeight: 300,
    letterSpacing: "0.02em",
    lineHeight: 1,
    marginBottom: "0.95rem",
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "color 220ms ease",
    background: "none",
    border: "none",
    padding: 0,
    textAlign: "left",
  };

  return (
    <footer style={{
      background: "#2C2825",
      position: "relative",
      overflow: "hidden",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>

      {/* Grain */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: GRAIN,
        backgroundSize: "140px",
        opacity: 0.055,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }} />

      {/* Top gold rule */}
      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #B08D5B 30%, #B08D5B 70%, transparent)", opacity: 0.35 }} />

      {/* Main content */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "4rem 2.5rem 3rem",
        position: "relative",
        zIndex: 1,
      }}>

        {/* 4-column grid */}
        <div className="footer-grid">

          {/* Column 1 — Brand */}
          <div>
            <div
              onClick={() => setLocation("/")}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.6rem",
                fontStyle: "italic",
                fontWeight: 600,
                color: "#F5F1EB",
                letterSpacing: "0.01em",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
            >
              pictureprefecttones
            </div>

            <p style={{
              color: "rgba(245,241,235,0.42)",
              fontSize: "0.8rem",
              fontWeight: 300,
              lineHeight: 1.75,
              maxWidth: "18rem",
              letterSpacing: "0.02em",
              marginBottom: "2rem",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Premium Lightroom presets crafted for the richness, colour, and grandeur of Indian weddings.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "1px solid rgba(245,241,235,0.12)",
                    color: "rgba(245,241,235,0.45)",
                    textDecoration: "none",
                    transition: "all 220ms ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#B08D5B";
                    e.currentTarget.style.color = "#B08D5B";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(245,241,235,0.12)";
                    e.currentTarget.style.color = "rgba(245,241,235,0.45)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Collections */}
          <div>
            <ColLabel>Collections</ColLabel>
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setLocation("/collection/" + c.id)}
                style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = "#D4B483"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(245,241,235,0.52)"}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Column 3 — Explore */}
          <div>
            <ColLabel>Explore</ColLabel>
            {EXPLORE.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && setLocation(item.path)}
                style={{ ...linkStyle, cursor: item.path ? "pointer" : "default" }}
                onMouseEnter={e => { if (item.path) e.currentTarget.style.color = "#D4B483"; }}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(245,241,235,0.52)"}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Column 4 — Support */}
          <div>
            <ColLabel>Support</ColLabel>
            {SUPPORT.map((item) => (
              <button
                key={item.label}
                style={{ ...linkStyle, cursor: "default" }}
              >
                {item.label}
              </button>
            ))}

            {/* Email */}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.38em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: "0.5rem" }}>
                Email
              </div>
              <a
                href="mailto:pictureperfecttone@gmail.com"
                style={{
                  color: "rgba(245,241,235,0.52)",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "color 220ms",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#D4B483"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(245,241,235,0.52)"}
              >
                pictureperfecttone@gmail.com
              </a>
            </div>

            {/* Phone / WhatsApp */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ color: "#B08D5B", fontSize: "0.52rem", letterSpacing: "0.38em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: "0.5rem" }}>
                WhatsApp / Call
              </div>
              <a
                href="https://wa.me/918962801172"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(245,241,235,0.52)",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "color 220ms",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#D4B483"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(245,241,235,0.52)"}
              >
                +91 89628 01172
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <p style={{
            color: "rgba(245,241,235,0.28)",
            fontSize: "0.72rem",
            fontWeight: 300,
            letterSpacing: "0.05em",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            &copy; {new Date().getFullYear()} pictureprefecttones. All rights reserved.
          </p>

          <p style={{
            color: "rgba(245,241,235,0.22)",
            fontSize: "0.7rem",
            fontWeight: 300,
            letterSpacing: "0.04em",
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: "italic",
          }}>
            Made with care for Indian wedding photographers.
          </p>
        </div>
      </div>
    </footer>
  );
}
