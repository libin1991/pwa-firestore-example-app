if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then(reg => console.log('ServiceWorker registered', reg))
		.catch(error => console.log('ServiceWorker not registered', error));
}
