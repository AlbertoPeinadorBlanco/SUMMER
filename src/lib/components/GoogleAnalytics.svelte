<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	// We use the Vite environment variable for the Measurement ID.
	// If it's not set, we don't render the analytics tags.
	const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

	onMount(() => {
		if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
			const win = window as any;
			win.dataLayer = win.dataLayer || [];
			win.gtag = function gtag() {
				win.dataLayer.push(arguments);
			};
			win.gtag('js', new Date());
			win.gtag('config', GA_MEASUREMENT_ID, {
				page_path: $page.url.pathname,
			});
		}
	});

	afterNavigate(({ to }) => {
		const win = window as any;
		if (typeof window !== 'undefined' && typeof win.gtag === 'function' && GA_MEASUREMENT_ID && to) {
			win.gtag('config', GA_MEASUREMENT_ID, {
				page_path: to.url.pathname,
			});
		}
	});
</script>

<svelte:head>
	{#if GA_MEASUREMENT_ID}
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}></script>
	{/if}
</svelte:head>
