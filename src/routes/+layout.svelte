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
	import GeolocationNotice from '$lib/components/GeolocationNotice.svelte';
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { selectedBeach, userLocationName, isGeolocationEnabled } from '$lib/stores/location';
	import { onMount } from 'svelte';

	let shareUrl = '';
	let shareText = encodeURIComponent('Check out SUMMER - The best surfing platform!');

	setupI18n();
	onMount(() => {
		// Restore session from httpOnly cookie on every page load
		auth.restoreSession();
		shareUrl = encodeURIComponent(window.location.origin);
	});

	function copyToClipboard() {
		navigator.clipboard.writeText(decodeURIComponent(shareUrl)).then(() => {
			alert('Link copied to clipboard!');
		});
	}

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
						{#if !$isGeolocationEnabled}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div onclick={() => $isGeolocationEnabled = true} class="header-location" style="display: flex; align-items: center; margin-right: 1.5rem; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; cursor: pointer;" title={$t('nav.location_disabled')}>
								<span class="material-icons" style="font-size: 1.1rem; margin-right: 4px; color: #ffeb3b;">location_off</span>
								{$t('nav.location_disabled')}
							</div>
						{:else if $userLocationName}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div onclick={() => $isGeolocationEnabled = false} class="header-location" style="display: flex; align-items: center; margin-right: 1.5rem; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; cursor: pointer;" title="Disable Location">
								<span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">location_on</span>
								{$userLocationName}
							</div>
						{/if}
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
									<a href="/instructor-guide" class="dropdown-item" onclick={() => (resourcesMenuOpen = false)}>
										<span class="material-icons" aria-hidden="true">help_outline</span>
										{$t('nav.instructor_guide')}
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
							<Button onclick={() => (notifMenuOpen = !notifMenuOpen)} class="nav-btn desktop-nav" style="min-width: 48px; padding: 0;" aria-label="Toggle notifications">
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
											<div class="dropdown-item" style="flex-direction: column; align-items: flex-start; padding: 1rem; border-bottom: 1px solid var(--border-color); {notif.is_read ? 'opacity: 0.6;' : 'font-weight: 600;'}" onclick={() => markNotifRead(notif.id)} role="button" tabindex="0" onkeydown={(e) => { if(e.key === 'Enter') markNotifRead(notif.id); }}>
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
							<Button onclick={() => (userMenuOpen = !userMenuOpen)} class="nav-btn user-btn desktop-nav" aria-label="Toggle user menu">
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
										{$t('nav.my_bookings')}
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
					<Button
						onclick={toggleTheme}
						variant="outlined"
						class="lang-btn desktop-nav theme-toggle-btn"
						aria-label="Toggle theme"
					>
						<span class="material-icons" aria-hidden="true">
							{$theme === 'dark' ? 'dark_mode' : 'light_mode'}
						</span>
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
					<Button
						onclick={toggleTheme}
						class="lang-btn-mobile theme-toggle-btn"
						style="min-width: 48px; padding: 0;"
						aria-label="Toggle theme"
					>
						<span class="material-icons" aria-hidden="true" style="font-size: 1.2rem;">
							{$theme === 'dark' ? 'dark_mode' : 'light_mode'}
						</span>
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
				{#if !$isGeolocationEnabled}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div onclick={() => $isGeolocationEnabled = true} class="mobile-menu-location" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: rgba(226, 109, 63, 0.1); border-radius: 8px; color: #f57c00; font-weight: bold; cursor: pointer;" title="Enable Location">
						<span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">location_off</span>
						{$t('nav.location_disabled')}
					</div>
				{:else if $userLocationName}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div onclick={() => $isGeolocationEnabled = false} class="mobile-menu-location" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: rgba(226, 109, 63, 0.1); border-radius: 8px; color: var(--primary-color); font-weight: bold; cursor: pointer;" title="Disable Location">
						<span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">location_on</span>
						{$userLocationName}
					</div>
				{/if}
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
				<Button href="/instructor-guide" onclick={toggleMobileMenu} class="mobile-menu-btn">
					<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">help_outline</span>
					<Label>{$t('nav.instructor_guide')}</Label>
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
						<Label>{$t('nav.my_bookings')}</Label>
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
			<div class="footer-content" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
				<nav class="footer-links" aria-label="Footer navigation">
					<a href="/about">{$t('footer.about')}</a>
					<a href="/contact">{$t('nav.contact')}</a>
					<a href="/sitemap">{$t('footer.sitemap')}</a>
					<a href="/policies">{$t('footer.privacy')}</a>
					<a href="/policies">{$t('footer.terms')}</a>
				</nav>
				
				<div class="footer-bottom">
					<div class="footer-copyright">
						<p>&copy; {new Date().getFullYear()} <a href="/" class="copyright-link">{$t('app.title')}</a>. {$t('footer.rights')}</p>
					</div>
					<div class="footer-share-section">
						<span>Share Surfmarket</span>
						<div class="footer-share-buttons">
							<a href={`whatsapp://send?text=${shareText}%20${shareUrl}`} target="_blank" class="share-icon" title="Share on WhatsApp">
								<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
							</a>
							<a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" class="share-icon" title="Share on Facebook">
								<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
							</a>
							<a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" class="share-icon" title="Share on X">
								<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
							</a>
							<a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" class="share-icon" title="Share on Telegram">
								<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
							</a>
							<button onclick={copyToClipboard} class="share-icon" title="Copy Link" aria-label="Copy to clipboard" style="background:none; border:none; padding:0; cursor:pointer;">
								<span class="material-icons" aria-hidden="true" style="font-size:20px;">content_copy</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</footer>
		
		<CookieConsent />
		<GeolocationNotice />
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
		background-color: var(--surface-color) !important;
		border-radius: 8px !important;
		border: 1px solid var(--border-color) !important;
	}

	:global(.nav-btn) {
		color: white !important; /* Override terciary color for navbar contrast */
		margin: 0 4px !important;
	}

	.user-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background: var(--surface-color);
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
		position: relative;
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

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.footer-links a {
		color: var(--primary-color-soft);
		text-decoration: underline;
	}

	.footer-links a:hover {
		opacity: 0.8;
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

	/* Mobile and Tablet friendliness */
	@media (max-width: 1024px) {
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
		
		.footer-bottom {
			flex-direction: column;
			gap: 1.5rem;
		}
		.footer-share-section {
			position: static !important;
			justify-content: center !important;
		}
	}

	.footer-bottom {
		display: flex; 
		justify-content: center;
		width: 100%; 
		align-items: center;
	}
	
	.footer-copyright {
		text-align: center;
	}
	
	.footer-copyright p {
		margin: 0;
	}

	.copyright-link {
		color: var(--primary-color);
		text-decoration: underline;
		font-weight: bold;
		transition: opacity 0.2s;
	}

	:global([data-theme="dark"]) .copyright-link {
		color: #1a4a7a;
	}

	.copyright-link:hover {
		opacity: 0.8;
	}
	
	.footer-share-section {
		position: absolute;
		right: 2rem;
		bottom: 2rem;
		display: flex; 
		align-items: center; 
		gap: 1rem;
	}
	
	.footer-share-section span {
		opacity: 0.8; 
		font-size: 0.9rem; 
		white-space: nowrap;
	}

	.footer-share-buttons {
		display: flex; 
		gap: 0.75rem; 
		align-items: center;
	}

	.share-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		opacity: 0.8;
		transition: opacity 0.2s, color 0.2s;
	}

	.share-icon:hover {
		opacity: 1;
		color: var(--primary-color);
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
