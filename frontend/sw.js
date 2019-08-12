const cacheName = 'static';
const assets = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/app.js",
    "./img/icons/favicon.png",
    "./css/animation.css",
    "./css/fontello-codes.css",
    "./css/fontello-embedded.css",
    "./css/fontello-ie7-codes.css",
    "./css/fontello-ie7.css",
    "./css/fontello.css",
    "./font/fontello.eot",
    "./font/fontello.svg",
    "./font/fontello.tff",
    "./font/fontello.woff",
    "./font/fontello.woff2"
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', e => {
    
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cacheResource => {
            return cacheResource || fetch(e.request);
        })
    );
})