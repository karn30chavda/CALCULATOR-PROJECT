const CACHE_NAME = "calculator-cache-v3";
const urlsToCache = [
  "/",
  "./index.html",
  "./index.css",
  "./manifest.json",
  "./images/calculator.png",
  "./script.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
];

// Install event - cache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Cache addAll error:", error);
      })
  );
});

// Fetch event - serve from cache, preload, or network
self.addEventListener("fetch", (event) => {
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.startsWith("chrome-extension:")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      // Try preload response first (fixes warning)
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const fetchRequest = event.request.clone();
        const networkResponse = await fetch(fetchRequest);

        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      } catch (error) {
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/");
        }
      }
    })()
  );
});

// Activate event - clean old caches & enable navigation preload
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      // Enable navigation preload for better performance
      await self.registration.navigationPreload.enable();
    })()
  );
});
