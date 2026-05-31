<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO title={$t('legal.policies_title')} description={$t('legal.policies_desc')} />

<div class="policies-container">
	<header class="policies-header">
		<h1>{$t('legal.policies_title')}</h1>
		<p>{$t('legal.policies_desc')}</p>
	</header>

	<div class="policies-content">
		<section class="policy-section">
			<h2>{$t('policies.privacy_title')}</h2>
			<div class="legal-text">
				<h3>{$t('policies.privacy_1_title')}</h3>
				<p>{$t('policies.privacy_1_desc')}</p>
				
				<h3>{$t('policies.privacy_2_title')}</h3>
				<p>{$t('policies.privacy_2_desc')}</p>
				
				<h3>{$t('policies.privacy_3_title')}</h3>
				<p>{$t('policies.privacy_3_desc')}</p>
			</div>
		</section>

		<hr />

		<section class="policy-section">
			<h2>{$t('policies.terms_title')}</h2>
			<div class="legal-text">
				<h3>{$t('policies.terms_1_title')}</h3>
				<p>{$t('policies.terms_1_desc')}</p>
				
				<h3>{$t('policies.terms_2_title')}</h3>
				<p>{$t('policies.terms_2_desc')}</p>
				
				<h3>{$t('policies.terms_3_title')}</h3>
				<p>{$t('policies.terms_3_desc')}</p>

				<h3>{$t('policies.behavior_title')}</h3>
				<p>{$t('policies.behavior_desc')}</p>

				<h3>{$t('policies.communications_title')}</h3>
				<p>{$t('policies.communications_desc')}</p>

				<h3>{$t('policies.payments_title')}</h3>
				<p>{$t('policies.payments_desc')}</p>
			</div>
		</section>

		<hr />

		<section class="policy-section">
			<h2>{$t('geolocation.policy_title')}</h2>
			<div class="legal-text">
				<p>{$t('geolocation.policy_desc')}</p>
			</div>
		</section>
	</div>
</div>

<style>
	.policies-container {
		max-width: 900px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--surface-color);
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.policies-header {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border-color);
	}

	.policies-header h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin-bottom: 1rem;
	}

	.policies-header p {
		color: #666;
		font-size: 1.1rem;
	}

	.policy-section {
		margin-bottom: 3rem;
	}

	.policy-section h2 {
		color: #e63946;
		font-size: 2rem;
		margin-bottom: 1.5rem;
	}

	.legal-text h3 {
		color: var(--terciary-color);
		font-size: 1.2rem;
		margin: 1.5rem 0 0.5rem 0;
	}

	.legal-text p {
		color: #444;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	hr {
		border: 0;
		height: 1px;
		background: #eee;
		margin: 3rem 0;
	}
</style>
