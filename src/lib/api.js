/**
 * API helpers for Picture Perfect Tones.
 *
 * Public WordPress content (presets, gallery, homepage) is fetched directly
 * from WP REST API — those are public GET endpoints requiring VITE_WP_URL.
 *
 * All secure/admin operations go through /api/* on the same origin
 * (Vite middleware plugin in server/api-middleware.js).
 * Secrets (PPT_API_SECRET, Razorpay keys) live server-side ONLY.
 */

const WP_BASE = (import.meta.env.VITE_WP_URL || "").replace(/\/+$/, "");

/** True when WordPress URL is set (needed for public content fetching). */
export function hasApi() {
  return Boolean(WP_BASE);
}

/* ── Admin session token (stored in sessionStorage) ───────── */

const ADMIN_TOKEN_KEY = "ppt_admin_token";

export function getAdminToken() {
  try { return sessionStorage.getItem(ADMIN_TOKEN_KEY) || ""; }
  catch { return ""; }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
}

/* ── Internal server-side API helpers (/api/*) ─────────────── */

async function apiGet(path, opts = {}) {
  const headers = {};
  const token = getAdminToken();
  if (token) headers["X-Admin-Token"] = token;
  Object.assign(headers, opts.headers || {});
  const res = await fetch(`/api/${path}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `API error: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, data, opts = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getAdminToken();
  if (token) headers["X-Admin-Token"] = token;
  Object.assign(headers, opts.headers || {});
  const res = await fetch(`/api/${path}`, {
    method:  "POST",
    headers,
    body:    JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `API error: ${res.status}`);
  return body;
}

/* ── WordPress public REST helpers ──────────────────────────── */

async function wpGet(endpoint) {
  const url = `${WP_BASE}/wp-json/wp/v2/${endpoint}?per_page=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WordPress API error: ${res.status} on ${endpoint}`);
  return res.json();
}

async function wpCustom(path) {
  const base = `${WP_BASE}/wp-json/ppt/v1/${path}`;
  const url = new URL(base);
  url.searchParams.set("_t", Date.now());
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status} on ppt/v1/${path}`);
  return res.json();
}

/* ── Content helpers ─────────────────────────────────────────── */

function acf(post) {
  const a = post?.acf;
  if (!a || Array.isArray(a)) return {};
  return a;
}

function imgUrl(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.url) return val.url;
  if (typeof val === "object" && val.sizes?.full) return val.sizes.full;
  return "";
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

/* ── Public content fetch ────────────────────────────────────── */

export async function fetchAll() {
  const [presetPosts, homeData, galleryPosts, baPosts, videoPosts] = await Promise.all([
    wpGet("presets").catch(() => []),
    wpCustom("homepage").catch(() => ({ baPairs: [], collections: [] })),
    wpGet("gallery").catch(() => []),
    wpGet("ba-pairs").catch(() => []),
    wpGet("videos").catch(() => []),
  ]);

  const products = (presetPosts || [])
    .filter((p) => {
      const f = acf(p);
      return f.active !== false && f.active !== 0;
    })
    .map((p) => {
      const f = acf(p);
      return {
        id:         p.slug,
        name:       stripHtml(p.title?.rendered) || "",
        tagline:    f.tagline || "",
        price:      f.price   || "",
        categories: ["all", ...(Array.isArray(f.categories) ? f.categories : [])],
        img:        imgUrl(f.img),
        badge:      f.badge || null,
        count:      Number(f.count) || 0,
      };
    });

  const landingCollections = (homeData?.collections || []).map((c) => ({
    id:          c.id,
    num:         c.number || c.num || "",
    name:        c.name        || "",
    mood:        typeof c.mood === "string"
                   ? c.mood.split(",").map((s) => s.trim()).filter(Boolean)
                   : (Array.isArray(c.mood) ? c.mood : []),
    tagline:     c.tagline     || "",
    description: c.description || "",
    includes:    Array.isArray(c.included) ? c.included : (Array.isArray(c.includes) ? c.includes : []),
    price:       c.price       || "",
    images:      {
      hero: c.images?.hero   || "",
      mid:  c.images?.middle || c.images?.mid || "",
      sm:   c.images?.small  || c.images?.sm  || "",
    },
    accent: c.accent || "rgba(176,141,91,0.10)",
    flip:   Boolean(c.flip),
  }));

  const collectionData = {};
  (presetPosts || []).forEach((p) => {
    const f = acf(p);
    if (!p.slug) return;
    const hero = imgUrl(f.col_hero);
    const mid  = imgUrl(f.col_mid);
    const sm   = imgUrl(f.col_sm);
    collectionData[p.slug] = {
      name:        stripHtml(p.title?.rendered) || "",
      tagline:     f.col_tagline     || f.tagline || "",
      description: f.col_description || "",
      price:       f.price           || "",
      badge:       f.badge           || null,
      style:       f.col_style       || "",
      count:       Number(f.count)   || 0,
      format:      f.col_format      || "XMP",
      compat:      f.col_compat      || "Lightroom Mobile & Desktop",
      hero,
      pairs: (Array.isArray(f.col_pairs) && f.col_pairs.length > 0)
        ? f.col_pairs
            .map(p => ({ before: imgUrl(p.before), after: imgUrl(p.after) }))
            .filter(p => p.before && p.after)
        : [
            hero ? { img: hero } : null,
            mid  ? { img: mid  } : null,
            sm   ? { img: sm   } : null,
          ].filter(Boolean),
      gallery: [],
    };
  });

  let baPairs = (homeData?.baPairs || [])
    .map((p) => ({ b: p.b || p.before || "", a: p.a || p.after || "", alt: p.alt || "" }))
    .filter((p) => p.b && p.a);
  if (!baPairs.length) {
    baPairs = (baPosts || []).map((b) => {
      const f = acf(b);
      return { b: imgUrl(f.before), a: imgUrl(f.after), alt: stripHtml(b.title?.rendered) || "" };
    }).filter((p) => p.b && p.a);
  }

  const media = (galleryPosts || []).map((g, i) => {
    const f = acf(g);
    return {
      id:     g.id || i,
      type:   f.type || "photo",
      src:    imgUrl(f.src),
      alt:    stripHtml(g.title?.rendered) || "",
      aspect: "sq",
    };
  });

  const videos = (videoPosts || []).map((v) => {
    const f = acf(v);
    return {
      id:    f.yt_id || "",
      title: stripHtml(v.title?.rendered) || "",
      desc:  stripHtml(v.content?.rendered) || "",
      cat:   f.cat || "Tutorials",
    };
  });

  const nameToSlug = {};
  Object.entries(collectionData).forEach(([slug, col]) => {
    if (col.name) nameToSlug[col.name.toLowerCase().trim()] = slug;
  });
  const landingCollectionsMapped = landingCollections.map((col) => ({
    ...col,
    id: nameToSlug[col.name.toLowerCase().trim()] || col.id,
  }));

  return {
    products,
    landingCollections: landingCollectionsMapped,
    collectionData,
    media,
    baPairs,
    videos,
    featuredVideoId: videos[0]?.id || "mZTw7twXRvk",
  };
}

/**
 * Fetch which preset IDs have ZIP files uploaded (public endpoint).
 * Returns a Set of preset ID strings.
 */
export async function fetchAvailablePresets() {
  if (!WP_BASE) return null;
  try {
    const res = await fetch(`${WP_BASE}/wp-json/ppt/v1/available-presets?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return new Set(Array.isArray(data?.available) ? data.available : []);
  } catch {
    return null;
  }
}

/* ── Admin auth ──────────────────────────────────────────────── */

/**
 * Log into the admin API. Returns a session token stored in sessionStorage.
 * The server verifies credentials against ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 */
export async function adminLogin(email, password) {
  const res = await fetch("/api/admin/login", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Login failed");
  setAdminToken(body.token);
  return body;
}

/** Clear the admin session token. */
export function adminLogout() {
  setAdminToken(null);
}

/* ── Digital Downloads API (all go through /api/* server proxy) ── */

/**
 * Pre-register order data on the server before opening Razorpay.
 * Returns a ref_id to pass as a Razorpay note, so the webhook can
 * reconstruct structured item data even without client callback.
 */
export async function prepareOrder(orderData) {
  try {
    const result = await apiPost("prepare-order", orderData);
    return result.ref_id || null;
  } catch {
    return null; // non-fatal — order will still work via direct save-order call
  }
}

/**
 * Save order after payment success.
 * Server verifies the Razorpay payment and calls WordPress with PPT_API_SECRET.
 * Pass ref_id from prepareOrder() for structured item data in the webhook path.
 */
export async function saveOrder(orderData) {
  return apiPost("save-order", orderData);
}

/** Get all orders (admin). Requires active admin session. */
export async function getOrders() {
  return apiGet("orders");
}

/** Get current file metadata for a preset (for admin UI). */
export async function getPresetFile(presetId) {
  try {
    return await apiGet(`preset-file/${encodeURIComponent(presetId)}`);
  } catch {
    return null;
  }
}

/**
 * Upload a zip file for a preset (admin). Requires active admin session.
 * Supports optional onProgress(pct) callback for upload progress reporting.
 */
export function uploadPresetZip(presetId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("preset_id", presetId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload-zip?preset_id=${encodeURIComponent(presetId)}`);

    const token = getAdminToken();
    if (token) xhr.setRequestHeader("X-Admin-Token", token);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body?.error || `Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.send(formData);
  });
}

/* ── Legacy WordPress content-sync stubs ─────────────────────────────────────
   These functions sync admin-edited editorial content back to WordPress.
   They are called with `if (token) api.sync*(...)` so they only run when WP
   is configured. They are non-critical — content is also persisted locally via
   ContentContext/localStorage.  Provide silent no-ops so existing callers
   don't crash if WP is unavailable.
   ────────────────────────────────────────────────────────────────────────── */

async function wpAdminPost(endpoint, data, _token) {
  if (!WP_BASE) return null;
  const adminToken = getAdminToken();
  const headers = { "Content-Type": "application/json" };
  if (adminToken) headers["X-Admin-Token"] = adminToken;
  try {
    const res = await fetch(`/api/wp-proxy/${endpoint}`, { method: "POST", headers, body: JSON.stringify(data) });
    if (!res.ok) return null;
    return res.json().catch(() => null);
  } catch {
    return null;
  }
}

/** Sync before/after image pairs to WordPress (non-critical). */
export function syncBaPairs(pairs, token) {
  return wpAdminPost("sync-ba-pairs", { pairs }, token);
}

/** Sync landing-page collections to WordPress (non-critical). */
export function syncLandingCollections(collections, token) {
  return wpAdminPost("sync-landing-collections", { collections }, token);
}

/** Sync preset product list to WordPress (non-critical). */
export function syncPresets(presets, token) {
  return wpAdminPost("sync-presets", { presets }, token);
}

/** Save a single collection's detail page content to WordPress (non-critical). */
export function saveCollectionDetail(id, data, token) {
  return wpAdminPost(`save-collection/${encodeURIComponent(id)}`, data, token);
}

/** Sync gallery items to WordPress (non-critical). */
export function syncGallery(media, token) {
  return wpAdminPost("sync-gallery", { media }, token);
}

/** Sync videos list to WordPress (non-critical). */
export function syncVideos(videos, featuredId, token) {
  return wpAdminPost("sync-videos", { videos, featuredId }, token);
}
