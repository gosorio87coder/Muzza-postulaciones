import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const useMetaPixel = () => {
  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

    if (!pixelId) {
      console.warn("VITE_META_PIXEL_ID no está definida.");
      return;
    }

    // Si ya cargamos el script antes, solo hacemos un PageView adicional y salimos
    const existingScript = document.getElementById("meta-pixel-script");
    if (existingScript) {
      if (window.fbq) {
        window.fbq("track", "PageView");
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "meta-pixel-script";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    script.onload = () => {
      if (window.fbq) {
        window.fbq("init", pixelId);
        window.fbq("track", "PageView");
      } else {
        console.warn("Meta Pixel script cargado pero window.fbq no está disponible.");
      }
    };

    script.onerror = () => {
      console.warn("No se pudo cargar el script de Meta Pixel.");
    };

    document.head.appendChild(script);
  }, []);
};

