/**
 * Alaska Tour & Travel - Centralized Application Configuration
 * 
 * Instructions:
 * When you deploy your backend to Render (or any cloud host),
 * update `PRODUCTION_BACKEND_URL` below with your live service URL:
 * e.g., "https://alaska-tour-travel-backend.onrender.com"
 * 
 * Dynamic Runtime Override:
 * You can also change the API URL in browser console without redeploying:
 *   localStorage.setItem("alaskaApiUrl", "https://your-backend.onrender.com/api");
 */

const PRODUCTION_BACKEND_URL = "https://alaska-tour-travel-backend.onrender.com";

(function () {
  const isLocal = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:"
  );

  const localBase = window.location.protocol === "file:"
    ? "http://localhost:5000/api"
    : (window.location.port === "5000" ? "/api" : "http://localhost:5000/api");

  let resolvedApiUrl;
  const storedOverride = typeof localStorage !== "undefined" ? localStorage.getItem("alaskaApiUrl") : null;

  if (storedOverride) {
    resolvedApiUrl = storedOverride.replace(/\/+$/, "");
  } else if (window.ALASKA_API_URL) {
    resolvedApiUrl = window.ALASKA_API_URL.replace(/\/+$/, "");
  } else if (isLocal) {
    resolvedApiUrl = localBase;
  } else {
    resolvedApiUrl = `${PRODUCTION_BACKEND_URL.replace(/\/+$/, "")}/api`;
  }

  window.APP_CONFIG = {
    PRODUCTION_BACKEND_URL: PRODUCTION_BACKEND_URL,
    API_BASE_URL: resolvedApiUrl,
    isLocal: isLocal
  };
})();
