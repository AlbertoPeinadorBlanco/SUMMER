<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { onMount } from 'svelte';
	import { fetchApi } from '$lib/api';
	import BannerAd from '$lib/components/BannerAd.svelte';
	import Button, { Label } from '@smui/button';
	import { t } from 'svelte-i18n';

	let activeAds: any[] = $state([]);

	onMount(async () => {
		try {
			const res = await fetchApi('/ads');
			if (Array.isArray(res)) {
				activeAds = res;
			}
		} catch (e) {
			console.error("Failed to load ads", e);
		}
	});
</script>

<SEO title={$t('gear_guide.title')} description={$t('gear_guide.subtitle')} />

<div class="guide-container">
	<header class="guide-header">
		<h1>{$t('gear_guide.title')}</h1>
		<p class="subtitle">{$t('gear_guide.subtitle')}</p>
	</header>

	<div class="content-wrapper">
		<main class="guide-main">
			<section>
				<h2>{$t('gear_guide.wetsuit_title')}</h2>
				<p>{$t('gear_guide.wetsuit_desc')}</p>
				<ul>
					<li>{$t('gear_guide.wetsuit_summer')}</li>
					<li>{$t('gear_guide.wetsuit_spring')}</li>
					<li>{$t('gear_guide.wetsuit_winter')}</li>
				</ul>
				<p>{$t('gear_guide.wetsuit_footer')}</p>
			</section>

			<section>
				<h2>{$t('gear_guide.boards_title')}</h2>
				<p>{$t('gear_guide.boards_desc')}</p>
				<ul>
					<li>{$t('gear_guide.boards_foam')}</li>
					<li>{$t('gear_guide.boards_hard')}</li>
				</ul>
			</section>

			<section>
				<h2>{$t('gear_guide.essentials_title')}</h2>
				<p>{$t('gear_guide.essentials_desc')}</p>
			</section>

			<section>
				<h2>{$t('gear_guide.accessories_title')}</h2>
				<p>{$t('gear_guide.accessories_desc')}</p>
				<ul>
					<li>{$t('gear_guide.accessories_leash')}</li>
					<li>{$t('gear_guide.accessories_wax')}</li>
				</ul>
			</section>

			<section>
				<h2>{$t('gear_guide.sun_protection_title')}</h2>
				<p>{$t('gear_guide.sun_protection_desc')}</p>
				<ul>
					<li>{$t('gear_guide.sun_protection_zinc')}</li>
					<li>{$t('gear_guide.sun_protection_rashguard')}</li>
				</ul>
			</section>
		</main>

		<aside class="guide-sidebar">
			{#if activeAds.length > 0}
				<div class="sponsors-box">
					<h3>{$t('gear_guide.recommended_rentals')}</h3>
					<p class="sponsor-desc">{$t('gear_guide.rentals_desc')}</p>
					
					<div class="sponsor-list">
						{#each activeAds as ad}
							<div class="sponsor-card">
								<img src={ad.image_url} alt={ad.shop_name} class="sponsor-img" />
								<h4>{ad.shop_name}</h4>
								<p class="location"><span class="material-icons">place</span> {ad.location}</p>
								<Button href={ad.link_url} target="_blank" rel="noopener noreferrer" variant="raised" class="premium-button" style="width: 100%;">
									<Label>{$t('gear_guide.view_rentals')}</Label>
								</Button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</aside>
	</div>
</div>

<BannerAd placement="gear_guide_bottom" />

<style>
	.guide-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1rem;
	}
	.guide-header {
		text-align: center;
		margin-bottom: 3rem;
	}
	.guide-header h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin-bottom: 0.5rem;
	}
	.guide-header .subtitle {
		font-size: 1.2rem;
		color: #666;
	}
	.content-wrapper {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
	}
	.guide-main section {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
		margin-bottom: 2rem;
	}
	.guide-main h2 {
		color: var(--primary-color);
		margin-top: 0;
		border-bottom: 2px solid var(--background-color);
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.guide-main p, .guide-main li {
		color: #444;
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.guide-main ul {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}
	.sponsors-box {
		background: var(--surface-color);
		border: 2px solid #FFD700;
		padding: 2rem;
		border-radius: 12px;
		position: sticky;
		top: 80px;
	}
	.sponsors-box h3 {
		margin-top: 0;
		color: var(--terciary-color);
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.sponsor-desc {
		color: #555;
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}
	.sponsor-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.sponsor-card {
		background: var(--surface-color);
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
		text-align: center;
	}
	.sponsor-img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
	.sponsor-card h4 {
		margin: 0 0 0.5rem 0;
		color: var(--text-color);
		font-size: 1.1rem;
	}
	.sponsor-card .location {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
	.sponsor-card .material-icons {
		font-size: 1rem;
	}
	@media (max-width: 900px) {
		.content-wrapper {
			grid-template-columns: 1fr;
		}
	}
</style>
