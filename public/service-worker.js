// Loopless Service Worker v2
// Offline caching + push notifications

const CACHE_VERSION = "v2";
const STATIC_CACHE = "loopless-static-" + CACHE_VERSION;
const DYNAMIC_CACHE = "loopless-dynamic-" + CACHE_VERSION;

// Shell pages to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon.png",
  "/icon-large",
  "/apple-icon.png",
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return Promise.allSettled(
        PRECACHE_URLS.map(function (url) {
          return cache.add(url).catch(function () {
            /* ignore single-file failures */
          });
        }),
      );
    }),
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", function (event) {
  var allowed = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return !allowed.includes(k);
            })
            .map(function (k) {
              return caches.delete(k);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  // Only handle GET requests on same origin + Google Fonts
  if (request.method !== "GET") return;
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes("fonts.googleapis.com") &&
    !url.hostname.includes("fonts.gstatic.com")
  )
    return;

  // API routes: always network (no caching - user data must be fresh)
  if (url.pathname.startsWith("/api/")) return;

  // Next.js static assets: cache-first (they have content hashes, safe forever)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Google Fonts: stale-while-revalidate
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Static assets (images, icons, manifest)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|json|webmanifest)$/)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Navigation (HTML pages): network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }

  // Everything else: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ── Cache strategies ──────────────────────────────────────────────────────────

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response.ok) {
        caches.open(cacheName).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    });
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request)
        .then(function (response) {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(function () {
          return cached;
        });
      return cached || fetchPromise;
    });
  });
}

function networkFirstNav(request) {
  return fetch(request)
    .then(function (response) {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE).then(function (cache) {
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        // Offline fallback page
        return caches.match("/offline").then(function (offline) {
          return (
            offline ||
            new Response(
              "<!DOCTYPE html><html><head><title>Offline</title></head><body style='background:#0a0a0d;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0'><div style='text-align:center'><p style='font-size:40px;margin-bottom:8px'>📵</p><h2 style='color:#3bc98e;margin:0 0 8px'>You&#39;re offline</h2><p style='color:#6b5c3e;margin:0'>Check your connection and try again.</p></div></body></html>",
              { headers: { "Content-Type": "text/html" } },
            )
          );
        });
      });
    });
}

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener("push", function (event) {
  if (!event.data) return;
  var data = event.data.json();
  var options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: "/icon.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.predictionId || "1",
      url: data.url || "/",
    },
    actions: [
      { action: "snoozed", title: "Snooze (15m)" },
      { action: "dismissed", title: "Dismiss" },
    ],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var action = event.action;
  var predictionId = event.notification.data.primaryKey;

  if (action === "snoozed" || action === "dismissed") {
    event.waitUntil(
      fetch("/api/tracking/nudge-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId: predictionId, action: action }),
      }),
    );
  } else {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
