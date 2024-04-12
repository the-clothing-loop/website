// Remove the old service workers for this website
self.addEventListener("install", function (_) {
  self.skipWaiting();
});

self.addEventListener("activate", function (_) {
  self.registration
    .unregister()
    .then(function () {
      return self.clients.matchAll();
    })
    .then(function (clients) {
      clients.forEach((client) => client.navigate(client.url));
    });
});
