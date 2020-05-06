const FILES_TO_CACHE = [
    "/", 
    "/index.html",
    "/index.js",
    "/db.js",
    "/styles.css",
    "/manifest.webmanifest"
  ];
  
  //set cache variable names
  const CACHE_NAME = 'static-cache-v3';
  const DATA_CACHE_NAME = 'data-cache-v3';
  
  //install
  self.addEventListener('install', function(evt) {
      evt.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
              console.log('Your files were pre-cached successfully!');
              return cache.addAll(FILES_TO_CACHE);
          })
      );
  //ensures that any new versionf of our service worker
  self.skipWaiting();
  });
  
  //activate
  self.addEventListener('install', function(evt) {
      evt.waitUntil(
          caches.keys().then(keyList => {
              return Promise.all(
                  keyList.map(key => {
                      if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                          console.log('Removing old cache data!', key);
                          return caches.delete(key);
                      }
                  })
              )
          })
      );
  //tells our new service worker to take over
  self.clients.claim();
  });
  
  //fetch
  self.addEventListener("fetch", function(evt) {
      //cache successful requests to the API
      if(evt.request.url.includes("/api")) {
          evt.respondWith(
              caches.open(DATA_CACHE_NAME).then(cache => {
                  return fetch(evt.request)
                  .then(response => {
                      if(response.status === 200) {
                          cache.put(evt.request.url, response.clone());
                      }
      
                      return response;
                  })
                  .catch(err => {
                      return cache.match(evt.request);
                  });
              }).catch(err => console.log(err))
          );
      }
      return;
  });