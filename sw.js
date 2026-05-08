const CACHE = 'jacobz-v2';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if(!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(e.request).then(function(cached){
        var networkFetch = fetch(e.request).then(function(response){
          if(response && response.status === 200 && response.type === 'basic'){
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(function(){ return cached; });
        return cached || networkFetch;
      });
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data === 'skipWaiting') self.skipWaiting();
});
