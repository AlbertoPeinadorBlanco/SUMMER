<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import LiveConditionsWidget from '$lib/components/LiveConditionsWidget.svelte';
	import BannerAd from '$lib/components/BannerAd.svelte';

	let { data } = $props();
	let featured_instructors = $derived(data?.featured_instructors || []);
	let defaultBio = $derived($t('home.default_bio'));

	function truncateWords(text: string, limit: number = 50) {
		if (!text) return '';
		const words = text.split(/\s+/);
		if (words.length > limit) {
			return words.slice(0, limit).join(' ') + '...';
		}
		return text;
	}
</script>

<SEO title={$t('nav.home')} description={$t('home.hero_desc')} />

<section class="hero-section" aria-labelledby="hero-title">
	<div class="hero-content">
		<h1 id="hero-title">{$t('home.hero_title')}</h1>
		<p>{$t('home.hero_desc')}</p>
		<div class="hero-actions">
			<Button variant="raised" href="/marketplace" class="premium-button cta-button">
				<Label>{$t('home.explore_btn')}</Label>
			</Button>
			<Button variant="outlined" href="/about" class="premium-button secondary-button">
				<Label>{$t('home.learn_btn')}</Label>
			</Button>
		</div>
	</div>
</section>

<LiveConditionsWidget />

<BannerAd placement="home_top" />

{#if featured_instructors.length > 0}
<section class="featured-instructor" aria-labelledby="featured-title">
	<h2 id="featured-title" style="text-align: center; margin-bottom: 2rem; color: var(--terciary-color);">{$t('home.featured_instructor')}</h2>
	<div class="featured-grid">
		{#each featured_instructors as featured}
		<div class="featured-card premium-card">
			<div class="featured-badge"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span></div>
			<div class="featured-content">
				<div class="featured-image-container" style="position: relative; display: inline-block;">
					<div class="featured-image" style="background-image: url({featured.profile_picture_url ? `http://127.0.0.1:5000${featured.profile_picture_url}` : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'});"></div>
					{#if featured.is_verified === 1 || featured.is_verified === true}
						<div class="verified-badge-profile" title="Verified User" style="position: absolute; bottom: 15px; right: 0; background: var(--surface-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2196f3; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
							<span class="material-icons" aria-hidden="true" style="font-size: 24px;">verified</span>
						</div>
					{/if}
				</div>
				<div class="featured-info">
					<h3>{featured.first_name || featured.username} {featured.last_name || ''}</h3>
					<h4 class="specialty">{featured.specialization || 'Surfing Instructor'}</h4>
					<p>{truncateWords(typeof featured.bio === 'string' && featured.bio.trim() ? featured.bio : defaultBio, 50)}</p>
					<Button variant="raised" href={`/marketplace/${featured.id}`} class="premium-button" style="margin-top: auto;">
						<Label>{$t('instructors.view_profile')}</Label>
					</Button>
				</div>
			</div>
		</div>
		{/each}
	</div>
</section>
{/if}

<section class="how-it-works" aria-labelledby="how-it-works-title">
	<h2 id="how-it-works-title">{$t('home.how_it_works')}</h2>
	<div class="steps-grid" role="list">
		<article class="step-card premium-card" role="listitem">
			<div class="icon material-icons" aria-hidden="true">search</div>
			<h3>{$t('home.step1_title')}</h3>
			<p>{$t('home.step1_desc')}</p>
		</article>
		<article class="step-card premium-card" role="listitem">
			<div class="icon material-icons" aria-hidden="true">calendar_today</div>
			<h3>{$t('home.step2_title')}</h3>
			<p>{$t('home.step2_desc')}</p>
		</article>
		<article class="step-card premium-card" role="listitem">
			<div class="icon material-icons" aria-hidden="true">surfing</div>
			<h3>{$t('home.step3_title')}</h3>
			<p>{$t('home.step3_desc')}</p>
		</article>
	</div>
</section>

<BannerAd placement="home_bottom" />

<style>
	.hero-section {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-soft) 100%);
		color: white;
		border-radius: 16px;
		padding: 4rem 2rem;
		text-align: center;
		margin-bottom: 4rem;
		box-shadow: 0 10px 30px rgba(69, 141, 186, 0.2);
	}

	.hero-content h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.hero-content p {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	:global(.cta-button) {
		background-color: var(--secondary-color) !important;
		color: white !important;
	}

	:global(.secondary-button) {
		border-color: white !important;
		color: white !important;
	}

	.how-it-works {
		text-align: center;
		margin-bottom: 4rem;
	}

	.how-it-works h2 {
		font-size: 2.5rem;
		margin-bottom: 3rem;
		color: var(--terciary-color);
	}

	.steps-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.step-card {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
		border: 1px solid rgba(226, 109, 63, 0.08);
	}

	.step-card .icon {
		font-size: 3rem;
		color: var(--primary-color);
		margin-bottom: 1rem;
	}

	.step-card h3 {
		margin-bottom: 1rem;
		color: var(--text-color);
	}

	.step-card p {
		color: #666;
		line-height: 1.6;
	}

	.featured-instructor {
		margin-bottom: 4rem;
	}
	.featured-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}
	.featured-card {
		background: var(--surface-color);
		border-radius: 16px;
		padding: 2rem;
		position: relative;
		border: 2px solid #FFD700;
		box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.featured-badge {
		position: absolute;
		top: -15px;
		background: linear-gradient(135deg, #FFD700, #FDB931);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
	}
	.featured-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 1rem;
		width: 100%;
		flex-grow: 1;
	}
	.featured-info {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		width: 100%;
	}
	.featured-image {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
		flex-shrink: 0;
		border: 4px solid var(--primary-color-soft);
		margin-bottom: 1rem;
	}
	.featured-info h3 {
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		font-size: 1.5rem;
	}
	.featured-info .specialty {
		color: var(--secondary-color);
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}
	.featured-info p {
		color: #555;
		margin-bottom: 1.5rem;
		line-height: 1.6;
		font-size: 0.9rem;
	}

	@media (max-width: 1024px) {
		.featured-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 1rem;
		}

		.hero-content h1 {
			font-size: 2.5rem;
		}

		.featured-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
