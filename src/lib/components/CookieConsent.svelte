<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import Button, { Label } from '@smui/button';

	let showConsent = $state(false);

	onMount(() => {
		const consent = localStorage.getItem('cookie_consent');
		if (!consent) {
			showConsent = true;
		}
	});

	function acceptCookies() {
		localStorage.setItem('cookie_consent', 'true');
		showConsent = false;
	}

	function declineCookies() {
		localStorage.setItem('cookie_consent', 'false');
		showConsent = false;
	}
</script>

{#if showConsent}
	<div class="cookie-banner" role="dialog" aria-live="polite">
		<div class="cookie-content">
			<span class="material-icons cookie-icon">cookie</span>
			<p>{$t('cookie.message')}</p>
		</div>
		<div class="cookie-actions">
			<Button variant="outlined" onclick={declineCookies} class="decline-btn">
				<Label>{$t('cookie.decline')}</Label>
			</Button>
			<Button variant="raised" onclick={acceptCookies} class="accept-btn">
				<Label>{$t('cookie.accept')}</Label>
			</Button>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		background: #1d3557;
		color: white;
		z-index: 9999;
		padding: 1rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		animation: slideUp 0.5s ease-out;
	}

	.cookie-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		text-align: center;
		max-width: 800px;
	}

	.cookie-icon {
		font-size: 2rem;
		color: #f1faee;
	}

	.cookie-content p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		color: #f1faee;
	}

	.cookie-actions {
		display: flex;
		gap: 1rem;
		width: 100%;
		justify-content: center;
	}

	:global(.cookie-banner .accept-btn) {
		background-color: #e63946 !important;
		color: white !important;
	}

	:global(.cookie-banner .decline-btn) {
		border-color: rgba(255, 255, 255, 0.5) !important;
		color: #f1faee !important;
	}

	@media (min-width: 768px) {
		.cookie-banner {
			flex-direction: row;
			padding: 1rem 5%;
		}
		.cookie-content {
			text-align: left;
			margin-bottom: 0;
		}
		.cookie-actions {
			width: auto;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
