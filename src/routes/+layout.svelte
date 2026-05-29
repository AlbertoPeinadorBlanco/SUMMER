<script lang="ts">
	import '../app.css';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import Button, { Label } from '@smui/button';

	import { setupI18n } from '$lib/i18n';
	import { t, isLoading, locale } from 'svelte-i18n';
	import { currency, type CurrencyCode } from '$lib/stores/currency';
	import { auth } from '$lib/stores/auth';
	import { notifications } from '$lib/stores/notifications';
	import LoginPopup from '$lib/components/LoginPopup.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte';
	import { onMount } from 'svelte';

	setupI18n();
	onMount(() => {
		// Restore session from httpOnly cookie on every page load
		auth.restoreSession();
	});

	let { children } = $props();
	let mobileMenuOpen = $state(false);
	let showLogin = $state(false);
	let userMenuOpen = $state(false);
	let notifMenuOpen = $state(false);
	let surfMenuOpen = $state(false);
	let resourcesMenuOpen = $state(false);
	let adminMenuOpen = $state(false);

	let unreadCount = $derived($notifications.filter(n => !n.is_read).length);

	$effect(() => {
		if ($auth.isAuthenticated) {
			notifications.fetch();
		} else {
			notifications.clear();
		}
	});

	async function markNotifRead(id: any) {
		await notifications.markAsRead(id);
	}

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

<GoogleAnalytics />

{#if $isLoading}
	<div class="loading-screen">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="app-layout">
		<TopAppBar variant="fixed" class="navbar" aria-label="Main navigation">
			<Row>
				<Section class="left-section">
					<IconButton class="material-icons app-logo" href="/" aria-label="Home page" style="margin-right: -8px;">waves</IconButton>
					<Title
						style="cursor: pointer; margin-right: 2rem; padding-left: 5px;"
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

						<!-- Surf Network Dropdown -->
						<div class="user-menu-container" style="position: relative;" onmouseleave={() => (surfMenuOpen = false)} role="group">
							<Button onclick={() => (surfMenuOpen = !surfMenuOpen)} class="nav-btn">
								<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">explore</span>
								<Label>{$t('nav.network')}</Label>
								<span class="material-icons" aria-hidden="true" style="margin-left: 4px; font-size: 1.2rem;">arrow_drop_down</span>
							</Button>
							{#if surfMenuOpen}
								<div class="user-dropdown">
									<a href="/instructors" class="dropdown-item" onclick={() => (surfMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">groups</span>
										{$t('nav.instructors')}
									</a>
									<a href="/marketplace" class="dropdown-item" onclick={() => (surfMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">storefront</span>
										{$t('nav.marketplace')}
									</a>
									<a href="/adverts" class="dropdown-item" onclick={() => (surfMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">store</span>
										{$t('nav.adverts')}
									</a>
								</div>
							{/if}
						</div>

						<!-- Resources Dropdown -->
						<div class="user-menu-container" style="position: relative;" onmouseleave={() => (resourcesMenuOpen = false)} role="group">
							<Button onclick={() => (resourcesMenuOpen = !resourcesMenuOpen)} class="nav-btn">
								<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">library_books</span>
								<Label>{$t('nav.resources')}</Label>
								<span class="material-icons" aria-hidden="true" style="margin-left: 4px; font-size: 1.2rem;">arrow_drop_down</span>
							</Button>
							{#if resourcesMenuOpen}
								<div class="user-dropdown">
									<a href="/gear-guide" class="dropdown-item" onclick={() => (resourcesMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">surfing</span>
										{$t('nav.gear_guide')}
									</a>
									<a href="/policies" class="dropdown-item" onclick={() => (resourcesMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">policy</span>
										{$t('nav.policies')}
									</a>
								</div>
							{/if}
						</div>

						<!-- Admin Dropdown (Only visible to admins) -->
						{#if $auth.isAuthenticated && $auth.user && $auth.user.role === 'admin'}
							<div class="user-menu-container" style="position: relative;" onmouseleave={() => (adminMenuOpen = false)} role="group">
								<Button onclick={() => (adminMenuOpen = !adminMenuOpen)} class="nav-btn">
									<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">admin_panel_settings</span>
									<Label>{$t('admin.title')}</Label>
									<span class="material-icons" aria-hidden="true" style="margin-left: 4px; font-size: 1.2rem;">arrow_drop_down</span>
								</Button>
								{#if adminMenuOpen}
									<div class="user-dropdown">
										<a href="/admin" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">group</span>
											{$t('admin.users_list')}
										</a>
										<a href="/admin/notifications" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">campaign</span>
											{$t('nav.admin_notifications')}
										</a>
										<a href="/admin/external-ads" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">store</span>
											{$t('nav.admin_external_ads')}
										</a>
										<a href="/admin/pricings" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">price_change</span>
											{$t('nav.admin_pricings')}
										</a>
										<a href="/admin/logs" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">analytics</span>
											{$t('nav.admin_logs')}
										</a>
										<a href="/admin/banners" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">view_carousel</span>
											Banners
										</a>
										<a href="/admin/coupons" class="dropdown-item admin-item" onclick={() => (adminMenuOpen = false)}>
											<span class="material-icons" aria-hidden="true">local_offer</span>
											{$t('nav.admin_coupons')}
										</a>
									</div>
								{/if}
							</div>
						{/if}

						<Button href="/contact" class="nav-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">mail</span>
							<Label>{$t('nav.contact')}</Label>
						</Button>
					</div>
				</Section>
				<Section
					align="end"
					class="right-section"
					role="navigation"
					aria-label="User menu"
				>
					{#if $auth.isAuthenticated && $auth.user}
						<div class="user-menu-container" style="position: relative;" onmouseleave={() => (notifMenuOpen = false)} role="group">
							<Button onclick={() => (notifMenuOpen = !notifMenuOpen)} class="nav-btn desktop-nav" style="min-width: 48px; padding: 0;">
								<span class="material-icons" aria-hidden="true">notifications</span>
								{#if unreadCount > 0}
									<span style="position: absolute; top: 0px; right: 4px; background: #e63946; color: white; border-radius: 50%; padding: 2px 5px; font-size: 10px; font-weight: bold;">{unreadCount}</span>
								{/if}
							</Button>
							{#if notifMenuOpen}
								<div class="user-dropdown desktop-nav" style="width: 320px; max-height: 400px; overflow-y: auto; right: 0;">
									{#if $notifications.length === 0}
										<div style="padding: 1rem; text-align: center; color: #666;">No notifications</div>
									{:else}
										{#each $notifications as notif}
											<div class="dropdown-item" style="flex-direction: column; align-items: flex-start; padding: 1rem; border-bottom: 1px solid #eee; {notif.is_read ? 'opacity: 0.6;' : 'font-weight: 600;'}" onclick={() => markNotifRead(notif.id)} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') markNotifRead(notif.id); }}>
												<div style="font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.25rem; text-transform: uppercase;">{notif.type.replace('_', ' ')}</div>
												<div style="font-size: 0.9rem; white-space: normal; line-height: 1.4;">{notif.message}</div>
												<div style="font-size: 0.75rem; color: #999; margin-top: 0.5rem;">{new Date(notif.created_at).toLocaleString()}</div>
											</div>
										{/each}
									{/if}
								</div>
							{/if}
						</div>

						<div class="user-menu-container" style="position: relative; margin-left: 0.5rem;" onmouseleave={() => (userMenuOpen = false)} role="group">
							<Button onclick={() => (userMenuOpen = !userMenuOpen)} class="nav-btn user-btn desktop-nav">
								{#if $auth.user.profile_picture_url}
									<img src={`http://localhost:5000${$auth.user.profile_picture_url}`} alt="Profile" class="nav-avatar" width="24" height="24" loading="lazy" decoding="async" />
								{:else}
									<div class="nav-avatar-placeholder">
										{$auth.user.username ? $auth.user.username.charAt(0).toUpperCase() : 'U'}
									</div>
								{/if}
								<span class="material-icons" aria-hidden="true" style="margin-left: 4px;">arrow_drop_down</span>
							</Button>
							{#if userMenuOpen}
								<div class="user-dropdown desktop-nav">
									<a href="/profile" class="dropdown-item" onclick={() => (userMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">person</span>
										{$t('nav.profile')}
									</a>
									<a href="/bookings" class="dropdown-item" onclick={() => (userMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">book_online</span>
										My Bookings
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
						class="lang-btn desktop-nav"
						aria-label="Toggle currency. Current: {$currency}"
					>
						<Label>{$currency}</Label>
					</Button>
					<Button
						onclick={toggleLanguage}
						variant="outlined"
						class="lang-btn desktop-nav"
						aria-label="Toggle language. Current: {$locale === 'en' ? 'English' : 'Spanish'}"
					>
						<Label>{$locale === 'en' ? 'EN' : 'ES'}</Label>
					</Button>
				</Section>
				<Section
					align="end"
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
				<Button href="/instructors" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">groups</span>
					<Label>{$t('nav.instructors')}</Label>
				</Button>
				<Button href="/adverts" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">storefront</span>
					<Label>{$t('nav.adverts')}</Label>
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
					{#if $auth.user.role === 'admin'}
						<div class="mobile-menu-header">Administration</div>
						<Button href="/admin/notifications" onclick={toggleMobileMenu} class="mobile-menu-btn admin-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">campaign</span>
							<Label>Manage Notifications</Label>
						</Button>
						<Button href="/admin/external-ads" onclick={toggleMobileMenu} class="mobile-menu-btn admin-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">store</span>
							<Label>External Adverts</Label>
						</Button>
						<Button href="/admin/pricings" onclick={toggleMobileMenu} class="mobile-menu-btn admin-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">price_change</span>
							<Label>{$t('admin.admin_pricings')}</Label>
						</Button>
						<Button href="/admin/logs" onclick={toggleMobileMenu} class="mobile-menu-btn admin-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">analytics</span>
							<Label>{$t('admin.admin_logs')}</Label>
						</Button>
						<Button href="/admin" onclick={toggleMobileMenu} class="mobile-menu-btn admin-btn">
							<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">admin_panel_settings</span>
							<Label>{$t('admin.title')}</Label>
						</Button>
						<div class="dropdown-divider" style="margin: 0.5rem -1rem;"></div>
					{/if}
					<Button href="/profile" onclick={toggleMobileMenu} class="mobile-menu-btn">
						{#if $auth.user.profile_picture_url}
							<img src={`http://127.0.0.1:5000${$auth.user.profile_picture_url}`} alt="Profile" class="nav-avatar-mobile" width="24" height="24" loading="lazy" decoding="async" />
						{:else}
							<div class="nav-avatar-placeholder-mobile">
								{$auth.user.username ? $auth.user.username.charAt(0).toUpperCase() : 'U'}
							</div>
						{/if}
						<Label>{$t('nav.profile')}</Label>
					</Button>
					<Button href="/bookings" onclick={toggleMobileMenu} class="mobile-menu-btn">
						<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">book_online</span>
						<Label>My Bookings</Label>
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

		<main class="main-content" id="main-content">
			{@render children()}
		</main>

		<footer class="app-footer">
			<div class="footer-content">
				<nav class="footer-links" aria-label="Footer navigation">
					<a href="/about">{$t('footer.about')}</a>
					<a href="/contact">{$t('nav.contact')}</a>
					<a href="/sitemap">{$t('footer.sitemap')}</a>
					<a href="/policies">{$t('footer.privacy')}</a>
					<a href="/policies">{$t('footer.terms')}</a>
				</nav>
				<p>&copy; {new Date().getFullYear()} {$t('app.title')}. {$t('footer.rights')}</p>
			</div>
		</footer>
		
		<CookieConsent />
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

	:global(.app-logo) {
		color: var(--secondary-color) !important;
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
		transition: all 0.3s ease !important;
		border-radius: 8px !important;
	}

	:global(.navbar .mdc-button:hover) {
		background-color: rgba(255, 255, 255, 0.15) !important;
		transform: translateY(-2px);
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
		position: fixed;
		top: 64px;
		left: 0;
		right: 0;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.15);
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
		color: white !important; /* Override terciary color for navbar contrast */
		margin: 0 4px !important;
	}

	.user-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.2);
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

	.dropdown-header {
		padding: 0.5rem 1rem 0.25rem;
		font-size: 0.75rem;
		font-weight: bold;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.dropdown-divider {
		height: 1px;
		background-color: #eee;
		margin: 0.5rem 0;
	}

	.admin-item {
		border-left: 3px solid var(--primary-color);
		background-color: #f8f9fa;
	}

	.mobile-menu-header {
		padding: 1rem 1rem 0.5rem;
		font-size: 0.85rem;
		font-weight: bold;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.admin-btn) {
		border-left: 4px solid var(--primary-color) !important;
		background-color: #f8f9fa !important;
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

	.nav-avatar-placeholder {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--secondary-color);
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: bold;
		margin-right: 4px;
		flex-shrink: 0;
	}

	.nav-avatar-placeholder-mobile {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--secondary-color);
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: bold;
		margin-right: 8px;
		flex-shrink: 0;
	}
</style>
