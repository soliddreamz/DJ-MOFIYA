const CACHE_NAME = "base-app-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./content.json",
  "./manifest.json",
  "./service-worker.js",
  "./dashboard/",
  "./dashboard/index.html",
  "./dashboard/dashboard.js",
  "./dashboard/dashboard.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always try network for content.json so the live toggle updates fast
  if (url.pathname.endsWith("/content.json")) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
