<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO title={$t('about.title')} description={$t('about.subtitle')} />

<div class="about-container" role="main">
	<div class="about-header">
		<h1>{$t('about.title')}</h1>
		<p class="subtitle">{$t('about.subtitle')}</p>
	</div>

	<div class="about-content">
		<section class="about-section premium-card" aria-labelledby="what-is">
			<h2 id="what-is">
				<span class="material-icons" aria-hidden="true">water</span>
				{$t('about.what_is_title')}
			</h2>
			<p>{$t('about.what_is_desc')}</p>
		</section>

		<section class="about-section premium-card" aria-labelledby="how-works">
			<h2 id="how-works">
				<span class="material-icons" aria-hidden="true">settings</span>
				{$t('about.how_works_title')}
			</h2>
			<p>{$t('about.how_works_desc')}</p>
		</section>

		<section class="about-section premium-card" aria-labelledby="mission">
			<h2 id="mission">
				<span class="material-icons" aria-hidden="true">flag</span>
				{$t('about.mission_title')}
			</h2>
			<p>{$t('about.mission_desc')}</p>
		</section>
	</div>
</div>

<style>
	.about-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem 1rem;
	}

	.about-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.about-header h1 {
		color: var(--terciary-color);
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #666;
		font-size: 1.2rem;
	}

	.about-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.about-section {
		background: var(--surface-color);
		padding: 2.5rem;
		border-radius: 12px;
		border: 1px solid rgba(226, 109, 63, 0.1);
	}

	.about-section h2 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--primary-color);
		margin-top: 0;
		margin-bottom: 1.25rem;
		font-size: 1.5rem;
	}

	.about-section p {
		color: #555;
		line-height: 1.7;
		font-size: 1.05rem;
		margin: 0;
	}
</style>
