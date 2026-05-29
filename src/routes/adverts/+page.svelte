<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import Button, { Label } from '@smui/button';

	import { fetchApi } from '$lib/api';

	let adverts: any[] = $state([]);
	let filteredAdverts: any[] = $state([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedLocation = $state('all');
	let locations: string[] = $state([]);

	onMount(async () => {
		try {
			const data = await fetchApi('/ads');
			if (data && !data.error) {
				adverts = data;
				filteredAdverts = adverts;
				
				// Extract unique locations for the filter
				const locs = new Set(adverts.map(ad => ad.location).filter(Boolean));
				locations = Array.from(locs).sort();
			}
		} catch (error) {
			console.error('Error fetching adverts:', error);
		} finally {
			loading = false;
		}
	});

	$effect(() => {
		let result = adverts;

		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			result = result.filter((ad) => {
				const name = (ad.shop_name || '').toLowerCase();
				const loc = (ad.location || '').toLowerCase();
				return name.includes(lowerQuery) || loc.includes(lowerQuery);
			});
		}

		if (selectedLocation !== 'all') {
			result = result.filter(ad => ad.location === selectedLocation);
		}

		filteredAdverts = result;
	});
</script>

<SEO title={$t('adverts.title')} description={$t('adverts.subtitle')} />

<div class="adverts-header">
	<div class="header-content">
		<h1>{$t('adverts.title')}</h1>
		<p class="subtitle">{$t('adverts.subtitle')}</p>
	</div>

	<div class="search-bar" role="search">
		<Textfield
			variant="outlined"
			bind:value={searchQuery}
			label={$t('adverts.search_placeholder')}
			style="width: 100%; max-width: 500px; background: white;"
		>
			{#snippet leadingIcon()}
				<Icon class="material-icons" aria-hidden="true">search</Icon>
			{/snippet}
		</Textfield>
		
		{#if locations.length > 0}
			<select bind:value={selectedLocation} class="filter-select" aria-label={$t('adverts.filter_location')}>
				<option value="all">{$t('adverts.all_locations')}</option>
				{#each locations as loc}
					<option value={loc}>{loc}</option>
				{/each}
			</select>
		{/if}
	</div>
</div>

<div class="adverts-container">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
		</div>
	{:else if filteredAdverts.length === 0}
		<div class="empty-state">
			<span class="material-icons empty-icon" aria-hidden="true">store_off</span>
			<p>{$t('adverts.no_results')}</p>
		</div>
	{:else}
		<div class="advert-grid">
			{#each filteredAdverts as ad}
				<div class="advert-card premium-card">
					<div class="card-image" style="background-image: url({ad.image_url});" role="img" aria-label={ad.shop_name}></div>
					
					<div class="card-content">
						<h2 class="shop-name">{ad.shop_name}</h2>
						
						{#if ad.location}
							<div class="location-badge">
								<span class="material-icons">place</span>
								{ad.location}
							</div>
						{/if}
					</div>
					
					<div class="card-footer">
						<Button href={ad.link_url} target="_blank" rel="noopener noreferrer" variant="raised" class="premium-button" style="width: 100%;">
							<Label>{$t('adverts.visit_website')}</Label>
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.adverts-header {
		background-color: white;
		padding: 3rem 1rem 2rem;
		border-bottom: 1px solid #eaeaea;
		text-align: center;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto 2rem;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.search-bar {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding: 0 1rem;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		background: white;
		height: 56px;
		min-width: 200px;
		outline: none;
	}

	.adverts-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1rem;
	}

	.advert-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.advert-card {
		background: white;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid #eee;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.advert-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(226, 109, 63, 0.15);
	}

	.card-image {
		width: 100%;
		height: 200px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		border-bottom: 1px solid #eee;
	}

	.card-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		flex: 1;
	}

	.shop-name {
		font-size: 1.5rem;
		color: var(--terciary-color);
		margin: 0 0 1rem 0;
	}

	.location-badge {
		background-color: #f0f4f8;
		color: var(--secondary-color);
		padding: 0.4rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.location-badge .material-icons {
		font-size: 16px;
	}

	.card-footer {
		padding: 1.5rem;
		border-top: 1px solid #f0f0f0;
		background: #fafafa;
	}

	.loading-state, .empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: #888;
	}

	.empty-icon {
		font-size: 4rem;
		opacity: 0.5;
		margin-bottom: 1rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid var(--primary-color-soft);
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
