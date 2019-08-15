const staticCacheName = 'site-static-v2';
const dynamicCacheName = 'site-dynamic-v2';
const assets = [
	'/',
	'/index.html',
	'/img/dish.png',
	'/js/app.js',
	'/js/ui.js',
	'/css/styles.css',
	'/css/materialize.min.css',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
	'/pages/fallback.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
	caches.open(name).then(cache => {
		cache.keys().then(keys => {
			if (keys.length > size) {
				cache.delete(keys[0]).then(limitCacheSize(name, size));
			}
		});
	});
};

// install service worker //
self.addEventListener('install', event => {
	event.waitUntil(
		caches
			.open(staticCacheName)
			.then(cache => {
				console.log('Caching shell assets');
				cache.addAll(assets);
			})
			.catch(error => console.log('Cannot cache assets', error))
	);
});

// activate service worker
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(
				keys
					.filter(key => key !== staticCacheName && key !== dynamicCacheName)
					.map(key => {
						caches.delete(key);
						console.log(`Cache ${key} was deleted.`);
					})
			);
		})
	);
});

// fetch events
self.addEventListener('fetch', event => {
	if (event.request.url.indexOf('firestore.googleapis.com') === -1) {
		event.respondWith(
			caches
				.match(event.request)
				.then(cacheRes => {
					return (
						cacheRes ||
						fetch(event.request).then(fetchRes => {
							return caches.open(dynamicCacheName).then(cache => {
								cache.put(event.request.url, fetchRes.clone());
								limitCacheSize(dynamicCacheName, 15);
								return fetchRes;
							});
						})
					);
				})
				.catch(() => {
					if (event.request.url.indexOf('.html') > -1) {
						return caches.match('/pages/fallback.html');
					}
				})
		);
	}
});
