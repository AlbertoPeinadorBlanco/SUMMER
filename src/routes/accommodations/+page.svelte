<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import BannerAd from '$lib/components/BannerAd.svelte';
	import { onMount } from 'svelte';
	import { fetchApi } from '$lib/api';

	let accommodations = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			accommodations = await fetchApi('/accommodations');
		} catch (e) {
			console.error("Failed to load accommodations:", e);
		} finally {
			loading = false;
		}
	});
</script>

<SEO 
	title={$t('accommodations.title')} 
	description={$t('accommodations.subtitle')} 
/>

<div class="page-container">
	<BannerAd placement="accommodations_top" />

	<div class="header">
		<h1>{$t('accommodations.title')}</h1>
		<p class="subtitle">{$t('accommodations.subtitle')}</p>
	</div>

	<div class="grid">
		{#each accommodations as acc}
			<div class="card">
				<div class="card-image-wrapper">
					<img src={acc.image_url} alt={acc.name} class="card-image" loading="lazy" />
					<div class="card-type-badge">
						<span class="material-icons">
							{#if acc.type === 'type_camping'}
								holiday_village
							{:else if acc.type === 'type_surfhouse'}
								house
							{:else}
								hotel
							{/if}
						</span>
						{$t(`accommodations.${acc.type}`)}
					</div>
				</div>
				<div class="card-content">
					<h2>{acc.name}</h2>
					<div class="location">
						<span class="material-icons">location_on</span>
						{acc.location}
					</div>
					<!-- Hack to get localized description without complex translation keys -->
					<p class="description">
						{#if $t('nav.home') === 'Home'}
							{acc.description_en}
						{:else}
							{acc.description_es}
						{/if}
					</p>
					
					<div class="card-actions">
						<Button variant="raised" href={acc.link} target="_blank" class="premium-button">
							<Label>{$t('accommodations.book')}</Label>
						</Button>
					</div>
				</div>
			</div>
		{/each}
	</div>
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
		box-shadow: 0 8px 30px rgba(226, 109, 63, 0.15);
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

	.card-type-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		backdrop-filter: blur(4px);
	}

	.card-type-badge .material-icons {
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

	.card-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: auto;
	}
</style>
