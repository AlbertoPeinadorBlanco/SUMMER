<script lang="ts">
	import '../app.css';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import Button, { Label } from '@smui/button';

	import { setupI18n } from '$lib/i18n';
	import { t, isLoading, locale } from 'svelte-i18n';
	import { currency, type CurrencyCode } from '$lib/stores/currency';
	import { auth } from '$lib/stores/auth';
	import LoginPopup from '$lib/components/LoginPopup.svelte';

	setupI18n();

	let { children } = $props();
	let mobileMenuOpen = $state(false);
	let showLogin = $state(false);
	let userMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function toggleLanguage() {
		$locale = $locale === 'en' ? 'es' : 'en';
	}

	function toggleCurrency() {
		const next: Record<CurrencyCode, CurrencyCode> = { USD: 'EUR', EUR: 'GBP', GBP: 'USD' };
		$currency = next[$currency];
	}
</script>

<svelte:head>
	{#if !$isLoading}
		<title>{$t('app.title')}</title>
		<meta name="description" content={$t('app.meta_description')} />
	{/if}
</svelte:head>

{#if $isLoading}
	<div class="loading-screen">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="app-layout">
		<TopAppBar variant="fixed" class="navbar" aria-label="Main navigation">
			<Row>
				<Section class="left-section">
					<IconButton class="material-icons" href="/" aria-label="Home page">waves</IconButton>
					<Title
						style="cursor: pointer; margin-right: 2rem;"
						onclick={() => (window.location.href = '/')}
						aria-label="{$t('app.title')} homepage"
					>
						{$t('app.title')}
					</Title>
					<div class="desktop-nav" role="navigation" aria-label="Desktop menu">
						<Button href="/" class="nav-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">home</span>
							<Label>{$t('nav.home')}</Label>
						</Button>
						<Button href="/marketplace" class="nav-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;"
								>storefront</span
							>
							<Label>{$t('nav.marketplace')}</Label>
						</Button>
						<Button href="/policies" class="nav-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">policy</span>
							<Label>{$t('nav.policies')}</Label>
						</Button>
						<Button href="/contact" class="nav-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">mail</span>
							<Label>{$t('nav.contact')}</Label>
						</Button>
					</div>
				</Section>
				<Section
					align="end"
					toolbar
					class="right-section"
					role="navigation"
					aria-label="User menu"
				>
					{#if $auth.isAuthenticated && $auth.user}
						<div class="user-menu-container" style="position: relative;" onmouseleave={() => (userMenuOpen = false)}>
							<Button onclick={() => (userMenuOpen = !userMenuOpen)} class="nav-btn user-btn desktop-nav">
								{#if $auth.user.profile_picture_url}
									<img src={`http://localhost:5000${$auth.user.profile_picture_url}`} alt="Profile" class="nav-avatar" />
								{:else}
									<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">person</span>
								{/if}
								<Label>{$t('nav.profile')}</Label>
								<span class="material-icons" aria-hidden="true" style="margin-left: 4px;">arrow_drop_down</span>
							</Button>
							{#if userMenuOpen}
								<div class="user-dropdown desktop-nav">
									<a href="/profile" class="dropdown-item" onclick={() => (userMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">person</span>
										{$t('nav.profile')}
									</a>
									{#if $auth.user.role === 'instructor'}
										<a href="/instructor/manage-ads" class="dropdown-item" onclick={() => (userMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">edit_note</span>
											{$t('nav.manageAds')}
										</a>
									{/if}
									<button class="dropdown-item" onclick={() => { auth.logout(); userMenuOpen = false; }}>
										<span class="material-icons" aria-hidden="true">logout</span>
										{$t('nav.logout')}
									</button>
								</div>
							{/if}
						</div>
					{:else}
						<Button onclick={() => (showLogin = true)} class="nav-btn desktop-nav">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">login</span
							>
							<Label>{$t('nav.login')}</Label>
						</Button>
					{/if}

					<Button
						onclick={toggleCurrency}
						variant="outlined"
						class="lang-btn"
						aria-label="Toggle currency. Current: {$currency}"
					>
						<Label>{$currency}</Label>
					</Button>
					<Button
						onclick={toggleLanguage}
						variant="outlined"
						class="lang-btn"
						aria-label="Toggle language. Current: {$locale === 'en' ? 'English' : 'Spanish'}"
					>
						<Label>{$locale === 'en' ? 'EN' : 'ES'}</Label>
					</Button>
				</Section>
				<Section
					align="end"
					toolbar
					class="mobile-nav-toggle"
					role="navigation"
					aria-label="Mobile controls"
				>
					<Button
						onclick={toggleCurrency}
						class="lang-btn-mobile"
						style="min-width: 48px; padding: 0;"
						aria-label="Toggle currency"
					>
						<Label>{$currency}</Label>
					</Button>
					<Button
						onclick={toggleLanguage}
						class="lang-btn-mobile"
						style="min-width: 48px; padding: 0;"
						aria-label="Toggle language"
					>
						<Label>{$locale === 'en' ? 'EN' : 'ES'}</Label>
					</Button>
					<IconButton
						class="material-icons"
						onclick={toggleMobileMenu}
						aria-expanded={mobileMenuOpen}
						aria-label="Toggle mobile menu"
					>
						<span aria-hidden="true">menu</span>
					</IconButton>
				</Section>
			</Row>
		</TopAppBar>

		{#if mobileMenuOpen}
			<nav class="mobile-menu" aria-label="Mobile menu">
				<Button href="/" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">home</span>
					<Label>{$t('nav.home')}</Label>
				</Button>
				<Button href="/marketplace" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;"
						>storefront</span
					>
					<Label>{$t('nav.marketplace')}</Label>
				</Button>
				<Button href="/policies" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">policy</span>
					<Label>{$t('nav.policies')}</Label>
				</Button>
				<Button href="/contact" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">mail</span>
					<Label>{$t('nav.contact')}</Label>
				</Button>

				{#if $auth.isAuthenticated && $auth.user}
					{#if $auth.user.role === 'instructor'}
						<Button href="/instructor/manage-ads" onclick={toggleMobileMenu} class="mobile-menu-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">edit_note</span>
							<Label>{$t('nav.manageAds')}</Label>
						</Button>
					{/if}
					<Button href="/profile" onclick={toggleMobileMenu} class="mobile-menu-btn">
						{#if $auth.user.profile_picture_url}
							<img src={`http://localhost:5000${$auth.user.profile_picture_url}`} alt="Profile" class="nav-avatar-mobile" />
						{:else}
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">person</span>
						{/if}
						<Label>{$t('nav.profile')}</Label>
					</Button>
					<Button
						onclick={() => {
							auth.logout();
							toggleMobileMenu();
						}}
						class="mobile-menu-btn"
					>
						<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">logout</span>
						<Label>{$t('nav.logout')}</Label>
					</Button>
				{:else}
					<Button
						onclick={() => {
							showLogin = true;
							toggleMobileMenu();
						}}
						class="mobile-menu-btn"
					>
						<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">login</span>
						<Label>{$t('nav.login')}</Label>
					</Button>
				{/if}
			</nav>
		{/if}

		<main class="main-content" id="main-content" role="main">
			{@render children()}
		</main>

		<footer class="app-footer" role="contentinfo">
			<div class="footer-content">
				<nav class="footer-links" aria-label="Footer navigation">
					<a href="/contact">{$t('nav.contact')}</a>
					<a href="/policies">{$t('footer.privacy')}</a>
					<a href="/policies">{$t('footer.terms')}</a>
				</nav>
				<p>&copy; {new Date().getFullYear()} {$t('app.title')}. {$t('footer.rights')}</p>
			</div>
		</footer>
	</div>

	<LoginPopup bind:open={showLogin} />
{/if}

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	:global(.left-section) {
		display: flex;
		align-items: center;
	}

	:global(.desktop-nav) {
		display: flex;
		align-items: center;
	}

	/* Make SMUI TopAppBar use our primary color */
	:global(.navbar) {
		background-color: var(--primary-color) !important;
		color: white !important;
	}

	:global(.navbar .mdc-button) {
		color: white !important;
	}

	:global(.lang-btn) {
		border-color: rgba(255, 255, 255, 0.5) !important;
		margin-left: 1rem !important;
	}

	:global(.lang-btn-mobile) {
		margin-right: 0.5rem !important;
	}

	:global(.mobile-nav-toggle) {
		display: none !important;
	}

	.mobile-menu {
		display: none;
		flex-direction: column;
		background-color: var(--background-color);
		padding: 1rem;
		border-bottom: 2px solid var(--primary-color-soft);
		position: absolute;
		top: 64px;
		left: 0;
		right: 0;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	:global(.mobile-menu-btn) {
		justify-content: flex-start !important;
		width: 100%;
		padding: 1rem !important;
		margin-bottom: 0.5rem;
		color: var(--terciary-color) !important;
		font-size: 1.1rem !important;
		background-color: white !important;
		border-radius: 8px !important;
		border: 1px solid #eaeaea !important;
	}

	:global(.nav-btn) {
		color: var(--terciary-color) !important;
	}

	.user-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 0.5rem 0;
		min-width: 200px;
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		color: var(--text-color);
		text-decoration: none;
		background: none;
		border: none;
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		cursor: pointer;
		font-size: 1rem;
		font-family: inherit;
		transition: background-color 0.2s, color 0.2s;
	}

	.dropdown-item:hover {
		background-color: rgba(69, 141, 186, 0.1);
		color: var(--primary-color);
	}

	.dropdown-item .material-icons {
		margin-right: 12px;
		font-size: 1.25rem;
		color: #666;
		transition: color 0.2s;
	}

	.dropdown-item:hover .material-icons {
		color: var(--primary-color);
	}

	.nav-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-right: 4px;
		object-fit: cover;
	}
	.nav-avatar-mobile {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-right: 8px;
		object-fit: cover;
	}

	.mobile-menu :global(.mdc-button) {
		justify-content: flex-start;
		margin-bottom: 0.5rem;
		width: 100%;
	}

	.main-content {
		flex: 1;
		margin-top: 64px; /* Space for fixed app bar */
		padding: 2rem 1rem;
		max-width: 1200px;
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
	}

	.app-footer {
		background-color: var(--terciary-color);
		color: #fff;
		padding: 2rem 1rem;
		text-align: center;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.footer-links a {
		color: var(--primary-color-soft);
		text-decoration: none;
		margin: 0 1rem;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

	.loading-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: var(--background-color);
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 5px solid var(--primary-color-soft);
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Mobile friendliness */
	@media (max-width: 600px) {
		.main-content {
			padding: 1rem;
		}
		:global(.desktop-nav) {
			display: none !important;
		}
		:global(.mobile-nav-toggle) {
			display: flex !important;
		}
		.mobile-menu {
			display: flex;
		}
	}
</style>
