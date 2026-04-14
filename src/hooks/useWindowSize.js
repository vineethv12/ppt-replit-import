import { useState, useEffect } from "react";

export function useWindowSize() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return { width };
}

export function useIsMobile() {
  const { width } = useWindowSize();
  return {
    isMobile:  width < 640,
    isTablet:  width < 1024,
    width,
  };
}
