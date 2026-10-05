/* The app's offline copy: lets teams.html open with no connection.

   Network first, always: a push to main goes live at once, and a phone running
   yesterday's page against today's server is a worse bug than a slow load. So
   every page and script is fetched from the network, and the copy kept here is
   only used when the network fails or takes more than NET_WAIT_MS — then the last
   copy that loaded is served, and the network answer, if it comes, refreshes the
   copy for next time. The data itself is not here: the page keeps its last
   getMyBoot (gp-boot-cache in localStorage) and shows that, marked as offline.

   Only same-origin GETs. The API is a POST and is never touched, cached or
   answered from here; nor are Google Fonts (the page has fallbacks).

   Bump SHELL when the list changes; old caches are dropped on activate. */
var SHELL = 'gp-shell-v1';
var NET_WAIT_MS = 4000;
var PRECACHE = [
  'teams.html', 'manifest.json', 'km.js', 'taxonomy.js', 'rollup.js', 'logo.js', 'duty.js',
  'jobfocus.js', 'personality.js', 'gpstrengths.js', 'kpiguide.js', 'sr-checkin-history.js',
  'icon-180.png', 'icon-512.png', 'ywam-logo.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) {
    // one missing file must not stop the rest from being kept
    return Promise.all(PRECACHE.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('gp-shell-') === 0 && k !== SHELL; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/.netlify/') === 0) return;
  e.respondWith(networkFirst_(req, e));
});

function networkFirst_(req, e) {
  /* ignoreSearch: teams.html?reg=1 and teams.html are the same page offline */
  var cached = function () { return caches.match(req, { ignoreSearch: true }); };
  var net = fetch(req).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      var copy = res.clone();
      e.waitUntil(caches.open(SHELL).then(function (c) { return c.put(stripSearch_(req), copy); }));
    }
    return res;
  });
  return new Promise(function (resolve) {
    var done = false;
    var fallback = function () {
      if (done) return;
      cached().then(function (hit) { if (hit && !done) { done = true; resolve(hit); } });
    };
    var timer = setTimeout(fallback, NET_WAIT_MS);
    net.then(function (res) {
      clearTimeout(timer);
      if (done) return;
      if (res && res.ok) { done = true; resolve(res); return; }
      // a 404 or 500 from the network: the kept copy if there is one, else the error as it was
      cached().then(function (hit) { if (!done) { done = true; resolve(hit || res); } });
    }, function () {
      clearTimeout(timer);
      cached().then(function (hit) {
        if (done) return;
        done = true;
        resolve(hit || new Response('Offline — this page has not been opened on this phone before.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
      });
    });
  });
}

function stripSearch_(req) {
  var u = new URL(req.url); u.search = '';
  return new Request(u.toString());
}
