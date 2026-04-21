import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { hasApi, fetchAll, fetchAvailablePresets } from "../lib/api";

const LS_KEY = "pp_content_v3";

export const DEFAULT_CONTENT = {
  baPairs: [
    { b: "/images/ba/mirror-before.jpg", a: "/images/ba/mirror-after.jpg",  alt: "Bride in mirror portrait" },
    { b: "/images/ba/kiss-before.jpg",   a: "/images/ba/kiss-after.jpg",    alt: "Wedding ceremony first kiss" },
    { b: "/images/ba/garden-before.jpg", a: "/images/ba/garden-after.jpg",  alt: "Couple garden portrait" },
    { b: "/images/ba/saree-before.jpg",  a: "/images/ba/saree-after.jpg",   alt: "Bride in silver saree" },
    { b: "/images/ba/white-before.jpg",  a: "/images/ba/white-after.jpg",   alt: "Bride in white bridal attire" },
    { b: "/images/ba/couple-before.jpg", a: "/images/ba/couple-after.jpg",  alt: "Couple at golden hour" },
  ],
  landingCollections: [
    {
      id: "ivory", num: "01", name: "The Ivory Edit",
      mood: ["Soft", "Ethereal", "Luminous"],
      tagline: "For stories told in whispers and light.",
      description: "Film-like luminosity for photographers who live for soft candlelight and intimate moments. Skin tones glow, whites stay clean, and every frame feels like it was shot on medium format.",
      includes: ["12 Lightroom Presets", "Lightroom Mobile Compatible", "One-Click Apply", "Free Lifetime Updates"],
      price: "₹3,999",
      images: { hero: "/images/c-ivory-bride.jpg", mid: "/images/c-ivory-stairs.jpg", sm: "/images/c-ivory-couple.jpg", alt: "/images/c-ivory-walk.jpg" },
      accent: "rgba(230,210,180,0.12)", flip: false,
    },
    {
      id: "crimson", num: "02", name: "The Crimson Edit",
      mood: ["Dramatic", "Regal", "Bold"],
      tagline: "Where every frame commands the room.",
      description: "Built for the richness of traditional Indian ceremonies. Deep reds stay true, gold embroidery gleams, and the grandeur of a lehenga fills every corner of the frame.",
      includes: ["14 Lightroom Presets", "Camera Raw Profiles", "Lightroom Mobile Compatible", "Wedding Day Workflow Guide"],
      price: "₹4,499",
      images: { hero: "/images/c-red-twirl.jpg", mid: "/images/c-red-seated.webp", sm: "/images/c-red-bride.webp", alt: "/images/c-jewelry.jpg" },
      accent: "rgba(160,40,40,0.1)", flip: true,
    },
    {
      id: "heritage", num: "03", name: "The Heritage Edit",
      mood: ["Cinematic", "Warm", "Timeless"],
      tagline: "Palaces, mandaps, and golden light.",
      description: "Inspired by heritage venues and the warmth of candlelit mandaps. A cinematic grade that brings depth and richness to any setting — from rooftop ceremonies to forest retreats.",
      includes: ["16 Lightroom Presets", "Video LUTs Included", "Mobile + Desktop Profiles", "Private Editing Masterclass"],
      price: "₹5,499",
      images: { hero: "/images/c-sofa-bride.jpg", mid: "/images/c-window.jpg", sm: "/images/c-garden-couple.jpg", alt: "/images/c-mandap.jpg" },
      accent: "rgba(140,95,40,0.10)", flip: false,
    },
  ],
  products: [
    { id: "ivory",       name: "The Ivory Edit",       tagline: "Soft, ethereal luminosity",       price: "₹3,999", categories: ["all","wedding","portrait","warm"], img: "/images/c-ivory-bride.jpg",   badge: null,         count: 12 },
    { id: "crimson",     name: "The Crimson Edit",     tagline: "Dramatic, regal richness",         price: "₹4,499", categories: ["all","wedding","moody"],           img: "/images/c-red-twirl.jpg",     badge: "Bestseller", count: 14 },
    { id: "heritage",    name: "The Heritage Edit",    tagline: "Cinematic warmth & depth",         price: "₹5,499", categories: ["all","cinematic","warm"],           img: "/images/c-sofa-bride.jpg",    badge: "New",        count: 16 },
    { id: "celebration", name: "The Celebration Edit", tagline: "Vivid, joyful, true-to-life",      price: "₹3,499", categories: ["all","wedding","cinematic"],        img: "/images/c-celebration.jpg",   badge: null,         count: 10 },
    { id: "golden",      name: "The Golden Hour Edit", tagline: "Honeyed light, sunlit glow",       price: "₹3,999", categories: ["all","cinematic","warm","portrait"], img: "/images/c-garden-couple.jpg", badge: null,         count: 12 },
    { id: "portrait",    name: "The Portrait Edit",    tagline: "Clean skin, natural detail",       price: "₹2,999", categories: ["all","portrait","warm"],            img: "/images/c-ivory-couple.jpg",  badge: null,         count: 8  },
  ],
  collectionData: {
    ivory: {
      name: "The Ivory Edit", tagline: "Soft, ethereal luminosity for intimate moments",
      description: "Film-like luminosity that keeps whites luminous, skin tones warm, and shadows open. Built for candlelit halls, morning ghee rituals, and the quiet moments between the ceremony.",
      price: "₹3,999", badge: null, style: "Soft · Warm · Luminous", count: 12, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-ivory-bride.jpg",
      pairs: [{ img: "/images/c-ivory-bride.jpg" }, { img: "/images/c-ivory-stairs.jpg" }, { img: "/images/c-ivory-walk.jpg" }],
      gallery: ["/images/c-ivory-couple.jpg", "/images/photo-2.jpg", "/images/photo-3.jpg", "/images/photo-4.jpg", "/images/photo-5.jpg", "/images/photo-6.jpg"],
    },
    crimson: {
      name: "The Crimson Edit", tagline: "Dramatic, regal richness for traditional ceremonies",
      description: "Deep reds stay commanding, not muddy. Gold embroidery gleams. Skin tones stay accurate across every complexion. Built for the visual abundance of Indian bridal fashion.",
      price: "₹4,499", badge: "Bestseller", style: "Dramatic · Regal · Moody", count: 14, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-red-twirl.jpg",
      pairs: [{ img: "/images/c-red-twirl.jpg" }, { img: "/images/c-red-seated.webp" }, { img: "/images/c-red-bride.webp" }],
      gallery: ["/images/c-sikhwedding.webp", "/images/c-mandap.jpg", "/images/photo-7.jpg", "/images/photo-8.jpg", "/images/photo-1.webp", "/images/c-jewelry.jpg"],
    },
    heritage: {
      name: "The Heritage Edit", tagline: "Cinematic warmth for palaces and heritage venues",
      description: "Inspired by Rajputana forts and candlelit mandaps. Rich shadows, honeyed highlights, and a cinematic depth that makes every frame feel like a film still.",
      price: "₹5,499", badge: "New", style: "Cinematic · Warm · Timeless", count: 16, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-sofa-bride.jpg",
      pairs: [{ img: "/images/c-sofa-bride.jpg" }, { img: "/images/c-window.jpg" }, { img: "/images/c-mandap.jpg" }],
      gallery: ["/images/c-jewelry.jpg", "/images/photo-6.jpg", "/images/photo-7.jpg", "/images/photo-8.jpg", "/images/photo-2.jpg", "/images/c-ivory-stairs.jpg"],
    },
    celebration: {
      name: "The Celebration Edit", tagline: "Vivid, joyful, true-to-life colour",
      description: "Vibrant tones without blowing out skies or pushing colours into neon. Perfect for open-air ceremonies, mehndi afternoons, and the colour-drenched energy of sangeet nights.",
      price: "₹3,499", badge: null, style: "Vivid · Joyful · Radiant", count: 10, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-celebration.jpg",
      pairs: [{ img: "/images/c-celebration.jpg" }, { img: "/images/c-garden-couple.jpg" }, { img: "/images/c-sikhwedding.webp" }],
      gallery: ["/images/photo-1.webp", "/images/photo-2.jpg", "/images/photo-3.jpg", "/images/photo-4.jpg", "/images/photo-5.jpg", "/images/c-ivory-walk.jpg"],
    },
    golden: {
      name: "The Golden Hour Edit", tagline: "Honeyed light and sunlit warmth",
      description: "Captures the magic of couples shooting at dusk — the long shadows, warm skies, and a glow that makes every frame feel like a memory you never want to let go.",
      price: "₹3,999", badge: null, style: "Warm · Glowing · Sunlit", count: 12, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-garden-couple.jpg",
      pairs: [{ img: "/images/c-garden-couple.jpg" }, { img: "/images/c-ivory-walk.jpg" }, { img: "/images/c-ivory-stairs.jpg" }],
      gallery: ["/images/photo-4.jpg", "/images/photo-5.jpg", "/images/photo-6.jpg", "/images/photo-7.jpg", "/images/photo-8.jpg", "/images/c-celebration.jpg"],
    },
    portrait: {
      name: "The Portrait Edit", tagline: "Clean skin tones, natural detail",
      description: "Every skin tone, rendered faithfully. Every jewellery detail, sharp and true. A versatile preset that elevates without overwhelming — the one you'll reach for every single session.",
      price: "₹2,999", badge: null, style: "Clean · Natural · Faithful", count: 8, format: "XMP", compat: "Lightroom Mobile & Desktop",
      hero: "/images/c-ivory-couple.jpg",
      pairs: [{ img: "/images/c-ivory-couple.jpg" }, { img: "/images/c-ivory-bride.jpg" }, { img: "/images/c-jewelry.jpg" }],
      gallery: ["/images/photo-7.jpg", "/images/photo-8.jpg", "/images/photo-1.webp", "/images/photo-2.jpg", "/images/c-window.jpg", "/images/c-red-bride.webp"],
    },
  },
  media: [
    { id: 1,  type: "photo", src: "/images/gallery/bride-portrait.jpg",  alt: "Bridal portrait",             aspect: "tall" },
    { id: 2,  type: "photo", src: "/images/gallery/sikh-couple.webp",    alt: "Sikh wedding couple",         aspect: "wide" },
    { id: 3,  type: "reel",  src: "/videos/reel-2.mp4",                  alt: "Where passion meets pixels",  aspect: "reel" },
    { id: 4,  type: "photo", src: "/images/gallery/bride-garden.webp",   alt: "Bride in garden",             aspect: "tall" },
    { id: 5,  type: "photo", src: "/images/gallery/couple-hall.webp",    alt: "Couple at reception",         aspect: "tall" },
    { id: 6,  type: "photo", src: "/images/gallery/dress-20.webp",       alt: "Bridal party at palace",      aspect: "wide" },
    { id: 7,  type: "reel",  src: "/videos/reel-1.mp4",                  alt: "Each photo is a blank canvas",aspect: "reel" },
    { id: 8,  type: "photo", src: "/images/gallery/editorial-2.jpg",     alt: "Editorial wedding",           aspect: "wide" },
    { id: 9,  type: "photo", src: "/images/c-red-bride.webp",            alt: "Red bridal lehenga",          aspect: "tall" },
    { id: 10, type: "photo", src: "/images/gallery/dress-16.webp",       alt: "Designer dress detail",       aspect: "tall" },
    { id: 11, type: "photo", src: "/images/gallery/sikh-couple-2.webp",  alt: "Sikh wedding ceremony",       aspect: "wide" },
    { id: 12, type: "reel",  src: "/videos/reel-3.mp4",                  alt: "Indian wedding presets",      aspect: "reel" },
    { id: 13, type: "photo", src: "/images/gallery/editorial-3.jpg",     alt: "Candid wedding moment",       aspect: "tall" },
    { id: 14, type: "photo", src: "/images/c-garden-couple.jpg",         alt: "Garden couple portrait",      aspect: "wide" },
    { id: 15, type: "photo", src: "/images/c-sikhwedding.webp",          alt: "Sikh wedding ritual",         aspect: "wide" },
    { id: 16, type: "photo", src: "/images/gallery/dress-14.webp",       alt: "Bridal lehenga detail",       aspect: "tall" },
    { id: 17, type: "reel",  src: "/videos/reel-2.mp4",                  alt: "Where passion meets pixels",  aspect: "reel" },
    { id: 18, type: "photo", src: "/images/gallery/editorial-1.webp",    alt: "Bridal editorial",            aspect: "tall" },
    { id: 19, type: "photo", src: "/images/c-celebration.jpg",           alt: "Celebration moment",          aspect: "wide" },
    { id: 20, type: "photo", src: "/images/gallery/editorial-4.jpg",     alt: "Artistic wedding shot",       aspect: "wide" },
    { id: 21, type: "photo", src: "/images/c-ivory-bride.jpg",           alt: "Ivory bridal look",           aspect: "tall" },
    { id: 22, type: "photo", src: "/images/c-sofa-bride.jpg",            alt: "Bridal detail shot",          aspect: "wide" },
    { id: 23, type: "reel",  src: "/videos/reel-1.mp4",                  alt: "Each photo is a blank canvas",aspect: "reel" },
    { id: 24, type: "photo", src: "/images/photo-1.webp",                alt: "Wedding portrait",            aspect: "tall" },
  ],
  filterLabels: {
    wedding: "Wedding",
    cinematic: "Cinematic",
    warm: "Warm",
    moody: "Moody",
    portrait: "Portrait",
  },
  featuredVideoId: "mZTw7twXRvk",
  videos: [
    { id: "hrhUr8-jZcw", title: "Cinematic Colour Grade",   desc: "The tone curve workflow behind every preset",      cat: "Lightroom Edits" },
    { id: "6DKUabsAL_E", title: "Indian Wedding Edit",      desc: "Full edit walkthrough for a real wedding shoot",   cat: "Tutorials"      },
    { id: "RuXkORH5vjM", title: "Preset Breakdown",         desc: "How we craft each preset from scratch",            cat: "Presets"        },
    { id: "RFGrbB-NEno", title: "Skin Tone Mastery",        desc: "Perfect Indian skin tones in any lighting",        cat: "Skin Tones"     },
    { id: "G83RBXmOeZw", title: "Full Lightroom Workflow",  desc: "Import to export — complete wedding edit",         cat: "Tutorials"      },
  ],
};

function loadContent() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_CONTENT;
    return { ...DEFAULT_CONTENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTENT;
  }
}

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(loadContent);
  const [availablePresets, setAvailablePresets] = useState(null);

  useEffect(() => {
    if (!hasApi()) return;
    fetchAll()
      .then((data) => {
        setContent((prev) => {
          const next = { ...prev };
          Object.entries(data).forEach(([key, val]) => {
            if (Array.isArray(val) && val.length === 0) return;
            if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return;
            next[key] = val;
          });
          try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      })
      .catch(() => {});

    fetchAvailablePresets()
      .then((ids) => setAvailablePresets(ids))
      .catch(() => {});
  }, []);

  const updateContent = useCallback((key, value) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetContent = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setContent(DEFAULT_CONTENT);
  }, []);

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent, availablePresets }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be inside ContentProvider");
  return ctx;
}
