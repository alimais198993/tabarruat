// Network-first: always fetch the latest version when online, fall back to the saved copy when offline.
const C = "fund-v4";
const F = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./bg.jpg"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(F)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
