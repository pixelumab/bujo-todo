<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let { children } = $props();
	let updateAvailable = $state(false);
	let registration = $state<ServiceWorkerRegistration | null>(null);

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register(`${base}/sw.js`)
				.then((reg) => {
					console.log('Service Worker registered:', reg);
					registration = reg;

					// Check for updates on page load
					reg.update();

					// Check for updates periodically (every 60 seconds)
					setInterval(() => {
						reg.update();
					}, 60000);

					// Listen for waiting service worker
					reg.addEventListener('updatefound', () => {
						const newWorker = reg.installing;
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									// New service worker is installed but waiting
									updateAvailable = true;
								}
							});
						}
					});
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error);
				});

			// Listen for controlling service worker change
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload();
			});
		}
	});

	function updateApp() {
		if (registration?.waiting) {
			registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
	}
</script>

<svelte:head>
	<title>Pixelum Bujo - Simple Bullet Journal</title>
	<meta name="description" content="Simple offline-first bullet journal application" />
	<link rel="icon" href="{base}/icon.svg" />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
	/>
	<meta name="theme-color" content="#ffffff" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Pixelum Bujo" />
	<link rel="apple-touch-icon" href="{base}/icon-192.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if updateAvailable}
	<div
		class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border-2 border-primary bg-background px-4 py-3 shadow-lg sm:px-6 sm:py-4"
		role="alert"
		aria-live="polite"
	>
		<span class="text-sm font-medium sm:text-base">New version available!</span>
		<button
			onclick={updateApp}
			class="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 sm:px-5 sm:py-2"
		>
			Update
		</button>
	</div>
{/if}

{@render children()}
