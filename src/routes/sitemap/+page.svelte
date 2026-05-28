<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="{$t('footer.sitemap')} - {$t('app.title')}"
	description="Site map for SurfMarket - Find all our pages here."
/>

<div class="sitemap-container" role="main">
	<div class="sitemap-header">
		<h1>{$t('footer.sitemap')}</h1>
		<p>Find your way around {$t('app.title')}.</p>
	</div>

	<div class="sitemap-grid">
		<section class="sitemap-section">
			<h2>Main Navigation</h2>
			<ul>
				<li><a href="/">{$t('nav.home')}</a></li>
				<li><a href="/marketplace">{$t('nav.marketplace')}</a></li>
				<li><a href="/instructors">{$t('nav.instructors')}</a></li>
			</ul>
		</section>

		<section class="sitemap-section">
			<h2>Support & Policies</h2>
			<ul>
				<li><a href="/contact">{$t('nav.contact')}</a></li>
				<li><a href="/policies">{$t('nav.policies')}</a></li>
				<li><a href="/levels">{$t('levels.title')}</a></li>
			</ul>
		</section>

		<section class="sitemap-section">
			<h2>Account</h2>
			<ul>
				<li><a href="/profile">{$t('nav.profile')}</a></li>
				<li><a href="/instructor/manage-ads">{$t('nav.manageAds')}</a></li>
			</ul>
		</section>
	</div>
</div>

<style>
	.sitemap-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 4rem 2rem;
	}

	.sitemap-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.sitemap-header h1 {
		font-size: 3rem;
		color: var(--terciary-color);
		margin: 0 0 1rem 0;
	}

	.sitemap-header p {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.sitemap-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 3rem;
	}

	.sitemap-section {
		background: white;
		padding: 2.5rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		border: 1px solid #f0f0f0;
	}

	.sitemap-section h2 {
		color: var(--primary-color);
		font-size: 1.5rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--primary-color-soft);
	}

	.sitemap-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.sitemap-section li {
		margin-bottom: 1rem;
	}

	.sitemap-section a {
		color: var(--text-color);
		text-decoration: none;
		font-size: 1.1rem;
		display: flex;
		align-items: center;
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.sitemap-section a::before {
		content: "arrow_right";
		font-family: "Material Icons";
		color: var(--secondary-color);
		margin-right: 0.5rem;
		font-size: 1.2rem;
		transition: transform 0.2s ease;
	}

	.sitemap-section a:hover {
		color: var(--secondary-color);
		transform: translateX(4px);
	}

	.sitemap-section a:hover::before {
		transform: translateX(2px);
	}

	@media (max-width: 600px) {
		.sitemap-container {
			padding: 2rem 1rem;
		}

		.sitemap-header h1 {
			font-size: 2.5rem;
		}
	}
</style>
