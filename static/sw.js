const CACHE_NAME = 'pixelum-bujo-v0.1.2';
const RUNTIME_CACHE = 'pixelum-bujo-runtime-v0.1.2';

// Assets to cache on install
const PRECACHE_URLS = [
	'/',
	'/manifest.json'
];

// Listen for skip waiting message
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

// Install event - cache essential assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_URLS);
		})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((cacheName) => {
						return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
					})
					.map((cacheName) => {
						return caches.delete(cacheName);
					})
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	// Skip cross-origin requests
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	// Skip non-GET requests
	if (event.request.method !== 'GET') {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return caches.open(RUNTIME_CACHE).then((cache) => {
				return fetch(event.request)
					.then((response) => {
						// Don't cache non-successful responses
						if (!response || response.status !== 200 || response.type === 'error') {
							return response;
						}

						// Clone the response before caching
						cache.put(event.request, response.clone());
						return response;
					})
					.catch(() => {
						// Return a basic offline page if available
						return caches.match('/');
					});
			});
		})
	);
});
