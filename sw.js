let cacheName = "kanssortir";
let filesToCache = ["/", "/index.html",
    "/css/myTheme.css", "/css/bootstrap.rtl.min.css", "/css/bootstrap.min.css",
    "/scripts/script.js", "/scripts/bootstrap.bundle.min.js",
    "/image/kanssortir-banner.png", "/image/kanssortir-logo-small.png", "/image/kanssortir-logo.png"];

/* Start the service worker and cache all of the app's content */
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
