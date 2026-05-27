<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
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
			<Button variant="outlined" href="/policies" class="premium-button secondary-button">
				<Label>{$t('home.learn_btn')}</Label>
			</Button>
		</div>
	</div>
</section>

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
		border: 1px solid rgba(0, 0, 0, 0.05);
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

	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 1rem;
		}

		.hero-content h1 {
			font-size: 2.5rem;
		}
	}
</style>
