<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { t } from 'svelte-i18n';
</script>

<SEO title={$t('levels.title')} description={$t('levels.subtitle')} />

<div class="levels-container">
	<div class="header">
		<h1>{$t('levels.title')}</h1>
		<p class="subtitle">{$t('levels.subtitle')}</p>
	</div>

	<div class="levels-grid">
		{#each Array.from({ length: 9 }) as _, i}
			<div class="level-card">
				<div class="level-number">{i + 1}</div>
				<div class="level-content">
					<h2>{$t(`levels.level_${i + 1}_title`)}</h2>
					<p>{$t(`levels.level_${i + 1}_desc`)}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.levels-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	.header {
		text-align: center;
		margin-bottom: 3rem;
	}
	.header h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin-bottom: 0.5rem;
	}
	.subtitle {
		font-size: 1.2rem;
		color: #666;
	}
	.levels-grid {
		display: grid;
		gap: 1.5rem;
	}
	.level-card {
		display: flex;
		align-items: center;
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		border-left: 6px solid var(--primary-color);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	.level-card:hover {
		transform: translateX(5px);
		box-shadow: 0 6px 16px rgba(226, 109, 63, 0.15);
	}
	.level-number {
		font-size: 3rem;
		font-weight: 800;
		color: var(--primary-color-soft);
		margin-right: 2rem;
		min-width: 50px;
		text-align: center;
	}
	.level-content h2 {
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		font-size: 1.3rem;
	}
	.level-content p {
		margin: 0;
		color: #555;
		line-height: 1.6;
	}
	
	@media (max-width: 600px) {
		.level-card {
			flex-direction: column;
			text-align: center;
			border-left: none;
			border-top: 6px solid var(--primary-color);
		}
		.level-number {
			margin-right: 0;
			margin-bottom: 1rem;
		}
	}
</style>
