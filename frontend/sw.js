const cacheName = 'static';
const assets = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/app.js",
    "./img/icons/favicon.png"
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