// JACOBZ Service Worker - Network First pour HTML, Cache pour assets
var CACHE='jacobz-v3';
var HTML_URL='/fiit/';
var FALLBACKS=['/fiit/','/fiit/index.html'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(FALLBACKS).catch(function(){});
    })
  );
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  var url=new URL(req.url);
  // HTML files: network first, fallback to cache
  if(req.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')){
    e.respondWith(
      fetch(req).then(function(res){
        var clone=res.clone();
        caches.open(CACHE).then(function(c){c.put(req,clone);});
        return res;
      }).catch(function(){
        return caches.match(req).then(function(r){return r||caches.match('/fiit/');});
      })
    );
    return;
  }
  // Other assets: cache first
  e.respondWith(
    caches.match(req).then(function(cached){
      var networkFetch=fetch(req).then(function(res){
        if(res&&res.status===200){
          var clone=res.clone();
          caches.open(CACHE).then(function(c){c.put(req,clone);});
        }
        return res;
      });
      return cached||networkFetch;
    })
  );
});

self.addEventListener('message',function(e){
  if(e.data==='skipWaiting')self.skipWaiting();
});
