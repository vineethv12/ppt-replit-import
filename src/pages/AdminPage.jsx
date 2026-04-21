import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, LogOut, RefreshCw, TrendingUp, Users, ShoppingBag, Star } from "lucide-react";
import * as api from "../lib/api";

/* ── Colour palette ───────────────────────────────────────────── */
const A = {
  bg:          "#0F0D0B",
  sidebar:     "#161412",
  card:        "#1E1A17",
  border:      "rgba(255,255,255,0.08)",
  borderFocus: "#B08D5B",
  gold:        "#B08D5B",
  goldLight:   "#D4AF7A",
  text:        "#F5F1EB",
  textMid:     "rgba(245,241,235,0.6)",
  textLight:   "rgba(245,241,235,0.35)",
  error:       "#E05555",
  success:     "#5BAF7A",
  input:       "#131110",
};

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders",    label: "Orders"    },
];

const serif = "'Playfair Display',serif";
const sans  = "'DM Sans',sans-serif";

/* ── Shared UI helpers ─────────────────────────────────────────── */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${A.border}` }}>
      <h2 style={{ fontFamily: serif, fontSize: "1.3rem", color: A.text, fontWeight: 500, marginBottom: "0.25rem" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "0.78rem", color: A.textMid, fontFamily: sans }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", ...style }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${A.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
    </div>
  );
}

/* ── Setup guide card ─────────────────────────────────────────── */
function SetupCard({ onRetry }) {
  const secrets = [
    { key: "WP_URL",         val: "https://magenta-hornet-709629.hostingersite.com" },
    { key: "PPT_API_SECRET", val: "must match WordPress snippet"                   },
  ];

  return (
    <Card>
      <p style={{ fontFamily: serif, fontSize: "1rem", color: A.goldLight, marginBottom: "0.4rem" }}>Connect WordPress</p>
      <p style={{ fontSize: "0.78rem", color: A.textMid, fontFamily: sans, marginBottom: "1rem", lineHeight: 1.6 }}>
        Add the following <strong style={{ color: A.text }}>Replit Secrets</strong> (lock icon in the left sidebar), then restart the app to load your orders.
      </p>

      <div style={{ background: A.input, borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        {secrets.map(s => (
          <div key={s.key} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.45rem", flexWrap: "wrap", alignItems: "baseline" }}>
            <code style={{ color: A.gold, fontSize: "0.72rem", fontFamily: "monospace", minWidth: 200, flexShrink: 0 }}>{s.key}</code>
            <span style={{ color: A.textLight, fontSize: "0.65rem", fontFamily: sans }}>= {s.val}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onRetry}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(176,141,91,0.12)", border: `1px solid ${A.gold}`, color: A.gold, borderRadius: 6, padding: "0.5rem 1rem", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: sans, fontWeight: 700, cursor: "pointer" }}
      >
        <RefreshCw size={12} /> Retry
      </button>
    </Card>
  );
}

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 10, padding: "1.25rem 1.5rem", flex: "1 1 180px", minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(176,141,91,0.12)", border: `1px solid rgba(176,141,91,0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={A.gold} />
        </div>
        <span style={{ fontSize: "0.62rem", color: A.textLight, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: sans }}>{label}</span>
      </div>
      <p style={{ fontFamily: serif, fontSize: "1.6rem", color: A.text, fontWeight: 500, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.68rem", color: A.textMid, fontFamily: sans, marginTop: "0.35rem" }}>{sub}</p>}
    </div>
  );
}

/* ── Dashboard tab ─────────────────────────────────────────────── */
function DashboardTab() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const byNewest = (arr) =>
    [...arr].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const load = () => {
    setLoading(true);
    setError(null);
    api.getOrders()
      .then(data => { setOrders(byNewest(Array.isArray(data) ? data : [])); setLoading(false); })
      .catch(err => { setError(err.message || "Failed to load orders"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return dateStr; }
  };

  const parseItems = (raw) => {
    try { return typeof raw === "string" ? JSON.parse(raw) : (raw || []); }
    catch { return []; }
  };

  const totalRevenue   = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const uniqueEmails   = new Set(orders.map(o => o.customer_email).filter(Boolean)).size;

  const presetCounts = {};
  orders.forEach(o => {
    parseItems(o.items).forEach(it => {
      const name = it.name || it.id || "";
      if (name) presetCounts[name] = (presetCounts[name] || 0) + 1;
    });
  });
  const topPreset = Object.entries(presetCounts).sort((a, b) => b[1] - a[1])[0];

  const recent5 = orders.slice(0, 5);

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle="Live overview of your sales and customer activity."
      />

      {loading && <Spinner />}

      {!loading && error && <SetupCard onRetry={load} />}

      {!loading && !error && (
        <>
          {/* ── Stats row ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <StatCard icon={ShoppingBag} label="Total Orders"    value={orders.length}                                          sub={orders.length === 1 ? "1 order placed" : `${orders.length} orders placed`} />
            <StatCard icon={TrendingUp}  label="Total Revenue"   value={`₹${totalRevenue.toLocaleString("en-IN")}`}            sub="All-time" />
            <StatCard icon={Users}       label="Customers"       value={uniqueEmails}                                           sub="Unique buyers" />
            <StatCard icon={Star}        label="Top Preset"      value={topPreset ? topPreset[0] : "—"}                        sub={topPreset ? `${topPreset[1]} sale${topPreset[1] !== 1 ? "s" : ""}` : "No sales yet"} />
          </div>

          {/* ── Recent orders ── */}
          <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: serif, fontSize: "1rem", color: A.text, fontWeight: 500 }}>Recent Orders</p>
            <span style={{ fontSize: "0.68rem", color: A.textLight, fontFamily: sans }}>Last 5</span>
          </div>

          {orders.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                <p style={{ color: A.textMid, fontFamily: serif, fontSize: "0.9rem", marginBottom: "0.4rem" }}>No orders yet</p>
                <p style={{ color: A.textLight, fontSize: "0.75rem", fontFamily: sans }}>Orders placed via Razorpay will appear here automatically.</p>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recent5.map((order, i) => {
                const items = parseItems(order.items);
                return (
                  <div key={order.id || i} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 8, padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: serif, color: A.text, fontSize: "0.88rem", marginBottom: "0.2rem" }}>{order.customer_name || "—"}</p>
                      <p style={{ fontSize: "0.68rem", color: A.textLight, fontFamily: sans }}>
                        {fmt(order.created_at)}
                        {items.length > 0 && <span style={{ color: A.textMid }}> · {items.map(it => it.name || it.id).join(", ")}</span>}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                      <span style={{ background: "rgba(91,175,122,0.15)", color: A.success, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 4, fontFamily: sans, fontWeight: 700 }}>Paid</span>
                      <p style={{ fontFamily: serif, color: A.gold, fontSize: "1rem" }}>₹{Number(order.total || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Orders tab ────────────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const WP_BASE = (import.meta.env.VITE_WP_URL || "").replace(/\/+$/, "");

  const byNewest = (arr) =>
    [...arr].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const load = () => {
    setLoading(true);
    setError(null);
    api.getOrders()
      .then(data => { setOrders(byNewest(Array.isArray(data) ? data : [])); setLoading(false); })
      .catch(err => { setError(err.message || "Failed to fetch orders"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    try { return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return dateStr; }
  };

  const parseItems = (raw) => {
    try { return typeof raw === "string" ? JSON.parse(raw) : (raw || []); }
    catch { return []; }
  };

  return (
    <div>
      <SectionHeader
        title="Orders"
        subtitle="All customer orders placed via Razorpay. Download links are automatically emailed after payment."
      />

      {loading && <Spinner />}

      {!loading && error && <SetupCard onRetry={load} />}

      {!loading && !error && orders.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <p style={{ color: A.textMid, fontSize: "0.9rem", fontFamily: serif, marginBottom: "0.5rem" }}>No orders yet</p>
            <p style={{ color: A.textLight, fontSize: "0.75rem", fontFamily: sans }}>Orders placed via Razorpay will appear here automatically.</p>
          </div>
        </Card>
      )}

      {!loading && !error && orders.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ color: A.textMid, fontSize: "0.78rem", fontFamily: sans, fontWeight: 600 }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={load}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "none", border: `1px solid ${A.border}`, color: A.textLight, borderRadius: 6, padding: "0.3rem 0.65rem", fontSize: "0.68rem", fontFamily: sans, cursor: "pointer" }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {orders.map((order, i) => {
              const items = parseItems(order.items);
              const dlCounts = Array.isArray(order.download_counts) ? order.download_counts : [];
              const dlByPreset = {};
              dlCounts.forEach(d => { dlByPreset[d.preset_id] = d; });
              const downloadUrl = order.token && WP_BASE
                ? `${WP_BASE}/wp-json/ppt/v1/download/${order.token}`
                : null;

              return (
                <Card key={order.id || i} style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + status */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
                        <p style={{ fontFamily: serif, color: A.text, fontSize: "0.95rem" }}>{order.customer_name || "—"}</p>
                        <span style={{ background: "rgba(91,175,122,0.18)", color: A.success, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 4, fontFamily: sans, fontWeight: 700, flexShrink: 0 }}>Paid</span>
                      </div>

                      {/* Email · Phone */}
                      <p style={{ color: A.textMid, fontSize: "0.76rem", fontFamily: sans, marginBottom: "0.2rem" }}>
                        {order.customer_email || "—"}
                        {order.customer_phone ? <span style={{ color: A.textLight }}> · {order.customer_phone}</span> : null}
                      </p>

                      {/* Date · Payment ID */}
                      <p style={{ color: A.textLight, fontSize: "0.68rem", fontFamily: sans, marginBottom: "0.75rem" }}>
                        {fmt(order.created_at)}
                        {order.payment_id && <span> · <span style={{ color: A.textMid, fontFamily: "monospace", fontSize: "0.65rem" }}>{order.payment_id}</span></span>}
                      </p>

                      {/* Preset tags */}
                      {items.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {items.map((item, ii) => {
                            const pid   = item.id || item.name || "";
                            const dc    = dlByPreset[pid];
                            const count = dc ? Number(dc.download_count || 0) : 0;
                            return (
                              <div key={ii} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span style={{ background: "rgba(176,141,91,0.1)", border: "1px solid rgba(176,141,91,0.25)", color: A.goldLight, fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: 4, fontFamily: sans }}>
                                  {item.name || pid}
                                  {item.price && <span style={{ color: A.textMid }}> · ₹{Number(item.price).toLocaleString("en-IN")}</span>}
                                </span>
                                <span style={{ fontSize: "0.62rem", color: count > 0 ? A.success : A.textLight, fontFamily: sans }}>
                                  {count > 0 ? `↓ ${count}` : "Not downloaded"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Amount + download link */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: serif, color: A.gold, fontSize: "1.15rem", marginBottom: "0.5rem" }}>
                        ₹{Number(order.total || 0).toLocaleString("en-IN")}
                      </p>
                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(176,141,91,0.1)", border: "1px solid rgba(176,141,91,0.3)", color: A.gold, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: sans, padding: "0.3rem 0.65rem", borderRadius: 5, textDecoration: "none", fontWeight: 600 }}
                        >
                          Download link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Login screen ──────────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [missingEnv, setMissingEnv] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMissingEnv(false);

    try {
      await api.adminLogin(email.trim().toLowerCase(), password);
      setLoading(false);
      onLogin();
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("503") || msg.toLowerCase().includes("not configured")) {
        setMissingEnv(true);
      } else {
        setError("Incorrect email or password.");
      }
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: A.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src="/logo.png" alt="PicturePerfectTones" style={{ height: 70, display: "block", margin: "0 auto", filter: "invert(1)", marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: A.textLight }}>Admin Panel</div>
        </div>

        {/* Missing env banner */}
        {missingEnv && (
          <div style={{ background: "rgba(176,141,91,0.08)", border: `1px solid rgba(176,141,91,0.3)`, borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
            <p style={{ color: A.goldLight, fontSize: "0.78rem", fontWeight: 700, fontFamily: sans, marginBottom: "0.5rem" }}>
              Admin credentials not configured
            </p>
            <p style={{ color: A.textMid, fontSize: "0.72rem", fontFamily: sans, lineHeight: 1.6, marginBottom: "0.75rem" }}>
              Add these <strong style={{ color: A.text }}>Replit Secrets</strong> (lock icon in the sidebar) and restart the app:
            </p>
            <div style={{ background: A.input, borderRadius: 6, padding: "0.75rem 1rem" }}>
              {[
                ["ADMIN_EMAIL",    "ppt@gmail.com"],
                ["ADMIN_PASSWORD", "your chosen password"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", alignItems: "baseline", flexWrap: "wrap" }}>
                  <code style={{ color: A.gold, fontSize: "0.72rem", fontFamily: "monospace", minWidth: 160, flexShrink: 0 }}>{k}</code>
                  <span style={{ color: A.textLight, fontSize: "0.65rem", fontFamily: sans }}>= {v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <form onSubmit={handleSubmit} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: "2rem" }}>
          <p style={{ fontSize: "1rem", color: A.text, fontWeight: 600, marginBottom: "1.5rem", fontFamily: serif }}>
            Sign in to continue
          </p>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, marginBottom: "0.35rem" }}>Email</label>
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); setMissingEnv(false); }}
              placeholder="your@email.com" autoComplete="email" required
              data-testid="input-email"
              style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.7rem 0.75rem", color: A.text, fontSize: "0.82rem", outline: "none", boxSizing: "border-box", fontFamily: sans }}
              onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
              onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: error ? "0.75rem" : "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, marginBottom: "0.35rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); setMissingEnv(false); }}
                placeholder="••••••••" autoComplete="current-password" required
                data-testid="input-password"
                style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.7rem 2.5rem 0.7rem 0.75rem", color: A.text, fontSize: "0.82rem", outline: "none", boxSizing: "border-box", fontFamily: sans }}
                onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
                onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: A.textLight, display: "flex", padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p style={{ fontSize: "0.75rem", color: A.error, marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

          <button type="submit" disabled={loading} data-testid="button-signin"
            style={{ width: "100%", background: A.gold, color: "#0F0D0B", border: "none", borderRadius: 6, padding: "0.8rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: sans, opacity: loading ? 0.7 : 1, transition: "opacity 200ms" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [, setLocation]  = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authed, setAuthed]       = useState(() => !!api.getAdminToken());

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabContent = {
    dashboard: <DashboardTab />,
    orders:    <OrdersTab />,
  };

  return (
    <div style={{ minHeight: "100vh", background: A.bg, fontFamily: sans, display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <header style={{ background: A.sidebar, borderBottom: `1px solid ${A.border}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <button
            onClick={() => setLocation("/")}
            style={{ background: "none", border: "none", cursor: "pointer", color: A.textMid, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: sans, transition: "color 200ms" }}
            onMouseEnter={e => e.currentTarget.style.color = A.text}
            onMouseLeave={e => e.currentTarget.style.color = A.textMid}
            data-testid="button-back-to-site"
          >
            <ArrowLeft size={14} /> Back to site
          </button>
          <span style={{ width: 1, height: 20, background: A.border }} />
          <img src="/logo.png" alt="PicturePerfectTones" style={{ height: 40, display: "block", filter: "invert(1)" }} />
          <span style={{ fontSize: "0.62rem", color: A.textLight, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: sans }}>Admin</span>
        </div>
        <button
          onClick={() => { api.adminLogout(); setAuthed(false); }}
          style={{ background: "none", border: `1px solid ${A.border}`, cursor: "pointer", color: A.textMid, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: sans, borderRadius: 6, padding: "0.4rem 0.75rem", transition: "all 200ms" }}
          onMouseEnter={e => { e.currentTarget.style.color = A.error; e.currentTarget.style.borderColor = A.error; }}
          onMouseLeave={e => { e.currentTarget.style.color = A.textMid; e.currentTarget.style.borderColor = A.border; }}
          data-testid="button-logout"
        >
          <LogOut size={13} /> Logout
        </button>
      </header>

      {/* ── Tab bar ── */}
      <div style={{ background: A.sidebar, borderBottom: `1px solid ${A.border}`, padding: "0 2rem", display: "flex", gap: "0.25rem" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-${tab.id}`}
            style={{ background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? A.gold : "transparent"}`, color: activeTab === tab.id ? A.gold : A.textMid, padding: "0.85rem 1rem", fontSize: "0.78rem", letterSpacing: "0.1em", fontFamily: sans, cursor: "pointer", transition: "all 200ms", fontWeight: activeTab === tab.id ? 600 : 400 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {tabContent[activeTab]}
        </div>
      </main>
    </div>
  );
}
