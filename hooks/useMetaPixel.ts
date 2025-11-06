import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export const useMetaPixel = () => {
  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

    if (!pixelId) {
      console.warn("VITE_META_PIXEL_ID no está definida.");
      return;
    }

    // Si ya existe fbq (por recarga o StrictMode), solo trackeamos un PageView
    if (window.fbq && window.fbq.loaded) {
      window.fbq("track", "PageView");
      return;
    }

    // Stub mínimo de fbq para que fbevents.js lo use cuando cargue
    (function (f: any) {
      const fbq = function (...args: any[]) {
        fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.callMethod = null;

      f.fbq = fbq;
      f._fbq = fbq;
    })(window);

    // Cargar el script de Meta Pixel
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    script.onload = () => {
      try {
        window.fbq!("init", pixelId);
        window.fbq!("track", "PageView");
      } catch (e) {
        console.error("Error al inicializar Meta Pixel:", e);
      }
    };

    script.onerror = () => {
      console.warn("No se pudo cargar el script de Meta Pixel.");
    };

    document.head.appendChild(script);
  }, []);
};


