<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import LiveConditionsWidget from '$lib/components/LiveConditionsWidget.svelte';
	import BannerAd from '$lib/components/BannerAd.svelte';

	let { data } = $props();
	let featured = $derived(data?.featured);
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

{#if featured}
<section class="featured-instructor" aria-labelledby="featured-title">
	<div class="featured-card premium-card">
		<div class="featured-badge"><span class="material-icons">star</span> {$t('home.featured_instructor')} <span class="material-icons">star</span></div>
		<div class="featured-content">
			<div class="featured-image" style="background-image: url({featured.profile_picture_url ? `http://127.0.0.1:5000${featured.profile_picture_url}` : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'});"></div>
			<div class="featured-info">
				<h2 id="featured-title">{featured.first_name || featured.username} {featured.last_name || ''}</h2>
				<h3 class="specialty">{featured.specialization || 'Surfing Instructor'}</h3>
				<p>{featured.bio || ''}</p>
				<Button variant="raised" href={`/marketplace/${featured.id}`} class="premium-button">
					<Label>{$t('instructors.view_profile')}</Label>
				</Button>
			</div>
		</div>
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
		background: white;
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
	.featured-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		position: relative;
		border: 2px solid #FFD700;
		box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
	}
	.featured-badge {
		position: absolute;
		top: -15px;
		left: 2rem;
		background: linear-gradient(135deg, #FFD700, #FDB931);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: bold;
		text-transform: uppercase;
		font-size: 0.85rem;
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
	}
	.featured-content {
		display: flex;
		gap: 2rem;
		align-items: center;
		margin-top: 1rem;
	}
	.featured-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
		flex-shrink: 0;
		border: 4px solid var(--primary-color-soft);
	}
	.featured-info h2 {
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		font-size: 2rem;
	}
	.featured-info .specialty {
		color: var(--secondary-color);
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}
	.featured-info p {
		color: #555;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 1rem;
		}

		.hero-content h1 {
			font-size: 2.5rem;
		}

		.featured-content {
			flex-direction: column;
			text-align: center;
		}
		.featured-badge {
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
