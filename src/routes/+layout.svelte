<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register(`${base}/sw.js`)
				.then((registration) => {
					console.log('Service Worker registered:', registration);
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error);
				});
		}
	});
</script>

<svelte:head>
	<title>Pixelum ToDo - Simple Bullet Journal</title>
	<meta name="description" content="Simple offline-first bullet journal application" />
	<link rel="icon" href={favicon} />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
	/>
	<meta name="theme-color" content="#ffffff" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Pixelum ToDo" />
	<link rel="apple-touch-icon" href="{base}/icon-192.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
