/**
 * Vite server middleware plugin — secure server-side API proxy.
 *
 * Security model:
 *  - Customer-facing:  POST /api/save-order (payment verified with Razorpay)
 *  - Admin-only:       POST /api/admin/login → session token
 *                      GET  /api/orders      requires session token
 *                      POST /api/upload-zip  requires session token
 *                      GET  /api/preset-file/:id requires session token (returns zip URL)
 *  - Webhook:          POST /api/webhooks/razorpay (HMAC verified)
 *
 * Secrets live in process.env ONLY — never in VITE_ vars or browser bundles.
 *   WP_URL or VITE_WP_URL   — WordPress base URL
 *   PPT_API_SECRET           — shared secret for WordPress endpoints
 *   RAZORPAY_KEY_ID          — Razorpay API key
 *   RAZORPAY_KEY_SECRET      — Razorpay API secret (server-side only)
 *   RAZORPAY_WEBHOOK_SECRET  — Razorpay webhook signing secret
 *   ADMIN_EMAIL              — primary admin login email (required for admin API)
 *   ADMIN_PASSWORD           — primary admin login password (required for admin API)
 *   ADMIN_EMAIL_2            — optional second admin account email
 *   ADMIN_PASSWORD_2         — optional second admin account password
 */

import crypto from "node:crypto";

/* ── Env helpers ─────────────────────────────────────────── */

// WordPress base URL — read from server-side WP_URL first, fallback to VITE_ var
function WP_BASE() {
  return (process.env.WP_URL || process.env.VITE_WP_URL || "").replace(/\/+$/, "");
}
const PPT_SECRET = () => process.env.PPT_API_SECRET          || "";
const RZP_KEY    = () => process.env.RAZORPAY_KEY_ID         || "";
const RZP_SECRET = () => process.env.RAZORPAY_KEY_SECRET     || "";
const WH_SECRET  = () => process.env.RAZORPAY_WEBHOOK_SECRET || "";

/** Returns configured admin accounts from env. Never uses hardcoded defaults. */
function getAdminAccounts() {
  const accounts = [];
  const email1 = process.env.ADMIN_EMAIL;
  const pass1  = process.env.ADMIN_PASSWORD;
  if (email1 && pass1) accounts.push({ email: email1.toLowerCase(), password: pass1 });
  const email2 = process.env.ADMIN_EMAIL_2;
  const pass2  = process.env.ADMIN_PASSWORD_2;
  if (email2 && pass2) accounts.push({ email: email2.toLowerCase(), password: pass2 });
  return accounts;
}

/* ── In-memory stores ─────────────────────────────────────── */

/** Admin sessions: token → expiry timestamp */
const sessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/** Pending orders cache: refId → { customerData, items, total, created } */
const pendingOrders = new Map();
const PENDING_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanupExpired() {
  const now = Date.now();
  for (const [k, v] of sessions.entries())     { if (v < now) sessions.delete(k); }
  for (const [k, v] of pendingOrders.entries()) { if (now - v.created > PENDING_TTL_MS) pendingOrders.delete(k); }
}

/* ── Helpers ──────────────────────────────────────────────── */

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyAdminSession(req) {
  const token = req.headers["x-admin-token"] || "";
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry || expiry < Date.now()) { sessions.delete(token); return false; }
  return true;
}

async function wpGet(path) {
  if (!WP_BASE()) throw Object.assign(new Error("WordPress URL not configured (set WP_URL server env var)"), { status: 503 });
  const res = await fetch(`${WP_BASE()}/wp-json/ppt/v1/${path}`, {
    headers: { "X-PPT-Secret": PPT_SECRET() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw Object.assign(new Error(`WP ${res.status}: ${text}`), { status: res.status });
  }
  return res.json();
}

async function wpPost(path, bodyObj) {
  if (!WP_BASE()) throw Object.assign(new Error("WordPress URL not configured (set WP_URL server env var)"), { status: 503 });
  const res = await fetch(`${WP_BASE()}/wp-json/ppt/v1/${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "X-PPT-Secret": PPT_SECRET() },
    body:    JSON.stringify(bodyObj),
  });
  const text = await res.text().catch(() => "");
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw Object.assign(new Error(data?.message || text), { status: res.status, data });
  return data;
}

async function rzpPaymentStatus(paymentId) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: "Basic " + Buffer.from(`${RZP_KEY()}:${RZP_SECRET()}`).toString("base64") },
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data?.error?.description || "Razorpay error"), { rzp: data });
  return data;
}

/* ── Route handlers ───────────────────────────────────────── */

/** POST /api/admin/login — verify credentials against env-configured accounts, return session token */
async function handleAdminLogin(req, res) {
  let body;
  try { body = JSON.parse((await readBody(req)).toString()); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  const { email, password } = body;

  const accounts = getAdminAccounts();
  if (accounts.length === 0) {
    // Admin env vars not configured — admin API unavailable but UI still works for content editing
    return json(res, 503, { error: "Admin API not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars." });
  }

  const isValid = accounts.some(
    (a) => a.email === (email || "").toLowerCase() && a.password === password
  );

  if (!isValid) return json(res, 401, { error: "Invalid credentials" });

  cleanupExpired();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return json(res, 200, { token });
}

/** POST /api/prepare-order — store order data before payment (keyed by refId) */
async function handlePrepareOrder(req, res) {
  let body;
  try { body = JSON.parse((await readBody(req)).toString()); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  const { customer_name, customer_email, customer_phone, items, total } = body;
  if (!customer_email || !items) return json(res, 400, { error: "customer_email and items required" });

  cleanupExpired();
  const refId = crypto.randomBytes(16).toString("hex");
  pendingOrders.set(refId, { customer_name, customer_email, customer_phone, items, total, created: Date.now() });
  return json(res, 200, { ref_id: refId });
}

/** POST /api/save-order — verify payment, call WordPress, return token */
async function handleSaveOrder(req, res) {
  let body;
  try { body = JSON.parse((await readBody(req)).toString()); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  let { payment_id, customer_name, customer_email, customer_phone, items, total, ref_id } = body;

  // Merge with pending order data if ref_id provided
  if (ref_id && pendingOrders.has(ref_id)) {
    const pending = pendingOrders.get(ref_id);
    customer_name  = customer_name  || pending.customer_name;
    customer_email = customer_email || pending.customer_email;
    customer_phone = customer_phone || pending.customer_phone;
    items          = items?.length  ? items : pending.items;
    total          = total          || pending.total;
  }

  if (!payment_id || !customer_email) {
    return json(res, 400, { error: "payment_id and customer_email are required" });
  }

  // Server-side Razorpay payment verification — fail-closed: missing keys = rejected
  const rzpKey    = RZP_KEY();
  const rzpSecret = RZP_SECRET();
  if (!rzpKey || !rzpSecret) {
    console.error("[PPT] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured — rejecting order");
    return json(res, 503, { error: "Payment verification not available. Server misconfigured." });
  }

  let rzp;
  try {
    rzp = await rzpPaymentStatus(payment_id);
    console.log(`[PPT] Razorpay payment ${payment_id}: status=${rzp.status}, amount=${rzp.amount}`);
  }
  catch (err) {
    console.error("[PPT] Razorpay lookup failed:", err.message);
    return json(res, 502, { error: "Could not verify payment with Razorpay" });
  }
  if (rzp.status !== "captured" && rzp.status !== "authorized") {
    console.error(`[PPT] Payment not valid: ${payment_id} status=${rzp.status}`);
    return json(res, 402, { error: `Payment not valid (status: ${rzp.status})` });
  }

  // Amount integrity check
  const expectedTotal = total || 0;
  if (expectedTotal > 0) {
    const expectedPaise   = Math.round(Number(expectedTotal) * 100);
    const capturedPaise   = Number(rzp.amount) || 0;
    const tolerancePaise  = 1;
    if (Math.abs(capturedPaise - expectedPaise) > tolerancePaise) {
      console.error(`[PPT] Amount mismatch: captured ${capturedPaise} paise but expected ${expectedPaise} paise for ${payment_id}`);
      return json(res, 402, { error: "Payment amount does not match order total." });
    }
  }

  if (!WP_BASE()) {
    console.warn("[PPT] WP_URL not set — skipping WordPress save");
    return json(res, 200, { success: true, token: null, wp_skipped: true });
  }

  console.log(`[PPT] Calling WP save-order for ${payment_id}, email=${customer_email}`);
  try {
    const result = await wpPost("save-order", { payment_id, customer_name, customer_email, customer_phone, items, total });
    console.log(`[PPT] WP save-order success: token=${result.token}, links=${result.download_links?.length || 0}`);
    if (ref_id) pendingOrders.delete(ref_id);
    return json(res, 200, result);
  } catch (err) {
    console.error("[PPT] WP save-order error:", err.message, "| data:", JSON.stringify(err.data || {}));
    return json(res, err.status || 500, { error: err.message });
  }
}

/** GET /api/orders — admin-only, requires X-Admin-Token session */
async function handleOrders(req, res) {
  if (!verifyAdminSession(req)) return json(res, 401, { error: "Unauthorized. Please log in to the admin panel." });
  try {
    const data = await wpGet("orders");
    return json(res, 200, data);
  } catch (err) {
    return json(res, err.status || 500, { error: err.message });
  }
}

/** GET /api/preset-file/:id — admin-only; returns file metadata including download URL */
async function handlePresetFile(req, res, presetId) {
  if (!verifyAdminSession(req)) return json(res, 401, { error: "Unauthorized. Admin login required." });
  try {
    const data = await wpGet(`preset-file/${encodeURIComponent(presetId)}`);
    return json(res, 200, data);
  } catch (err) {
    return json(res, err.status || 404, { error: err.message });
  }
}

/** POST /api/upload-zip — admin-only, requires X-Admin-Token session */
async function handleUploadZip(req, res) {
  if (!verifyAdminSession(req)) return json(res, 401, { error: "Unauthorized. Please log in to the admin panel." });
  if (!WP_BASE()) return json(res, 503, { error: "WordPress not configured" });

  const raw = await readBody(req);
  const ct  = req.headers["content-type"] || "";
  const qs  = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";

  const wpRes = await fetch(`${WP_BASE()}/wp-json/ppt/v1/upload-zip${qs}`, {
    method:  "POST",
    headers: {
      ...Object.fromEntries(
        Object.entries(req.headers).filter(([k]) => k !== "host" && k !== "x-admin-token")
      ),
      "X-PPT-Secret":  PPT_SECRET(),
      "content-type":  ct,
    },
    body: raw,
  });

  const text = await wpRes.text().catch(() => "");
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return json(res, wpRes.status, data);
}

/** POST /api/webhooks/razorpay — HMAC-SHA256 verified webhook (fail-closed) */
async function handleRazorpayWebhook(req, res) {
  const whSecret = WH_SECRET();
  if (!whSecret) {
    console.error("[PPT] RAZORPAY_WEBHOOK_SECRET not configured — rejecting webhook");
    return json(res, 503, { error: "Webhook not configured" });
  }

  const raw = await readBody(req);
  const sig = req.headers["x-razorpay-signature"] || "";

  const expected = crypto.createHmac("sha256", whSecret).update(raw).digest("hex");
  const sigBuf   = Buffer.from(sig.padEnd(expected.length, "\0").slice(0, expected.length));
  const expBuf   = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(expBuf, sigBuf)) {
    console.warn("[PPT] Webhook signature mismatch");
    return json(res, 400, { error: "Invalid webhook signature" });
  }

  let event;
  try { event = JSON.parse(raw.toString()); }
  catch { return json(res, 400, { error: "Invalid JSON" }); }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity || {};
    const notes   = payment.notes || {};
    const email   = payment.email   || "";
    const contact = payment.contact || "";

    if (payment.id && email) {
      // Try to resolve structured items from pending orders (via ref_id in notes)
      const refId  = notes.ref_id || "";
      const pending = refId ? pendingOrders.get(refId) : null;

      const orderData = {
        payment_id:     payment.id,
        customer_name:  pending?.customer_name  || notes.name  || "",
        customer_email: pending?.customer_email || email,
        customer_phone: pending?.customer_phone || contact,
        items:          pending?.items          || [],
        total:          pending?.total          || (payment.amount || 0) / 100,
      };

      if (WP_BASE()) {
        try {
          await wpPost("save-order", orderData);
          console.log("[PPT] Webhook: order saved for", payment.id);
          if (refId) pendingOrders.delete(refId);
        } catch (err) {
          console.error("[PPT] Webhook: WP save-order failed:", err.message);
        }
      }
    }
  }

  return json(res, 200, { received: true });
}

/* ── Vite plugin export ───────────────────────────────────── */

function pptApiPlugin() {
  function addMiddleware(server) {
    server.middlewares.use(async (req, res, next) => {
      const url    = req.url || "";
      const method = (req.method || "GET").toUpperCase();

      if (!url.startsWith("/api/")) return next();

      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");
      if (method === "OPTIONS") { res.statusCode = 204; return res.end(); }

      try {
        if (url === "/api/admin/login"    && method === "POST") return await handleAdminLogin(req, res);
        if (url === "/api/prepare-order"  && method === "POST") return await handlePrepareOrder(req, res);
        if (url === "/api/save-order"     && method === "POST") return await handleSaveOrder(req, res);
        if (url === "/api/orders"         && method === "GET")  return await handleOrders(req, res);
        if (url.startsWith("/api/preset-file/") && method === "GET") {
          const presetId = decodeURIComponent(url.replace("/api/preset-file/", "").split("?")[0]);
          return await handlePresetFile(req, res, presetId);
        }
        if (url.startsWith("/api/upload-zip") && method === "POST") return await handleUploadZip(req, res);
        if (url === "/api/webhooks/razorpay"  && method === "POST") return await handleRazorpayWebhook(req, res);
      } catch (err) {
        console.error("[PPT] API error:", err);
        return json(res, 500, { error: err.message || "Internal server error" });
      }

      next();
    });
  }

  return {
    name:                 "ppt-api",
    configureServer:        addMiddleware,
    configurePreviewServer: addMiddleware,
  };
}

export default pptApiPlugin;
