const cacheName = 'static';
const assets = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/app.js",
    "./sw.js",
    "./manifest.json",
    "./img/icons/favicon.png",
    "./css/animation.css",
    "./css/fontello-codes.css",
    "./css/fontello-embedded.css",
    "./css/fontello-ie7-codes.css",
    "./css/fontello-ie7.css",
    "./css/fontello.css",
    "./font/fontello.eot",
    "./font/fontello.svg",
    "./font/fontello.ttf",
    "./font/fontello.woff",
    "./font/fontello.woff2",
    "./font/fontello.woff2?27813901"
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(cacheName).then(cache => {
        return cache.addAll(assets);
      })
    );
  });

  self.addEventListener('activate', e => {
    
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function(response) {
            return response;
          });
        });
      })
    );
  });