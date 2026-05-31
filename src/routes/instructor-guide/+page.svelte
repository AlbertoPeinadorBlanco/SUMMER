<script lang="ts">
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import { formatPrice } from '$lib/stores/currency';
	import { pricings } from '$lib/stores/pricings';

</script>

<SEO title="{$t('instructor_guide.title')} - SUMMER" description="{$t('instructor_guide.subtitle')}" />

<div class="guide-container">
	<div class="hero-section">
		<h1>{$t('instructor_guide.title')}</h1>
		<p class="subtitle">{$t('instructor_guide.subtitle')}</p>
	</div>

	<section class="guide-section">
		<h2>{$t('instructor_guide.subscriptions_title')}</h2>
		<p>{$t('instructor_guide.subscriptions_desc')}</p>
		<div class="card-grid">
			<Card class="tier-card premium-card">
				<Content>
					<div class="tier-header">
						<span class="material-icons tier-icon">person</span>
						<h3>{$t('instructor_guide.basic_title')}</h3>
					</div>
					<p>{$t('instructor_guide.basic_desc')}</p>
				</Content>
			</Card>
			<Card class="tier-card premium-card">
				<Content>
					<div class="tier-header">
						<span class="material-icons tier-icon premium-icon">stars</span>
						<h3>{$t('instructor_guide.premium_title')}</h3>
					</div>
					<p>{$t('instructor_guide.premium_desc')}</p>
					<div class="price">{$formatPrice($pricings.premium_subscription)} / month</div>
				</Content>
			</Card>
			<Card class="tier-card premium-card summer-pass">
				<Content>
					<div class="tier-header">
						<span class="material-icons tier-icon pass-icon">workspace_premium</span>
						<h3>{$t('instructor_guide.pass_title')}</h3>
					</div>
					<p>{$t('instructor_guide.pass_desc')}</p>
					<div class="price">{$formatPrice($pricings.summer_pass)} / year</div>
				</Content>
			</Card>
		</div>
		<div class="action-container">
			<Button variant="raised" href="/profile" class="action-btn">
				<span class="material-icons" style="margin-right: 8px;">shopping_cart</span>
				<Label>{$t('instructor_guide.btn_upgrade')}</Label>
			</Button>
		</div>
	</section>

	<section class="guide-section">
		<h2>{$t('instructor_guide.positioning_title')}</h2>
		
		<div class="feature-block">
			<div class="feature-icon"><span class="material-icons">trending_up</span></div>
			<div class="feature-content">
				<h3>{$t('instructor_guide.bump_title')}</h3>
				<p>{$t('instructor_guide.bump_desc1')}</p>
				<p><strong>{$t('instructor_guide.bump_desc2')}</strong></p>
			</div>
		</div>

		<div class="feature-block">
			<div class="feature-icon"><span class="material-icons" style="color: #FFD700;">star</span></div>
			<div class="feature-content">
				<h3>{$t('instructor_guide.iotw_title')}</h3>
				<p>{$t('instructor_guide.iotw_desc1')}</p>
				<p>{$t('instructor_guide.iotw_desc2')}</p>
			</div>
		</div>
		<div class="action-container">
			<Button variant="raised" href="/instructor/manage-ads" class="action-btn">
				<span class="material-icons" style="margin-right: 8px;">campaign</span>
				<Label>{$t('instructor_guide.btn_manage_ads')}</Label>
			</Button>
		</div>
	</section>

	<section class="guide-section">
		<h2>{$t('instructor_guide.enhancements_title')}</h2>
		<ul class="enhancement-list">
			<li>
				<span class="material-icons">verified</span>
				<div>
					<strong>{$t('instructor_guide.verified_title')}</strong> {$t('instructor_guide.verified_desc')}
				</div>
			</li>
			<li>
				<span class="material-icons">event_available</span>
				<div>
					<strong>{$t('instructor_guide.available_title')}</strong> {$t('instructor_guide.available_desc')}
				</div>
			</li>
			<li>
				<span class="material-icons">videocam</span>
				<div>
					<strong>{$t('instructor_guide.video_title')}</strong> {$t('instructor_guide.video_desc')}
				</div>
			</li>
			<li>
				<span class="material-icons">link</span>
				<div>
					<strong>{$t('instructor_guide.link_title')}</strong> {$t('instructor_guide.link_desc')}
				</div>
			</li>
		</ul>
	</section>
</div>

<style>
	.action-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
	:global(.action-btn) {
		background-color: var(--secondary-color) !important;
		color: white !important;
		padding: 0 2rem !important;
		height: 48px !important;
	}

	.guide-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero-section {
		text-align: center;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-soft) 100%);
		color: white;
		border-radius: 12px;
		margin-bottom: 3rem;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.hero-section h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.hero-section .subtitle {
		font-size: 1.2rem;
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto;
	}

	.guide-section {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		margin-bottom: 2rem;
	}

	.guide-section h2 {
		color: var(--terciary-color);
		border-bottom: 2px solid var(--primary-color-soft);
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	:global(.tier-card) {
		height: 100%;
		border: 1px solid var(--border-color) !important;
	}

	:global(.summer-pass) {
		border: 2px solid #FFD700 !important;
	}

	.tier-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tier-header h3 {
		margin: 0;
		color: var(--text-color);
	}

	.tier-icon {
		font-size: 28px;
		color: #666;
	}

	.premium-icon { color: #2196f3; }
	.pass-icon { color: #FFD700; }

	.price {
		font-weight: bold;
		font-size: 1.2rem;
		color: var(--primary-color);
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}

	.feature-block {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--background-color);
		border-radius: 8px;
	}

	.feature-icon .material-icons {
		font-size: 40px;
		color: var(--secondary-color);
	}

	.feature-content h3 {
		margin: 0 0 0.5rem 0;
		color: var(--text-color);
	}

	.feature-content p {
		margin: 0 0 0.5rem 0;
		line-height: 1.5;
	}

	.enhancement-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.enhancement-list li {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		align-items: flex-start;
	}

	.enhancement-list .material-icons {
		color: var(--primary-color);
		font-size: 28px;
	}

	.enhancement-list strong {
		color: var(--text-color);
		display: block;
		margin-bottom: 0.25rem;
	}

	.share-section {
		text-align: center;
		padding: 2rem;
		background: var(--surface-color);
		border-radius: 12px;
		border: 1px solid var(--border-color);
	}

	.share-buttons {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	:global(.share-btn) { color: white !important; }
	:global(.share-btn.whatsapp) { background-color: #25D366 !important; }
	:global(.share-btn.facebook) { background-color: #1877F2 !important; }
	:global(.share-btn.twitter) { background-color: #1DA1F2 !important; }
	:global(.share-btn.telegram) { background-color: #0088cc !important; }
	:global(.share-btn.copy) { 
		background-color: transparent !important; 
		color: var(--text-color) !important;
		border-color: var(--border-color) !important;
	}

	@media (max-width: 768px) {
		.feature-block {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
