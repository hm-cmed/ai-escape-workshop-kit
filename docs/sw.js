const CACHE = "ai-escape-workshop-v5";
const ASSETS = ["./", "index.html", "styles.css?v=20261111-5", "app.js?v=20261111-5", "manifest.webmanifest", "assets/sample-heatstroke-poster.webp", "assets/sample-video-workshop-intro-poster.webp", "assets/sample-video-sora-poster.webp", "assets/sample-video-klingai-poster.webp", "assets/sample-video-luma-poster.webp", "assets/sample-video-google-flow-poster.webp"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (event.request.headers.has("range") || /\.(mp4|webm|mov|m4v)$/i.test(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match("index.html"))));
});


