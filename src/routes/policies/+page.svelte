<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO title={$t('policies.title')} />

<div class="policies-container">
	<h1>{$t('policies.title')}</h1>

	<section class="policy-section">
		<h2>{$t('policies.privacy_title')}</h2>
		<p>{$t('policies.last_updated')}: {new Date().toLocaleDateString()}</p>

		<h3>{$t('policies.privacy_1_title')}</h3>
		<p>{$t('policies.privacy_1_desc')}</p>

		<h3>{$t('policies.privacy_2_title')}</h3>
		<p>{$t('policies.privacy_2_desc')}</p>

		<h3>{$t('policies.privacy_3_title')}</h3>
		<p>{$t('policies.privacy_3_desc')}</p>
	</section>

	<hr />

	<section class="policy-section">
		<h2>{$t('policies.terms_title')}</h2>

		<h3>{$t('policies.terms_1_title')}</h3>
		<p>{$t('policies.terms_1_desc')}</p>

		<h3>{$t('policies.terms_2_title')}</h3>
		<p>{$t('policies.terms_2_desc')}</p>

		<h3>{$t('policies.terms_3_title')}</h3>
		<p>{$t('policies.terms_3_desc')}</p>
	</section>
</div>

<style>
	.policies-container {
		max-width: 800px;
		margin: 0 auto;
		background: white;
		padding: 3rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(226, 109, 63, 0.08);
	}

	h1 {
		color: var(--terciary-color);
		text-align: center;
		margin-bottom: 3rem;
		font-size: 2.5rem;
	}

	h2 {
		color: var(--primary-color);
		border-bottom: 2px solid var(--background-color);
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}

	h3 {
		color: var(--text-color);
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	p {
		line-height: 1.6;
		color: #444;
		margin-bottom: 1rem;
	}

	hr {
		border: 0;
		height: 1px;
		background: #eaeaea;
		margin: 3rem 0;
	}

	@media (max-width: 600px) {
		.policies-container {
			padding: 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>
