<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import BannerAd from '$lib/components/BannerAd.svelte';
	import { onMount } from 'svelte';
	import { fetchApi } from '$lib/api';

	let allBeaches = $state<any[]>([]);
	let visibleCount = $state(6);
	let visibleBeaches = $derived(allBeaches.slice(0, visibleCount));
	let loading = $state(true);

	onMount(async () => {
		try {
			allBeaches = await fetchApi('/beaches');
		} catch (e) {
			console.error("Failed to load beaches:", e);
		} finally {
			loading = false;
		}
	});

	function getLevelKey(level: string) {
		const mapping: Record<string, string> = {
			'All Levels': 'beaches.level_all_levels',
			'Beginner': 'beaches.level_beginner',
			'Beginner / Intermediate': 'beaches.level_beginner_intermediate',
			'Intermediate': 'beaches.level_intermediate',
			'Intermediate / Advanced': 'beaches.level_intermediate_advanced',
			'Advanced': 'beaches.level_advanced'
		};
		return mapping[level] || level;
	}
	function loadMore() {
		visibleCount += 6;
	}
</script>

<SEO 
	title={$t('beaches.title')} 
	description={$t('beaches.subtitle')} 
/>

<div class="page-container">
	<BannerAd placement="beaches_top" />

	<div class="header">
		<h1>{$t('beaches.title')}</h1>
		<p class="subtitle">{$t('beaches.subtitle')}</p>
	</div>

	<div class="grid">
		{#each visibleBeaches as beach}
			<div class="card">
				<div class="card-image-wrapper">
					<iframe
						title={beach.name}
						class="card-image"
						style="border:0;"
						loading="lazy"
						allowfullscreen
						referrerpolicy="no-referrer-when-downgrade"
						src={`https://maps.google.com/maps?q=${encodeURIComponent(beach.name + ' ' + beach.location)}&t=k&output=embed`}
					></iframe>
				</div>
				<div class="card-content">
					<div class="card-level-badge">
						<span class="material-icons">waves</span>
						{$t(getLevelKey(beach.level), { default: beach.level })}
					</div>
					<h2>{beach.name}</h2>
					<div class="location">
						<span class="material-icons">place</span>
						{beach.location}
					</div>
					
					<p class="description">
						{#if $t('nav.home') === 'Home'}
							{beach.description_en}
						{:else}
							{beach.description_es}
						{/if}
					</p>
				</div>
			</div>
		{/each}
	</div>

	{#if visibleCount < allBeaches.length}
		<div class="load-more-container">
			<Button variant="raised" onclick={loadMore} class="load-more-btn">
				<Label>{$t('beaches.load_more', { default: 'Load More' })}</Label>
			</Button>
		</div>
	{/if}
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		margin-top: 1rem;
	}

	h1 {
		color: var(--terciary-color);
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-color);
		font-size: 1.1rem;
		opacity: 0.8;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
	}

	.card {
		background: var(--surface-color);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(11, 163, 169, 0.15); /* Primary color shadow */
	}

	.card-image-wrapper {
		position: relative;
		height: 220px;
		width: 100%;
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-level-badge {
		background: rgba(11, 163, 169, 0.85); /* Primary color */
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.8rem;
		width: fit-content;
	}

	.card-level-badge .material-icons {
		font-size: 1.1rem;
	}

	.card-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.card-content h2 {
		margin: 0 0 0.5rem 0;
		color: var(--secondary-color);
		font-size: 1.4rem;
	}

	.location {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	:global([data-theme="dark"]) .location {
		color: #aaa;
	}

	.location .material-icons {
		font-size: 1.1rem;
		color: var(--primary-color);
	}

	.description {
		color: var(--text-color);
		line-height: 1.6;
		font-size: 0.95rem;
		margin-bottom: 1.5rem;
		flex: 1;
	}

	.load-more-container {
		display: flex;
		justify-content: center;
		margin-top: 3rem;
		padding-bottom: 2rem;
	}

	:global(.load-more-btn) {
		background-color: var(--primary-color) !important;
		color: white !important;
		padding: 0 2rem !important;
		height: 48px !important;
		border-radius: 24px !important;
		font-weight: bold !important;
		letter-spacing: 0.5px !important;
	}
</style>
