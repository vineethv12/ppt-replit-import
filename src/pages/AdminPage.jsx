import { useState, useCallback, useRef } from "react";
import { useContent, DEFAULT_CONTENT } from "../context/ContentContext";
import { useLocation } from "wouter";
import { Save, RotateCcw, Plus, Trash2, ArrowLeft, Image, ChevronDown, ChevronUp, ExternalLink, Upload, X as XIcon, Eye, EyeOff, LogOut } from "lucide-react";
import * as api from "../lib/api";

const ADMINS = [
  {
    email: "abhishekjangde020@gmail.com",
    password: "Abhishek@007",
  },
  {
    email: "ppt@gmail.com",
    password: "123",
  }
];

const SESSION_KEY = "pp_admin_token";

function getToken() {
  const t = sessionStorage.getItem(SESSION_KEY);
  return t && t !== "dev" && api.hasApi() ? t : null;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

 function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  setTimeout(() => {
    const isValid = ADMINS.some(
      (admin) =>
        admin.email === email.trim().toLowerCase() &&
        admin.password === password
    );

    if (isValid) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onLogin();
    } else {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  }, 500);
}

  return (
    <div style={{ minHeight: "100vh", background: A.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: A.text, fontStyle: "italic", letterSpacing: "0.02em", marginBottom: "0.4rem" }}>
            pictureprefecttones
          </div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: A.textLight }}>
            Admin Panel
          </div>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: "2rem" }}>
          <p style={{ fontSize: "1rem", color: A.text, fontWeight: 600, marginBottom: "1.5rem", fontFamily: "'Playfair Display',serif" }}>
            Sign in to continue
          </p>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, marginBottom: "0.35rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              autoComplete="email"
              required
              style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.7rem 0.75rem", color: A.text, fontSize: "0.82rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }}
              onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
              onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: error ? "0.75rem" : "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, marginBottom: "0.35rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.7rem 2.5rem 0.7rem 0.75rem", color: A.text, fontSize: "0.82rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" }}
                onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
                onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: A.textLight, display: "flex", alignItems: "center", padding: 0 }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: "0.75rem", color: A.error, marginBottom: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: A.gold, color: "#0F0D0B", border: "none", borderRadius: 6, padding: "0.8rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1, transition: "opacity 200ms" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function extractYouTubeId(input) {
  if (!input) return "";
  const clean = input.trim();
  try {
    const url = new URL(clean);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0];
    if (url.searchParams.has("v")) return url.searchParams.get("v");
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1].split("?")[0];
  } catch {}
  return clean;
}

function compressImage(file, maxPx = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) { height = Math.round((height / width) * maxPx); width = maxPx; }
          else { width = Math.round((width / height) * maxPx); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const A = {
  bg: "#0F0D0B",
  sidebar: "#161412",
  card: "#1E1A17",
  border: "rgba(255,255,255,0.08)",
  borderFocus: "#B08D5B",
  gold: "#B08D5B",
  goldLight: "#D4AF7A",
  text: "#F5F1EB",
  textMid: "rgba(245,241,235,0.6)",
  textLight: "rgba(245,241,235,0.35)",
  error: "#E05555",
  success: "#5BAF7A",
  input: "#131110",
};

const TABS = [
  { id: "home",        label: "Home" },
  { id: "presets",     label: "Presets" },
  { id: "collections", label: "Collections" },
  { id: "gallery",     label: "Gallery" },
  { id: "process",     label: "Process" },
];

function required(val) {
  return !val || !String(val).trim() ? "This field is required" : "";
}
function validPrice(val) {
  return !/^₹[\d,]+$/.test(String(val).trim()) ? "Must be like ₹3,999" : "";
}
function validYtUrl(val) {
  return !String(val).trim() ? "Required" : "";
}

function Field({ label, value, onChange, error, placeholder, type = "text", multiline, required: req }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.35rem" }}>
        {label}{req && <span style={{ color: A.gold, marginLeft: 3 }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.65rem 0.75rem", color: A.text, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border-color 200ms" }}
          onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
          onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.65rem 0.75rem", color: A.text, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 200ms" }}
          onFocus={e => e.target.style.borderColor = error ? A.error : A.borderFocus}
          onBlur={e => e.target.style.borderColor = error ? A.error : "rgba(255,255,255,0.1)"}
        />
      )}
      {error && <p style={{ color: A.error, fontSize: "0.67rem", marginTop: "0.3rem", fontFamily: "'DM Sans',sans-serif" }}>{error}</p>}
    </div>
  );
}

function ImgField({ label, value, onChange, error, optional }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      alert("Failed to process image. Please try another file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.45rem" }}>
        {label} {!optional && <span style={{ color: A.gold }}>*</span>}
      </label>

      <div
        style={{ border: `1.5px dashed ${error ? A.error : value ? "rgba(176,141,91,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, overflow: "hidden", background: A.input, cursor: "pointer", transition: "border-color 200ms" }}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = A.gold; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = error ? A.error : value ? "rgba(176,141,91,0.4)" : "rgba(255,255,255,0.12)"; }}
        onDrop={async (e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = value ? "rgba(176,141,91,0.4)" : "rgba(255,255,255,0.12)";
          const file = e.dataTransfer.files?.[0];
          if (!file || !file.type.startsWith("image/")) return;
          setLoading(true);
          try { onChange(await compressImage(file)); } catch {} finally { setLoading(false); }
        }}
      >
        {value ? (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.5rem" }}>
            <div style={{ position: "relative", width: 72, flexShrink: 0, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ paddingBottom: "150%", position: "relative" }}>
                <img src={value} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{ background: "rgba(176,141,91,0.85)", border: "none", color: "#1A1208", padding: "0.3rem 0.7rem", borderRadius: 4, fontSize: "0.65rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Upload size={10} /> Replace
            </button>
          </div>
        ) : (
          <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {loading ? (
              <p style={{ color: A.textMid, fontSize: "0.75rem", fontFamily: "'DM Sans',sans-serif" }}>Processing…</p>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(176,141,91,0.12)", border: "1px solid rgba(176,141,91,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={16} color={A.gold} />
                </div>
                <p style={{ color: A.textMid, fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif", textAlign: "center", lineHeight: 1.4 }}>
                  Click or drag to upload<br />
                  <span style={{ color: A.textLight, fontSize: "0.62rem" }}>JPG, PNG, WEBP — max 10 MB</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {error && <p style={{ color: A.error, fontSize: "0.67rem", marginTop: "0.3rem", fontFamily: "'DM Sans',sans-serif" }}>{error}</p>}
    </div>
  );
}

function CompactImgUpload({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try { onChange(await compressImage(file)); } catch {} finally { setLoading(false); e.target.value = ""; }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{ width: 52, height: 52, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => inputRef.current?.click()}
          title="Click to upload"
        >
          {value ? (
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
          ) : loading ? (
            <span style={{ fontSize: "0.55rem", color: A.textMid, fontFamily: "'DM Sans',sans-serif" }}>…</span>
          ) : (
            <Upload size={14} color={A.textLight} />
          )}
        </div>
        {value && (
          <button onClick={() => onChange("")} style={{ position: "absolute", top: -6, right: -6, background: A.error, border: "none", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <XIcon size={9} color="#fff" />
          </button>
        )}
      </div>
      {!value && (
        <button
          onClick={() => inputRef.current?.click()}
          style={{ background: A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.45rem 0.7rem", color: A.textLight, fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}
        >
          {loading ? "Processing…" : "Upload"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {error && <p style={{ color: A.error, fontSize: "0.6rem", marginTop: "0.2rem" }}>{error}</p>}
    </div>
  );
}

function VideoUpload({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target.result); setLoading(false); };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const filename = value ? (value.startsWith("data:") ? "✓ Video uploaded" : value.split("/").pop()) : null;

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1 }}>
      <div
        style={{ width: 52, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={() => inputRef.current?.click()}
        title="Click to upload video"
      >
        {value ? (
          <video src={value} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
        ) : loading ? (
          <span style={{ fontSize: "0.55rem", color: A.textMid, fontFamily: "'DM Sans',sans-serif" }}>…</span>
        ) : (
          <Upload size={14} color={A.textLight} />
        )}
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        style={{ flex: 1, background: value ? "rgba(176,141,91,0.1)" : A.input, border: `1px solid ${error ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.45rem 0.7rem", color: value ? A.gold : A.textLight, fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {loading ? "Reading…" : filename || "Click to upload video…"}
      </button>
      {value && (
        <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: A.error, flexShrink: 0, display: "flex" }}>
          <XIcon size={13} />
        </button>
      )}
      <input ref={inputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${A.border}` }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", color: A.text, fontWeight: 500, marginBottom: "0.25rem" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "0.78rem", color: A.textMid, fontFamily: "'DM Sans',sans-serif" }}>{subtitle}</p>}
    </div>
  );
}

function SaveBar({ onSave, saved, errors }) {
  const hasErrors = Object.values(errors).some(Boolean);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: `1px solid ${A.border}` }}>
      <button
        onClick={onSave}
        disabled={hasErrors}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: hasErrors ? "rgba(176,141,91,0.25)" : A.gold, color: hasErrors ? A.textLight : "#1A1208", border: "none", padding: "0.7rem 1.5rem", borderRadius: 6, fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, cursor: hasErrors ? "not-allowed" : "pointer", transition: "background 220ms" }}
        onMouseEnter={e => { if (!hasErrors) e.currentTarget.style.background = A.goldLight; }}
        onMouseLeave={e => { if (!hasErrors) e.currentTarget.style.background = A.gold; }}
      >
        <Save size={14} strokeWidth={2} />
        Save Changes
      </button>
      {saved && <span style={{ color: A.success, fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif" }}>✓ Saved successfully</span>}
      {hasErrors && <span style={{ color: A.error, fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif" }}>Fix errors above before saving</span>}
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

function Pill({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(176,141,91,0.15)", border: "1px solid rgba(176,141,91,0.3)", color: A.goldLight, fontSize: "0.7rem", padding: "0.25rem 0.6rem", borderRadius: 9999, fontFamily: "'DM Sans',sans-serif" }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", lineHeight: 1, padding: 0, display: "flex" }}>×</button>
      )}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   HOME TAB
══════════════════════════════════════════════════════ */
function HomeTab() {
  const { content, updateContent } = useContent();
  const [pairs, setPairs] = useState(content.baPairs);
  const [cols, setCols] = useState(content.landingCollections);
  const [pairErrors, setPairErrors] = useState({});
  const [colErrors, setColErrors] = useState({});
  const [savedPairs, setSavedPairs] = useState(false);
  const [savedCols, setSavedCols] = useState(false);
  const [expandedCol, setExpandedCol] = useState(0);

  const validatePairs = () => {
    const errs = {};
    pairs.forEach((p, i) => {
      if (!p.b.trim()) errs[`b${i}`] = "Required";
      if (!p.a.trim()) errs[`a${i}`] = "Required";
    });
    return errs;
  };

  const savePairs = () => {
    const errs = validatePairs();
    setPairErrors(errs);
    if (Object.keys(errs).length) return;
    updateContent("baPairs", pairs);
    const token = getToken();
    if (token) api.syncBaPairs(pairs, token).catch(console.error);
    setSavedPairs(true);
    setTimeout(() => setSavedPairs(false), 3000);
  };

  const validateCols = () => {
    const errs = {};
    cols.forEach((c, i) => {
      if (!c.name.trim()) errs[`name${i}`] = "Required";
      if (!c.tagline.trim()) errs[`tagline${i}`] = "Required";
      if (!c.description.trim()) errs[`desc${i}`] = "Required";
      const pe = validPrice(c.price); if (pe) errs[`price${i}`] = pe;
      if (!c.images.hero.trim()) errs[`hero${i}`] = "Required";
      if (!c.images.mid.trim()) errs[`mid${i}`] = "Required";
      if (!c.images.sm.trim()) errs[`sm${i}`] = "Required";
    });
    return errs;
  };

  const saveCols = () => {
    const errs = validateCols();
    setColErrors(errs);
    if (Object.keys(errs).length) return;
    updateContent("landingCollections", cols);
    const token = getToken();
    if (token) api.syncLandingCollections(cols, token).catch(console.error);
    setSavedCols(true);
    setTimeout(() => setSavedCols(false), 3000);
  };

  const updatePair = (i, key, val) => {
    setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p));
    setPairErrors(prev => { const n = { ...prev }; delete n[`${key}${i}`]; return n; });
  };

  const updateCol = (i, key, val) => {
    setCols(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
    setColErrors(prev => { const n = { ...prev }; delete n[`${key}${i}`]; return n; });
  };

  const updateColImg = (i, imgKey, val) => {
    setCols(prev => prev.map((c, idx) => idx === i ? { ...c, images: { ...c.images, [imgKey]: val } } : c));
    setColErrors(prev => { const n = { ...prev }; delete n[`${imgKey}${i}`]; return n; });
  };

  const addCollection = () => {
    const next = cols.length + 1;
    setCols(prev => [...prev, {
      id: `collection${next}`, num: String(next).padStart(2, "0"), name: "", mood: [],
      tagline: "", description: "", includes: [], price: "₹0",
      images: { hero: "", mid: "", sm: "", alt: "" },
      accent: "rgba(176,141,91,0.1)", flip: next % 2 === 0,
    }]);
    setExpandedCol(cols.length);
  };

  const deleteCollection = (i) => {
    setCols(prev => prev.filter((_, idx) => idx !== i));
    setExpandedCol(null);
  };

  return (
    <div>
      {/* ── Transformation BA Pairs ── */}
      <SectionHeader title="Transformation — Before / After" subtitle="Replace the before and after images for each comparison pair. You cannot add or remove pairs." />
      {pairs.map((pair, i) => (
        <Card key={i}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: A.gold, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.85rem" }}>Pair {i + 1}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <ImgField label="Before Image" value={pair.b} onChange={v => updatePair(i, "b", v)} error={pairErrors[`b${i}`]} />
            <ImgField label="After Image" value={pair.a} onChange={v => updatePair(i, "a", v)} error={pairErrors[`a${i}`]} />
          </div>
        </Card>
      ))}
      <SaveBar onSave={savePairs} saved={savedPairs} errors={pairErrors} />

      <div style={{ marginTop: "2.5rem" }}>
        <SectionHeader title="Signature Collections" subtitle="Edit text, price, mood tags, and images. You can also add or remove collections." />
        {cols.map((col, i) => (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: expandedCol === i ? "1rem" : 0 }} onClick={() => setExpandedCol(expandedCol === i ? null : i)}>
              <div>
                <p style={{ color: A.text, fontSize: "0.88rem", fontFamily: "'Playfair Display',serif", marginBottom: 2 }}>{col.name || `Collection ${i + 1}`}</p>
                <p style={{ color: A.textLight, fontSize: "0.7rem", fontFamily: "'DM Sans',sans-serif" }}>#{col.num}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {expandedCol === i ? <ChevronUp size={16} color={A.textMid} /> : <ChevronDown size={16} color={A.textMid} />}
              </div>
            </div>

            {expandedCol === i && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                  <Field label="Collection Name" value={col.name} onChange={v => updateCol(i, "name", v)} error={colErrors[`name${i}`]} required placeholder="The Ivory Edit" />
                  <Field label="Price" value={col.price} onChange={v => updateCol(i, "price", v)} error={colErrors[`price${i}`]} required placeholder="₹3,999" />
                </div>
                <Field label="Tagline" value={col.tagline} onChange={v => updateCol(i, "tagline", v)} error={colErrors[`tagline${i}`]} required placeholder="For stories told in whispers and light." />
                <Field label="Description" value={col.description} onChange={v => updateCol(i, "description", v)} error={colErrors[`desc${i}`]} required multiline placeholder="Describe this preset collection..." />

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.5rem" }}>Mood Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                    {col.mood.map((m, mi) => (
                      <Pill key={mi} label={m} onRemove={() => updateCol(i, "mood", col.mood.filter((_, x) => x !== mi))} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input id={`mood-input-${i}`} placeholder="e.g. Warm" style={{ flex: 1, background: A.input, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "0.5rem 0.65rem", color: A.text, fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif", outline: "none" }}
                      onKeyDown={e => { if (e.key === "Enter") { const v = e.target.value.trim(); if (v) { updateCol(i, "mood", [...col.mood, v]); e.target.value = ""; } } }} />
                    <button onClick={() => { const el = document.getElementById(`mood-input-${i}`); if (el && el.value.trim()) { updateCol(i, "mood", [...col.mood, el.value.trim()]); el.value = ""; } }} style={{ background: A.gold, border: "none", color: "#1A1208", padding: "0.5rem 0.85rem", borderRadius: 6, cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>+ Add</button>
                  </div>
                </div>


                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.5rem" }}>What's Included</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {col.includes.map((inc, ii) => (
                      <input key={ii} value={inc} onChange={e => { const updated = [...col.includes]; updated[ii] = e.target.value; updateCol(i, "includes", updated); }} style={{ width: "100%", background: A.input, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "0.45rem 0.65rem", color: A.text, fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" }} />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: "0.68rem", color: A.gold, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}>Images</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                  <ImgField label="Hero Image" value={col.images.hero} onChange={v => updateColImg(i, "hero", v)} error={colErrors[`hero${i}`]} />
                  <ImgField label="Middle Image" value={col.images.mid} onChange={v => updateColImg(i, "mid", v)} error={colErrors[`mid${i}`]} />
                  <ImgField label="Small Image" value={col.images.sm} onChange={v => updateColImg(i, "sm", v)} error={colErrors[`sm${i}`]} />
                </div>
              </div>
            )}
          </Card>
        ))}
        <SaveBar onSave={saveCols} saved={savedCols} errors={colErrors} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRESETS TAB
══════════════════════════════════════════════════════ */
function PresetsTab() {
  const { content, updateContent } = useContent();
  const [products, setProducts] = useState(content.products);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(0);

  const updateProduct = (i, key, val) => {
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p));
    setErrors(prev => { const n = { ...prev }; delete n[`${key}${i}`]; return n; });
  };

  const addProduct = () => {
    const newProduct = { id: Date.now(), name: "", tagline: "", price: "", img: "", badge: null, count: 1 };
    setProducts(prev => [...prev, newProduct]);
    setExpanded(products.length);
  };

  const deleteProduct = (i, e) => {
    e.stopPropagation();
    setProducts(prev => prev.filter((_, idx) => idx !== i));
    setExpanded(null);
  };

  const validate = () => {
    const errs = {};
    products.forEach((p, i) => {
      if (!p.name.trim()) errs[`name${i}`] = "Required";
      if (!p.tagline.trim()) errs[`tagline${i}`] = "Required";
      const pe = validPrice(p.price); if (pe) errs[`price${i}`] = pe;
      if (!p.img.trim()) errs[`img${i}`] = "Required";
      if (!p.count || p.count < 1) errs[`count${i}`] = "Must be ≥ 1";
    });
    return errs;
  };

  const save = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    updateContent("products", products);
    const token = getToken();
    if (token) api.syncPresets(products, token).catch(console.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const BADGE_OPTIONS = ["", "Bestseller", "New", "Sale", "Popular"];

  return (
    <div>
      <SectionHeader title="Preset Products" subtitle="Edit each preset card shown on the Shop page." />
      {products.map((p, i) => (
        <Card key={p.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: expanded === i ? "1rem" : 0 }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 40, height: 48, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <p style={{ color: A.text, fontSize: "0.88rem", fontFamily: "'Playfair Display',serif", marginBottom: 2 }}>{p.name || <span style={{ color: A.textMid, fontStyle: "italic" }}>New Product</span>}</p>
                <p style={{ color: A.gold, fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif" }}>{p.price}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button onClick={e => deleteProduct(i, e)} style={{ background: "rgba(224,85,85,0.15)", border: "1px solid rgba(224,85,85,0.3)", color: "#e05555", padding: "0.3rem 0.45rem", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center" }} title="Delete product">
                <Trash2 size={13} />
              </button>
              {expanded === i ? <ChevronUp size={16} color={A.textMid} /> : <ChevronDown size={16} color={A.textMid} />}
            </div>
          </div>

          {expanded === i && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                <Field label="Name" value={p.name} onChange={v => updateProduct(i, "name", v)} error={errors[`name${i}`]} required placeholder="The Ivory Edit" />
                <Field label="Price" value={p.price} onChange={v => updateProduct(i, "price", v)} error={errors[`price${i}`]} required placeholder="₹3,999" />
              </div>
              <Field label="Tagline" value={p.tagline} onChange={v => updateProduct(i, "tagline", v)} error={errors[`tagline${i}`]} required placeholder="Soft, ethereal luminosity" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.35rem" }}>Badge</label>
                  <select value={p.badge || ""} onChange={e => updateProduct(i, "badge", e.target.value || null)} style={{ width: "100%", background: A.input, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "0.65rem 0.75rem", color: A.text, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.35rem" }}>Preset Count <span style={{ color: A.gold }}>*</span></label>
                  <input type="number" min="1" value={p.count} onChange={e => updateProduct(i, "count", parseInt(e.target.value) || 0)} style={{ width: "100%", background: A.input, border: `1px solid ${errors[`count${i}`] ? A.error : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "0.65rem 0.75rem", color: A.text, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" }} />
                  {errors[`count${i}`] && <p style={{ color: A.error, fontSize: "0.67rem", marginTop: "0.25rem" }}>{errors[`count${i}`]}</p>}
                </div>
              </div>
              <ImgField label="Card Image" value={p.img} onChange={v => updateProduct(i, "img", v)} error={errors[`img${i}`]} />
            </div>
          )}
        </Card>
      ))}
      <button onClick={addProduct} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(176,141,91,0.1)", border: "1px dashed rgba(176,141,91,0.4)", color: A.gold, padding: "0.65rem 1.25rem", borderRadius: 8, cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.12em", fontFamily: "'DM Sans',sans-serif", width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}>
        <Plus size={15} /> Add Product
      </button>
      <SaveBar onSave={save} saved={saved} errors={errors} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COLLECTIONS TAB
══════════════════════════════════════════════════════ */
function CollectionsTab() {
  const { content, updateContent } = useContent();
  const collectionIds = Object.keys(content.collectionData);
  const [activeId, setActiveId] = useState(collectionIds[0]);
  const [draft, setDraft] = useState({ ...content.collectionData[collectionIds[0]] });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const switchCollection = (id) => {
    setActiveId(id);
    setDraft({ ...content.collectionData[id] });
    setErrors({});
    setSaved(false);
  };

  const set = (key, val) => {
    setDraft(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!draft.name?.trim()) errs.name = "Required";
    if (!draft.tagline?.trim()) errs.tagline = "Required";
    if (!draft.description?.trim()) errs.description = "Required";
    const pe = validPrice(draft.price); if (pe) errs.price = pe;
    if (!draft.hero?.trim()) errs.hero = "Required";
    draft.pairs?.forEach((p, i) => {
      if (!(p.before || p.img)?.trim()) errs[`pairBefore${i}`] = "Required";
      if (!(p.after || p.img)?.trim()) errs[`pairAfter${i}`] = "Required";
    });
    draft.gallery?.forEach((g, i) => { if (!g?.trim()) errs[`gallery${i}`] = "Required"; });
    return errs;
  };

  const save = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    updateContent("collectionData", { ...content.collectionData, [activeId]: draft });
    const token = getToken();
    if (token) api.saveCollectionDetail(activeId, draft, token).catch(console.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updatePair = (i, field, val) => {
    const pairs = [...(draft.pairs || [])];
    pairs[i] = { ...pairs[i], [field]: val };
    set("pairs", pairs);
  };

  const updateGallery = (i, val) => {
    const gallery = [...(draft.gallery || [])];
    gallery[i] = val;
    set("gallery", gallery);
  };

  return (
    <div>
      <SectionHeader title="View Collection Pages" subtitle="Select a preset collection and edit its detail page content." />
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {collectionIds.map(id => (
          <button key={id} onClick={() => switchCollection(id)} style={{ padding: "0.45rem 1rem", borderRadius: 9999, border: `1px solid ${activeId === id ? A.gold : "rgba(255,255,255,0.12)"}`, background: activeId === id ? "rgba(176,141,91,0.15)" : "transparent", color: activeId === id ? A.gold : A.textMid, fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", textTransform: "capitalize", transition: "all 200ms" }}>
            {id}
          </button>
        ))}
      </div>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Collection Name" value={draft.name || ""} onChange={v => set("name", v)} error={errors.name} required placeholder="The Ivory Edit" />
          <Field label="Price" value={draft.price || ""} onChange={v => set("price", v)} error={errors.price} required placeholder="₹3,999" />
        </div>
        <Field label="Tagline" value={draft.tagline || ""} onChange={v => set("tagline", v)} error={errors.tagline} required placeholder="Soft, ethereal luminosity for intimate moments" />
        <Field label="Description" value={draft.description || ""} onChange={v => set("description", v)} error={errors.description} required multiline />
        <ImgField label="Hero Image" value={draft.hero || ""} onChange={v => set("hero", v)} error={errors.hero} />
      </Card>

      <p style={{ fontSize: "0.68rem", color: A.gold, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}>Before / After Pairs</p>
      {(draft.pairs || []).map((pair, i) => (
        <Card key={i} style={{ marginBottom: "0.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: A.textMid, fontSize: "0.67rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}>Pair {i + 1}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                <ImgField label="Before Image" value={pair.before || pair.img || ""} onChange={v => updatePair(i, "before", v)} error={errors[`pairBefore${i}`]} />
                <ImgField label="After Image" value={pair.after || pair.img || ""} onChange={v => updatePair(i, "after", v)} error={errors[`pairAfter${i}`]} />
              </div>
            </div>
            {(draft.pairs || []).length > 1 && (
              <button onClick={() => set("pairs", draft.pairs.filter((_, x) => x !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: A.error, marginLeft: "0.75rem", marginTop: "1.5rem", display: "flex" }}><Trash2 size={14} /></button>
            )}
          </div>
        </Card>
      ))}
      <button onClick={() => set("pairs", [...(draft.pairs || []), { before: "", after: "" }])} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(176,141,91,0.08)", border: "1px dashed rgba(176,141,91,0.35)", color: A.gold, padding: "0.55rem 1rem", borderRadius: 6, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'DM Sans',sans-serif", marginBottom: "1.5rem" }}>
        <Plus size={13} /> Add Pair
      </button>

      <p style={{ fontSize: "0.68rem", color: A.gold, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}>Gallery Images</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.75rem" }}>
        {(draft.gallery || []).map((src, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: A.card, border: `1px solid ${A.border}`, borderRadius: 8, padding: "0.65rem 0.75rem" }}>
            <CompactImgUpload value={src} onChange={v => updateGallery(i, v)} error={errors[`gallery${i}`]} />
            <button onClick={() => set("gallery", draft.gallery.filter((_, x) => x !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: A.error, display: "flex", flexShrink: 0 }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => set("gallery", [...(draft.gallery || []), ""])} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(176,141,91,0.08)", border: "1px dashed rgba(176,141,91,0.35)", color: A.gold, padding: "0.55rem 1rem", borderRadius: 6, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.5rem" }}>
        <Plus size={13} /> Add Gallery Image
      </button>
      <SaveBar onSave={save} saved={saved} errors={errors} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GALLERY TAB
══════════════════════════════════════════════════════ */
function autoAlt(filename, type) {
  if (!filename || filename.startsWith("data:")) {
    return type === "reel" ? "Wedding reel" : "Wedding photo";
  }
  const base = filename.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").trim();
  return base || (type === "reel" ? "Wedding reel" : "Wedding photo");
}

function GalleryTab() {
  const { content, updateContent } = useContent();
  const [media, setMedia] = useState(content.media);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");
  const photoInputRef = useRef(null);
  const reelInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replaceTarget = useRef(null);

  const nextId = () => Math.max(0, ...media.map(m => m.id)) + 1;

  const addPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    try {
      const src = await compressImage(file);
      const probe = new window.Image();
      probe.src = src;
      await new Promise(r => { probe.onload = r; probe.onerror = r; });
      const r = probe.naturalWidth / (probe.naturalHeight || 1);
      const aspect = r > 1.15 ? "wide" : r < 0.87 ? "tall" : "sq";
      setMedia(prev => [...prev, { id: nextId(), type: "photo", src, alt: autoAlt(file.name, "photo"), aspect }]);
    } catch {}
  };

  const addReel = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = ev => setMedia(prev => [...prev, { id: nextId(), type: "reel", src: ev.target.result, alt: autoAlt(file.name, "reel"), aspect: "reel" }]);
    reader.readAsDataURL(file);
  };

  const replaceMedia = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    const idx = replaceTarget.current;
    if (idx === null) return;
    const m = media[idx];
    try {
      let src, aspect = m.aspect;
      if (m.type === "photo") {
        src = await compressImage(file);
        const probe = new window.Image();
        probe.src = src;
        await new Promise(r => { probe.onload = r; probe.onerror = r; });
        const ratio = probe.naturalWidth / (probe.naturalHeight || 1);
        aspect = ratio > 1.15 ? "wide" : ratio < 0.87 ? "tall" : "sq";
      } else {
        src = await new Promise((res, rej) => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.onerror = rej; r.readAsDataURL(file); });
      }
      setMedia(prev => prev.map((item, i) => i === idx ? { ...item, src, alt: autoAlt(file.name, m.type), aspect } : item));
    } catch {}
  };

  const startReplace = (idx) => { replaceTarget.current = idx; replaceInputRef.current?.click(); };
  const remove = (i) => setMedia(prev => prev.filter((_, idx) => idx !== i));

  const save = () => {
    updateContent("media", media);
    const token = getToken();
    if (token) api.syncGallery(media, token).catch(console.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const filtered = filter === "all" ? media : media.filter(m => m.type === filter);

  return (
    <div>
      <SectionHeader title="Gallery" subtitle="Manage photos and reels shown in the gallery." />

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {["all", "photo", "reel"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.3rem 0.75rem", borderRadius: 9999, border: `1px solid ${filter === f ? A.gold : "rgba(255,255,255,0.1)"}`, background: filter === f ? "rgba(176,141,91,0.15)" : "transparent", color: filter === f ? A.gold : A.textMid, fontSize: "0.68rem", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", textTransform: "capitalize" }}>
              {f === "all" ? `All (${media.length})` : f === "photo" ? `Photos (${media.filter(m => m.type === "photo").length})` : `Reels (${media.filter(m => m.type === "reel").length})`}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button onClick={() => photoInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(176,141,91,0.12)", border: "1px solid rgba(176,141,91,0.3)", color: A.gold, padding: "0.42rem 0.85rem", borderRadius: 6, cursor: "pointer", fontSize: "0.68rem", fontFamily: "'DM Sans',sans-serif" }}><Plus size={12} /> Add Photo</button>
          <button onClick={() => reelInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(176,141,91,0.12)", border: "1px solid rgba(176,141,91,0.3)", color: A.gold, padding: "0.42rem 0.85rem", borderRadius: 6, cursor: "pointer", fontSize: "0.68rem", fontFamily: "'DM Sans',sans-serif" }}><Plus size={12} /> Add Reel</button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.65rem", marginBottom: "1.5rem" }}>
        {filtered.map((m) => {
          const i = media.indexOf(m);
          return (
            <div key={m.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: A.card, border: `1px solid ${A.border}`, display: "flex", flexDirection: "column" }}>
              {/* Thumbnail — double-click to replace */}
              <div onDoubleClick={() => startReplace(i)} style={{ position: "relative", aspectRatio: m.aspect === "wide" ? "16/9" : m.aspect === "sq" ? "1/1" : m.aspect === "reel" ? "9/16" : "3/4", cursor: "pointer", flexShrink: 0 }}>
                {m.src ? (
                  m.type === "photo" ? (
                    <img src={m.src} alt={m.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(176,141,91,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(176,141,91,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={A.gold}><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <span style={{ fontSize: "0.55rem", color: A.textLight, fontFamily: "'DM Sans',sans-serif" }}>Reel</span>
                    </div>
                  )
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image size={20} color={A.textLight} />
                  </div>
                )}

                {/* Type badge */}
                <span style={{ position: "absolute", top: 5, left: 5, background: m.type === "reel" ? "rgba(176,141,91,0.85)" : "rgba(20,17,14,0.75)", backdropFilter: "blur(4px)", color: m.type === "reel" ? "#1A1208" : A.textMid, fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", padding: "0.15rem 0.35rem", borderRadius: 3, fontWeight: 600 }}>
                  {m.type === "reel" ? "Reel" : "Photo"}
                </span>
              </div>

              {/* Action bar */}
              <div style={{ display: "flex", gap: "0.3rem", padding: "0.35rem" }}>
                <button onClick={() => startReplace(i)} style={{ flex: 1, background: "rgba(176,141,91,0.12)", border: "1px solid rgba(176,141,91,0.25)", color: A.gold, fontSize: "0.6rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "0.3rem 0.4rem", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                  <Upload size={9} /> Replace
                </button>
                <button onClick={() => remove(i)} style={{ background: "rgba(224,85,85,0.12)", border: "1px solid rgba(224,85,85,0.25)", color: A.error, fontSize: "0.6rem", fontFamily: "'DM Sans',sans-serif", padding: "0.3rem 0.45rem", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: A.textLight, fontSize: "0.75rem", fontFamily: "'DM Sans',sans-serif" }}>
            No {filter === "all" ? "media" : filter + "s"} yet. Use the buttons above to add.
          </div>
        )}
      </div>

      <SaveBar onSave={save} saved={saved} errors={{}} />

      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={addPhoto} />
      <input ref={reelInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={addReel} />
      <input ref={replaceInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={replaceMedia} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROCESS TAB
══════════════════════════════════════════════════════ */
function ProcessTab() {
  const { content, updateContent } = useContent();
  const [featuredId, setFeaturedId] = useState(extractYouTubeId(content.featuredVideoId));
  const [videos, setVideos] = useState(content.videos.map(v => ({ ...v, id: extractYouTubeId(v.id) })));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const VIDEO_CATS = ["Lightroom Edits", "Skin Tones", "Presets", "Tutorials", "Behind The Scenes"];

  const update = (i, key, val) => {
    setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v));
    setErrors(prev => { const n = { ...prev }; delete n[`${key}${i}`]; return n; });
  };

  const validate = () => {
    const errs = {};
    const fErr = validYtUrl(featuredId); if (fErr) errs.featured = fErr;
    videos.forEach((v, i) => {
      const idErr = validYtUrl(v.id); if (idErr) errs[`id${i}`] = idErr;
      if (!v.title.trim()) errs[`title${i}`] = "Required";
    });
    return errs;
  };

  const save = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    updateContent("featuredVideoId", featuredId.trim());
    updateContent("videos", videos);
    const token = getToken();
    if (token) api.syncVideos(videos, featuredId.trim(), token).catch(console.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const remove = (i) => setVideos(prev => prev.filter((_, idx) => idx !== i));
  const add = () => setVideos(prev => [...prev, { id: "", title: "", desc: "", cat: "Tutorials" }]);

  return (
    <div>
      <SectionHeader title="Process Page — YouTube Videos" subtitle="Manage the featured video and the video list. Paste any YouTube link — the video ID is extracted automatically." />

      <Card>
        <p style={{ color: A.gold, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.85rem" }}>Featured Video</p>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Field label="YouTube Link" value={featuredId ? `https://www.youtube.com/watch?v=${featuredId}` : ""} onChange={v => { setFeaturedId(extractYouTubeId(v)); setErrors(prev => ({ ...prev, featured: "" })); }} error={errors.featured} required placeholder="https://youtube.com/watch?v=…" />
          </div>
          {featuredId && (
            <a href={`https://www.youtube.com/watch?v=${featuredId}`} target="_blank" rel="noopener noreferrer" style={{ color: A.gold, display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif", marginTop: "1.5rem", textDecoration: "none" }}>
              <ExternalLink size={13} /> Preview
            </a>
          )}
        </div>
        {featuredId && (
          <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", marginTop: "0.5rem", maxWidth: 360 }}>
            <img src={`https://img.youtube.com/vi/${extractYouTubeId(featuredId)}/hqdefault.jpg`} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </Card>

      <p style={{ color: A.gold, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", marginBottom: "0.75rem" }}>Video List</p>
      {videos.map((v, i) => (
        <Card key={i} style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <p style={{ color: A.textMid, fontSize: "0.67rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Video {i + 1}</p>
            <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: A.error, display: "flex" }}><Trash2 size={13} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <div>
              <Field label="YouTube Link" value={v.id ? `https://www.youtube.com/watch?v=${v.id}` : ""} onChange={val => update(i, "id", extractYouTubeId(val))} error={errors[`id${i}`]} required placeholder="https://youtube.com/watch?v=…" />
              {v.id && (
                <div style={{ borderRadius: 6, overflow: "hidden", aspectRatio: "16/9", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                  <img src={`https://img.youtube.com/vi/${extractYouTubeId(v.id)}/mqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
            <div>
              <Field label="Title" value={v.title} onChange={val => update(i, "title", val)} error={errors[`title${i}`]} required placeholder="Cinematic Colour Grade" />
              <Field label="Description" value={v.desc} onChange={val => update(i, "desc", val)} placeholder="The tone curve workflow behind every preset" />
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: A.textMid, fontFamily: "'DM Sans',sans-serif", marginBottom: "0.35rem" }}>Category</label>
                <select value={v.cat} onChange={e => update(i, "cat", e.target.value)} style={{ width: "100%", background: A.input, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "0.65rem 0.75rem", color: A.text, fontSize: "0.82rem", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                  {VIDEO_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <button onClick={add} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(176,141,91,0.08)", border: "1px dashed rgba(176,141,91,0.35)", color: A.gold, padding: "0.6rem 1.25rem", borderRadius: 6, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'DM Sans',sans-serif", width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}>
        <Plus size={14} /> Add Video
      </button>
      <SaveBar onSave={save} saved={saved} errors={errors} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const { resetContent } = useContent();
  const [showReset, setShowReset] = useState(false);
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(SESSION_KEY));

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  const tabContent = {
    home: <HomeTab />,
    presets: <PresetsTab />,
    collections: <CollectionsTab />,
    gallery: <GalleryTab />,
    process: <ProcessTab />,
  };

  return (
    <div style={{ minHeight: "100vh", background: A.bg, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <header style={{ background: A.sidebar, borderBottom: `1px solid ${A.border}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <button onClick={() => setLocation("/")} style={{ background: "none", border: "none", cursor: "pointer", color: A.textMid, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif", transition: "color 200ms" }}
            onMouseEnter={e => e.currentTarget.style.color = A.text}
            onMouseLeave={e => e.currentTarget.style.color = A.textMid}>
            <ArrowLeft size={14} /> Back to site
          </button>
          <span style={{ width: 1, height: 20, background: A.border }} />
          <span style={{ fontFamily: "'Playfair Display',serif", color: A.text, fontSize: "1.05rem", fontStyle: "italic" }}>pictureprefecttones</span>
          <span style={{ fontSize: "0.62rem", color: A.textLight, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>Admin</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: `1px solid ${A.border}`, cursor: "pointer", color: A.textMid, display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif", borderRadius: 6, padding: "0.4rem 0.75rem", transition: "all 200ms" }}
          onMouseEnter={e => { e.currentTarget.style.color = A.error; e.currentTarget.style.borderColor = A.error; }}
          onMouseLeave={e => { e.currentTarget.style.color = A.textMid; e.currentTarget.style.borderColor = A.border; }}
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
            style={{ background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? A.gold : "transparent"}`, color: activeTab === tab.id ? A.gold : A.textMid, padding: "0.85rem 1rem", fontSize: "0.78rem", letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 200ms", fontWeight: activeTab === tab.id ? 600 : 400 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {tabContent[activeTab]}
        </div>
      </main>

      {/* ── Reset confirm modal ── */}
      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: "2rem", maxWidth: 380, width: "90%" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", color: A.text, marginBottom: "0.5rem" }}>Reset all content?</p>
            <p style={{ fontSize: "0.8rem", color: A.textMid, lineHeight: 1.6, marginBottom: "1.5rem" }}>This will restore all pages to their original default content. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { resetContent(); setShowReset(false); }} style={{ flex: 1, background: A.error, color: "white", border: "none", padding: "0.75rem", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Yes, Reset</button>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: A.text, border: `1px solid ${A.border}`, padding: "0.75rem", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
