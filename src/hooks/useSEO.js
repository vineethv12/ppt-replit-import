import { useEffect } from "react";

const SITE_NAME = "pictureprefecttones";
const DEFAULT_IMAGE = "/opengraph.jpg";

function setMeta(name, content, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function useSEO({ title, description, image, path = "/" }) {
  useEffect(() => {
    const origin = window.location.origin;
    const canonical = `${origin}${path}`;
    const img = image ? `${origin}${image}` : `${origin}${DEFAULT_IMAGE}`;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

    document.title = fullTitle;

    setMeta("description", description);
    setMeta("keywords", "Indian wedding presets, Lightroom presets, wedding photography, photo editing, color grading, preset pack, Indian photographer presets, pictureprefecttones");

    setMeta("og:type", "website", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:image", img, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@pictureprefecttones");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", img);

    setCanonical(canonical);
  }, [title, description, image, path]);
}
