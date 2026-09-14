/// Riftbound France — Service Worker
/// Cache-first for static assets, network-first for pages/API

const CACHE_NAME = "riftbound-fr-v4";
const OFFLINE_URL = "/offline";

// Static assets to pre-cache on install
const PRECACHE_URLS = [OFFLINE_URL, "/icon.png", "/logorbfr.png"];

// Install: pre-cache essential assets + offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Next.js HMR / dev requests
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Static assets: cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Les pages et réponses React peuvent porter une session ou une clé compagnon.
  // Aucun cache persistant : hors ligne, seule la page générique est disponible.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match(OFFLINE_URL)) || new Response("Hors ligne", { status: 503 })
    ));
  }

});

// --- Strategies ---

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408, statusText: "Offline" });
  }
}

// Les ressources publiques connues seulement : une URL d'API peut aussi finir en .png.
function isStaticAsset(pathname) {
  return ["/icons/", "/bannieres/", "/img/", "/fonts/"].some((prefixe) => pathname.startsWith(prefixe))
    || ["/icon.png", "/logorbfr.png"].includes(pathname);
}
