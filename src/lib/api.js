const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function hasApi() {
  return Boolean(BASE);
}

async function request(path, opts = {}) {
  const { token, body, method = "GET" } = opts;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json.data !== undefined ? json.data : json;
}

/* ── Data mappers (DB format → frontend format) ─────────────── */

function toBaPair(r) {
  return { id: r.id, b: r.before_img, a: r.after_img, alt: r.alt_text || "" };
}

function toGalleryItem(r) {
  return { id: r.id, type: r.type, src: r.src, alt: r.alt_text || "", aspect: r.aspect };
}

function toPreset(r) {
  return {
    id: r.id, name: r.name, tagline: r.tagline || "", price: r.price,
    categories: r.categories || [], img: r.img, badge: r.badge,
    count: r.preset_count,
  };
}

function toLandingCollection(r) {
  return {
    id: r.id, num: r.num, name: r.name, mood: r.mood || [],
    tagline: r.tagline || "", description: r.description || "",
    includes: r.includes || [], price: r.price,
    images: r.images || {}, accent: r.accent, flip: !!r.flip,
  };
}

function toCollectionDetail(r) {
  return {
    name: r.name, tagline: r.tagline || "", description: r.description || "",
    price: r.price, badge: r.badge, style: r.style || "",
    count: r.preset_count,
    format: r.format || "XMP + DNG",
    compat: r.compat || "Lightroom Mobile & Desktop",
    hero: r.hero,
    pairs: (r.pairs || []).map((p) => (typeof p === "string" ? { img: p } : p)),
    gallery: r.gallery || [],
  };
}

function toVideo(r) {
  return { id: r.id, title: r.title, desc: r.description || "", cat: r.category || "Tutorials" };
}

function parsePrice(str) {
  return parseFloat(String(str || "").replace(/[₹,]/g, "")) || 0;
}

function toSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50) || `preset-${Date.now()}`;
}

/* ── Public: fetch all site content ─────────────────────────── */

export async function fetchAll() {
  const [baPairRows, landingRows, presetRows, collectionRows, galleryRows, videoRows, settings] =
    await Promise.all([
      request("/api/ba-pairs"),
      request("/api/collections/landing"),
      request("/api/presets"),
      request("/api/collections"),
      request("/api/gallery"),
      request("/api/videos"),
      request("/api/settings"),
    ]);

  const collectionData = {};
  (collectionRows || []).forEach((c) => { collectionData[c.id] = toCollectionDetail(c); });

  return {
    baPairs: (baPairRows || []).map(toBaPair),
    landingCollections: (landingRows || []).map(toLandingCollection),
    products: (presetRows || []).map(toPreset),
    collectionData,
    media: (galleryRows || []).map(toGalleryItem),
    videos: (videoRows || []).map(toVideo),
    featuredVideoId: settings?.featuredVideoId || "mZTw7twXRvk",
  };
}

/* ── Auth ────────────────────────────────────────────────────── */

export async function login(email, password) {
  return request("/api/auth/admin/login", { method: "POST", body: { email, password } });
}

/* ── Admin writes ────────────────────────────────────────────── */

export async function syncBaPairs(pairs, token) {
  for (const p of pairs) {
    const body = { before_img: p.b, after_img: p.a, alt_text: p.alt || "" };
    if (p.id) {
      await request(`/api/ba-pairs/admin/${p.id}`, { method: "PUT", token, body });
    } else {
      await request("/api/ba-pairs/admin", { method: "POST", token, body });
    }
  }
}

export async function syncLandingCollections(cols, token) {
  for (let i = 0; i < cols.length; i++) {
    const c = cols[i];
    if (!c.id) continue;
    await request(`/api/collections/admin/landing/${c.id}`, {
      method: "PUT", token,
      body: {
        name: c.name, num: c.num, tagline: c.tagline,
        description: c.description, price: c.price,
        accent: c.accent, flip: !!c.flip, sort_order: i,
        mood: c.mood || [], includes: c.includes || [],
        images: c.images || {},
      },
    });
  }
}

export async function syncPresets(products, token) {
  const presets = products.map((p, i) => ({
    id: typeof p.id === "number" ? toSlug(p.name) : String(p.id),
    name: p.name, tagline: p.tagline || "", price: p.price,
    price_num: parsePrice(p.price), img: p.img || "",
    badge: p.badge || null, count: p.count || 0, sort_order: i,
    categories: (p.categories && p.categories.length) ? p.categories : ["all"],
  }));
  return request("/api/presets/admin/sync", { method: "PUT", token, body: { presets } });
}

export async function saveCollectionDetail(id, data, token) {
  return request(`/api/collections/admin/${id}`, {
    method: "PUT", token,
    body: {
      name: data.name, tagline: data.tagline || "",
      description: data.description || "", price: data.price,
      price_num: parsePrice(data.price), badge: data.badge || null,
      style: data.style || "", count: data.count || 0,
      format: data.format || "XMP + DNG",
      compat: data.compat || "Lightroom Mobile & Desktop",
      hero: data.hero || "",
      includes: data.includes || [],
      pairs: (data.pairs || []).map((p) => ({ img: p.img || p.before || "" })),
      gallery: data.gallery || [],
    },
  });
}

export async function syncGallery(media, token) {
  const items = media.map((m, i) => ({
    type: m.type, src: m.src, alt_text: m.alt || "", aspect: m.aspect, sort_order: i,
  }));
  return request("/api/gallery/admin/sync", { method: "PUT", token, body: { items } });
}

export async function syncVideos(videos, featuredVideoId, token) {
  await Promise.all([
    request("/api/settings/admin", {
      method: "PUT", token,
      body: { key: "featuredVideoId", value: featuredVideoId },
    }),
    request("/api/videos/admin/sync", {
      method: "PUT", token,
      body: {
        videos: videos.map((v, i) => ({
          id: v.id, title: v.title,
          description: v.desc || "",
          category: v.cat || "Tutorials",
          sort_order: i,
        })),
      },
    }),
  ]);
}
