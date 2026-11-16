// Les Polichinelles - service worker
// Network first (players always get the latest version when online), cache as a fallback (works offline).
const CACHE = 'polichinelles-v19';
const CORE = ['./', 'index.html', 'course.html', 'envol.html', 'tape.html', 'pyramide.html', 'jongleur.html', 'trampo.html', 'tir.html', 'loge.html', 'pass.html', 'pass.js', 'shots/course.jpg', 'shots/envol.jpg', 'shots/trampo.jpg', 'shots/tir.jpg', 'shots/tape.jpg', 'shots/pyramide.jpg', 'shots/jongleur.jpg', 'kart.html', 'three.module.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // leaderboard requests go straight to the network
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(url.pathname === '/' ? './' : req, copy)) }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./')))
  );
});
