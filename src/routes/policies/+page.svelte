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
			<h2>{$t('legal.privacy_policy')}</h2>
			<div class="legal-text">
				<h3>1. Data Collection</h3>
				<p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, profile picture, and payment method.</p>
				
				<h3>2. Use of Data</h3>
				<p>We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users and Instructors, develop safety features, authenticate users, and send product updates and administrative messages.</p>
				
				<h3>3. Cookies</h3>
				<p>We use cookies and similar technologies for purposes such as authenticating users, remembering user preferences and settings, determining the popularity of content, delivering and measuring the effectiveness of advertising campaigns, and analyzing site traffic and trends.</p>
			</div>
		</section>

		<hr />

		<section class="policy-section">
			<h2>{$t('legal.terms_of_service')}</h2>
			<div class="legal-text">
				<h3>1. Acceptance of Terms</h3>
				<p>By accessing and using SurfMarket, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform.</p>
				
				<h3>2. User Responsibilities</h3>
				<p>Users are responsible for maintaining the confidentiality of their account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
				
				<h3>3. Instructor Obligations</h3>
				<p>Instructors offering services through SurfMarket must maintain appropriate certifications and insurance. SurfMarket acts solely as a marketplace and is not responsible for the safety or quality of the lessons provided.</p>
				
				<h3>4. Termination</h3>
				<p>We reserve the right to suspend or terminate your access to the platform at any time, for any reason, including violation of these Terms of Service.</p>
			</div>
		</section>
	</div>
</div>

<style>
	.policies-container {
		max-width: 900px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.policies-header {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #eee;
	}

	.policies-header h1 {
		font-size: 2.5rem;
		color: #1d3557;
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
		color: #1d3557;
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
