const cacheName = 'static';
const assets = [
    
];

self.addEventListener('install', event => {
    
});

  self.addEventListener('activate', e => {
    
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          if(event.request.url.indexOf("api.jaroslawlesniak.pl") === -1) {
            cache.put(event.request, response.clone());
          }
          return response;
        });  
      });
    })
  );
});