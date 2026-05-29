<script lang="ts">
	import { onMount } from 'svelte';

	let { placement } = $props();

	let banner = $state(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch(`http://127.0.0.1:5000/api/banners/public?placement=${placement}`);
			if (res.ok) {
				const banners = await res.json();
				if (banners.length > 0) {
					// In case multiple active banners have the same placement, pick a random one
					banner = banners[Math.floor(Math.random() * banners.length)];
				}
			}
		} catch (error) {
			console.error(`Error loading banner for placement ${placement}:`, error);
		} finally {
			loading = false;
		}
	});
</script>

{#if banner}
	<div class="banner-ad-container">
		<a href={banner.link_url} target="_blank" rel="noopener noreferrer" class="banner-link">
			<img src={`http://127.0.0.1:5000${banner.image_url}`} alt={banner.title} class="banner-img" loading="lazy" />
			<div class="ad-label">Advertisement</div>
		</a>
	</div>
{/if}

<style>
	.banner-ad-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 3rem 0;
		position: relative;
		z-index: 10;
	}
	.banner-link {
		display: block;
		width: 100%;
		max-width: 1200px;
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	.banner-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
	}
	.banner-img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
		max-height: 250px;
	}
	.ad-label {
		position: absolute;
		bottom: 8px;
		right: 8px;
		background: rgba(0, 0, 0, 0.6);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 1px;
		pointer-events: none;
	}
</style>
