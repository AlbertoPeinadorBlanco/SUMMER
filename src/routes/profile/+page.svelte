<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import { pricings } from '$lib/stores/pricings';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
	import { isGeolocationEnabled } from '$lib/stores/location';
	import { formatPrice } from '$lib/stores/currency';
	import { onMount } from 'svelte';

	let user = $derived($auth.user);
	let isAuthenticated = $derived($auth.isAuthenticated);

	let email = $state('');
	let first_name = $state('');
	let last_name = $state('');
	let phone = $state('');
	let username = $state('');
	let profile_picture_url = $state('');
	let video_url = $state('');
	let booking_link = $state('');
	let available_today = $state(false);
	let allow_communications = $state(true);

	let loading = $state(false);
	let error = $state('');
	let successMsg = $state('');

	let featured_instructor: any = $state(null);

	onMount(async () => {
		try {
			const data = await fetchApi('/users/featured');
			if (data && Array.isArray(data.featured)) {
				featured_instructor = data.featured.find((f: any) => f.id === user?.id) || null;
				// If not currently featured, but there are 3 featured already, we might want to know if it's full
				if (!featured_instructor && data.featured.length >= 3) {
					featured_instructor = 'full'; // use a special value or add a state var
				}
			}
		} catch (e) {
			console.error('Failed to load featured instructor', e);
		}

		if (window.location.search.includes('success=true')) {
			successMsg = $t('profile.alerts.payment_success');
			setTimeout(() => (successMsg = ''), 5000);
			// Clean up URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	});

	// Svelte 5 rune to sync auth user data to local form state once authenticated
	$effect(() => {
		if (user) {
			email = user.email || '';
			first_name = user.first_name || '';
			last_name = user.last_name || '';
			phone = user.phone || '';
			username = user.username || '';
			profile_picture_url = user.profile_picture_url || '';
			video_url = user.video_url || '';
			booking_link = user.booking_link || '';
			available_today = user.available_today || false;
			allow_communications = user.allow_communications !== undefined ? !!user.allow_communications : true;
		} else if (isAuthenticated === false) {
			// Redirect if not logged in
			goto('/');
		}
	});

	async function handleUpdate(e: Event) {
		e.preventDefault();
		if (!user) return;

		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					first_name,
					last_name,
					phone
				})
			});

			// Update local auth store so layout / other components reflect new name
			auth.updateUser({ first_name, last_name, phone });
			successMsg = $t('profile.alerts.profile_updated');
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			if (err.errors && Array.isArray(err.errors)) {
				error = err.errors.map((e: any) => Object.values(e)[0]).join(', ');
			} else {
				error = err.message || $t('profile.alerts.update_failed');
			}
		} finally {
			loading = false;
		}
	}

	async function handlePictureUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file || !user) return;

		const formData = new FormData();
		formData.append('profile_picture', file);

		try {
			loading = true;
			error = '';
			const res = await fetchApi(`/users/${user.id}/picture`, {
				method: 'POST',
				body: formData
			});
			profile_picture_url = res.profile_picture_url;
			auth.updateUser({ profile_picture_url });
			successMsg = $t('profile.alerts.picture_updated');
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || $t('profile.alerts.picture_failed');
		} finally {
			loading = false;
		}
	}

	async function handleResendVerification() {
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			const res = await fetchApi('/auth/resend-verification', { method: 'POST' });
			successMsg = res.message || $t('profile.alerts.verification_sent');
			setTimeout(() => (successMsg = ''), 5000);
		} catch (err: any) {
			error = err.message || $t('profile.alerts.verification_failed');
		} finally {
			loading = false;
		}
	}

	async function handleBuyTier(tier: string) {
		if (!user) return;
		loading = true;
		error = '';

		try {
			const item_key = tier === 'summer_pass' ? 'summer_pass' : 'premium_subscription';
			const res = await fetchApi('/stripe/create-checkout-session', {
				method: 'POST',
				body: JSON.stringify({ item_key })
			});
			if (res.url) {
				window.location.href = res.url;
			}
		} catch (err: any) {
			error = err.message || $t('profile.alerts.checkout_failed');
			loading = false;
		}
	}

	async function handleBuyUpgrade(type: string) {
		if (!user) return;
		loading = true;
		error = '';

		try {
			const item_key = `${type}_upgrade`; // e.g. video_upgrade
			const res = await fetchApi('/stripe/create-checkout-session', {
				method: 'POST',
				body: JSON.stringify({ item_key })
			});
			if (res.url) {
				window.location.href = res.url;
			}
		} catch (err: any) {
			error = err.message || $t('profile.alerts.checkout_failed');
			loading = false;
		}
	}

	async function handleInstructorUpdate(e: Event) {
		e.preventDefault();
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}/instructor-profile`, {
				method: 'PUT',
				body: JSON.stringify({ video_url, booking_link, available_today, allow_communications })
			});
			auth.updateUser({ video_url, booking_link, available_today, allow_communications });
			successMsg = $t('profile.alerts.instructor_updated');
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || $t('profile.alerts.update_failed');
		} finally {
			loading = false;
		}
	}

	async function handleBuyFeatured() {
		if (!user) return;
		loading = true;
		error = '';

		try {
			// First, check if there's already a featured instructor (we can hit the regular feature endpoint, or just attempt stripe and let it fail if not)
			// For simplicity, we just trigger checkout
			const res = await fetchApi('/stripe/create-checkout-session', {
				method: 'POST',
				body: JSON.stringify({ item_key: 'featured_instructor' })
			});
			if (res.url) {
				window.location.href = res.url;
			}
		} catch (err: any) {
			error = err.message || $t('profile.alerts.checkout_failed');
			loading = false;
		}
	}
</script>

<SEO title="My Profile" />

<div class="profile-dashboard">
	{#if user}
		<h1>My Profile</h1>
		<p class="subtitle">Update your personal information.</p>

		{#if user.role === 'instructor'}
			<div class="guide-banner">
				<div class="guide-banner-content">
					<span class="material-icons guide-icon">school</span>
					<div>
						<strong>{$t('profile.guide_banner_title')}</strong>
						<p>{$t('profile.guide_banner_desc')}</p>
					</div>
				</div>
				<Button variant="outlined" href="/instructor-guide" class="guide-btn">
					<Label>{$t('profile.guide_banner_btn')}</Label>
				</Button>
			</div>
		{/if}

		{#if user.is_verified === 0 || user.is_verified === false}
			<div class="verification-alert">
				<span class="material-icons info-icon">info</span>
				<div class="alert-content">
					<strong>Verify your email</strong>
					<p>Please check your inbox to verify your email address to unlock all features.</p>
				</div>
				<Button variant="outlined" onclick={handleResendVerification} disabled={loading} style="border-color: #E26D3F; color: #E26D3F;">
					<Label>Resend Email</Label>
				</Button>
			</div>
		{/if}

		{#if successMsg}
			<div class="success-msg">
				<span class="material-icons">check_circle</span>
				{successMsg}
			</div>
		{/if}

		{#if error}
			<div class="error-msg">
				<span class="material-icons">error</span>
				{error}
			</div>
		{/if}

		<div class="avatar-section">
			<div class="avatar-preview">
				{#if profile_picture_url}
					<img src={`http://127.0.0.1:5000${profile_picture_url}`} alt="Profile Avatar" loading="lazy" decoding="async" width="100" height="100" />
				{:else}
					<div class="avatar-placeholder">
						{username ? username.charAt(0).toUpperCase() : 'U'}
					</div>
				{/if}
				{#if user.is_verified === 1 || user.is_verified === true}
					<div class="verified-badge-profile" title="Verified User">
						<span class="material-icons" aria-hidden="true">verified</span>
					</div>
				{/if}
			</div>
			<div class="avatar-upload">
				<label for="picture-upload" class="upload-btn">
					Change Picture
					<input 
						id="picture-upload" 
						type="file" 
						accept="image/*" 
						onchange={handlePictureUpload} 
						disabled={loading}
					/>
				</label>
			</div>
		</div>

		{#if user.role === 'instructor'}


			<div class="tier-section">
				<h3>{$t('profile_enhancements.tier_title')}</h3>
				<p class="tier-desc">{$t('profile_enhancements.tier_desc')}</p>
				<p>
					<strong>{$t('profile_enhancements.current_tier')}</strong> 
					<span class="tier-badge {user.tier || 'basic'}">{$t('admin.' + (user.tier || 'basic'), { default: user.tier || 'Basic' })}</span>
				</p>
				
				<div class="tiers-grid">
					<!-- Summer Pass -->
					<div class="tier-card {user.tier === 'summer_pass' ? 'active-tier' : ''}">
						<h4>{$t('profile_enhancements.summer_pass')}</h4>
						<p class="price">{$formatPrice($pricings.summer_pass)}</p>
						<p class="desc">{$t('profile_enhancements.summer_pass_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('summer_pass')} disabled={loading || user.tier === 'summer_pass'} class="premium-button">
							<Label>{user.tier === 'summer_pass' ? 'Active' : $t('profile_enhancements.buy_summer_pass', { values: { price: $formatPrice($pricings.summer_pass) } })}</Label>
						</Button>
					</div>

					<!-- Monthly Premium -->
					<div class="tier-card {user.tier === 'premium' ? 'active-tier' : ''}">
						<h4>{$t('profile_enhancements.premium_monthly')}</h4>
						<p class="price">{$formatPrice($pricings.premium_subscription)}<span style="font-size: 1rem;">/mo</span></p>
						<p class="desc">{$t('profile_enhancements.premium_monthly_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('premium')} disabled={loading || user.tier === 'premium' || user.tier === 'summer_pass'} class="premium-button">
							<Label>
								{#if user.tier === 'premium'}
									Active
								{:else if user.tier === 'summer_pass'}
									Included in Pass
								{:else}
									{$t('profile_enhancements.subscribe', { values: { price: $formatPrice($pricings.premium_subscription) } })}
								{/if}
							</Label>
						</Button>
					</div>
				</div>
			</div>

			<div class="tier-section">
				<h3>{$t('profile_enhancements.title')}</h3>
				<p class="tier-desc">{$t('profile_enhancements.desc')}</p>
				
				<form class="enhancements-form" onsubmit={handleInstructorUpdate}>
					<!-- Intro Video Upgrade -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>{$t('profile_enhancements.intro_video')}</h4>
							<p class="desc">{$t('profile_enhancements.intro_video_desc')}</p>
						</div>
						{#if user.has_video_upgrade}
							<Textfield variant="outlined" bind:value={video_url} label={$t('profile_enhancements.video_url')} style="flex: 1;" />
						{:else}
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('video'); }} disabled={loading}>
								<Label>{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.video_upgrade) } })}</Label>
							</Button>
						{/if}
					</div>

					<!-- Booking Link Upgrade -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>{$t('profile_enhancements.personal_link')}</h4>
							<p class="desc">{$t('profile_enhancements.personal_link_desc')}</p>
						</div>
						{#if user.has_link_upgrade}
							<Textfield variant="outlined" bind:value={booking_link} label={$t('profile_enhancements.booking_url')} style="flex: 1;" />
						{:else}
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('link'); }} disabled={loading}>
								<Label>{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.link_upgrade) } })}</Label>
							</Button>
						{/if}
					</div>

					<!-- Available Today Badge -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>{$t('profile_enhancements.badge')}</h4>
							<p class="desc">{$t('profile_enhancements.badge_desc')}</p>
						</div>
						{#if user.has_badge_upgrade}
							<label style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
								<input type="checkbox" bind:checked={available_today} /> {$t('profile_enhancements.enable_badge')}
							</label>
						{:else}
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('badge'); }} disabled={loading}>
								<Label>{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.badge_upgrade) } })}</Label>
							</Button>
						{/if}
					</div>

					<!-- Allow Communications Toggle -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>Allow Direct Messages</h4>
							<p class="desc">Enable users to send you messages through your public profile.</p>
						</div>
						<label style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
							<input type="checkbox" bind:checked={allow_communications} /> Allow Messages
						</label>
					</div>

					<Button type="submit" variant="raised" disabled={loading} class="premium-button save-btn">
						<Label>{loading ? $t('profile_enhancements.saving') : $t('profile_enhancements.save')}</Label>
					</Button>
				</form>
			</div>

			<div class="tier-section">
				<h3>{$t('profile_enhancements.featured_title')}</h3>
				<p class="tier-desc">{$t('profile_enhancements.featured_desc')}</p>
				<div class="upgrade-row" style="border: 2px solid #FFD700; padding: 1.5rem; border-radius: 8px; background: var(--surface-color);">
					<div class="upgrade-info">
						<h4>{$t('profile_enhancements.homepage_spotlight')}</h4>
						{#if featured_instructor && featured_instructor !== 'full'}
							<p class="desc" style="color: #2e7d32; font-weight: bold;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">check_circle</span> {$t('profile_enhancements.currently_featured')}</p>
							<p class="desc">{$t('profile_enhancements.expires_on')}: {new Date(featured_instructor.featured_until).toLocaleDateString('en-GB')}</p>
						{:else if featured_instructor === 'full'}
							<p class="desc" style="color: #d32f2f;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">lock</span> All featured spots are currently taken.</p>
						{:else}
							<p class="desc">Available now! Secure your spot on the homepage for 7 days.</p>
						{/if}
					</div>
					<Button variant="raised" onclick={handleBuyFeatured} disabled={loading || !!featured_instructor} class="premium-button" style="background-color: {featured_instructor ? '#ccc' : '#FFD700'}; color: {featured_instructor ? '#666' : '#000'};">
						<Label>
							{#if featured_instructor && featured_instructor !== 'full'}
								Active until {new Date(featured_instructor.featured_until).toLocaleDateString('en-GB')}
							{:else if featured_instructor === 'full'}
								Currently Unavailable
							{:else}
								{$t('profile_enhancements.buy_featured', { values: { price: $formatPrice($pricings.featured_instructor) } })}
							{/if}
						</Label>
					</Button>
				</div>
			</div>


		{/if}

		<form onsubmit={handleUpdate} class="profile-form">
			<!-- Username is disabled -->
			<Textfield
				variant="outlined"
				bind:value={username}
				label="Username"
				disabled
				style="width: 100%;"
			/>

			<div class="form-row">
				<Textfield variant="outlined" bind:value={first_name} label="First Name" required input$pattern="[A-Za-z\s]+" input$title="Letters only" />
				<Textfield variant="outlined" bind:value={last_name} label="Last Name" required input$pattern="[A-Za-z\s]+" input$title="Letters only" />
			</div>

			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label="Email Address"
				required
				input$pattern={'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'}
				input$title="Please enter a valid email address with a domain (e.g. .com)"
				disabled
				style="width: 100%;"
			/>
			<Textfield
				variant="outlined"
				type="tel"
				bind:value={phone}
				label="Phone Number"
				input$pattern={'^6[0-9]{8}$'}
				input$title="Phone number must start with 6 and be exactly 9 digits long"
				style="width: 100%;"
			/>

			<Button type="submit" variant="raised" disabled={loading} class="premium-button save-btn">
				<Label>{loading ? 'Saving...' : 'Save Changes'}</Label>
			</Button>
		</form>

		<div class="tier-section" style="margin-top: 2rem;">
			<h3>Settings</h3>
			<div class="upgrade-row">
				<div class="upgrade-info">
					<h4>{$t('geolocation.toggle_label')}</h4>
					<p class="desc">{$t('geolocation.toggle_desc')}</p>
				</div>
				<label style="display: flex; align-items: center; gap: 0.5rem;">
					<input type="checkbox" bind:checked={$isGeolocationEnabled} aria-label={$t('geolocation.toggle_label')} />
				</label>
			</div>
		</div>
	{:else}
		<div class="loading">Loading profile...</div>
	{/if}
</div>

<style>
	.profile-dashboard {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		background: var(--surface-color);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}

	.guide-banner {
		background: linear-gradient(135deg, var(--primary-color-soft) 0%, var(--primary-color) 100%);
		color: white;
		padding: 1.5rem 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.guide-banner-content {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.guide-icon {
		font-size: 32px;
	}

	.guide-banner-content p {
		margin: 0.25rem 0 0 0;
		opacity: 0.9;
	}

	:global(.guide-btn) {
		color: white !important;
		border-color: rgba(255,255,255,0.5) !important;
		white-space: nowrap;
	}

	:global(.guide-btn:hover) {
		background-color: rgba(255,255,255,0.1) !important;
	}

	h1 {
		color: var(--terciary-color);
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #666;
		margin-bottom: 2rem;
	}
	.profile-form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	:global(.save-btn) {
		background-color: var(--primary-color) !important;
		margin-top: 1rem;
		align-self: flex-start;
	}
	.success-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #2e7d32;
		background: #e8f5e9;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}
	.error-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--mdc-theme-error);
		background: #ffebee;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}

	.verification-alert {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #fff3e0;
		border-left: 4px solid #ff9800;
		padding: 1rem 1.5rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}
	.verification-alert .info-icon {
		color: #ff9800;
		font-size: 24px;
	}
	.verification-alert .alert-content {
		flex: 1;
	}
	.verification-alert .alert-content strong {
		display: block;
		color: #e65100;
		margin-bottom: 0.25rem;
	}
	.verification-alert .alert-content p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.avatar-section {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.avatar-preview {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		
		background: #eee;
		position: relative;
	}
	.verified-badge-profile {
		position: absolute;
		bottom: 0;
		right: 0;
		background: var(--surface-color);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2196f3;
		padding: 2px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.verified-badge-profile .material-icons {
		font-size: 24px;
	}
	.avatar-preview img { border-radius: 50%; 
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar-placeholder { border-radius: 50%; 
		width: 100%;
		height: 100%;
		background-color: var(--secondary-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: bold;
	}
	.upload-btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #f0f0f0;
		color: #333;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: background 0.2s;
	}
	.upload-btn:hover {
		background: #e0e0e0;
	}
	.upload-btn input[type="file"] {
		display: none;
	}
	.tier-section {
		background: #f9f9f9;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border: 1px solid var(--border-color);
	}
	.tier-section h3 {
		margin-top: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.tier-desc {
		color: #666;
		margin-bottom: 1rem;
	}
	.tier-badge {
		text-transform: uppercase;
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: #e0e0e0;
		color: #555;
	}
	.tier-badge.premium {
		background: linear-gradient(135deg, #FFD700, #FDB931);
		color: #fff;
		text-shadow: 0 1px 2px rgba(0,0,0,0.2);
	}
	.tier-badge.summer_pass {
		background: linear-gradient(135deg, var(--secondary-color), #ff8a65);
		color: #fff;
		text-shadow: 0 1px 2px rgba(0,0,0,0.2);
	}
	.tiers-grid {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	.tier-card {
		flex: 1;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		background: var(--surface-color);
		display: flex;
		flex-direction: column;
	}
	.tier-card.active-tier {
		border: 2px solid var(--primary-color);
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.2);
		position: relative;
	}
	.tier-card h4 {
		margin-top: 0;
		color: var(--terciary-color);
		font-size: 1.25rem;
	}
	.tier-card .price {
		font-size: 2rem;
		font-weight: bold;
		color: var(--primary-color);
		margin: 1rem 0;
	}
	.tier-card .desc {
		font-size: 0.95rem;
		color: #666;
		margin-bottom: 1.5rem;
		flex-grow: 1;
	}
	.upgrade-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border-color);
		gap: 1rem;
	}
	.upgrade-row:last-of-type {
		border-bottom: none;
	}
	.upgrade-info h4 {
		margin: 0 0 0.25rem 0;
		color: var(--text-color);
	}
	.upgrade-info .desc {
		margin: 0;
		font-size: 0.85rem;
		color: #666;
	}
	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
		.pricing-options {
			flex-direction: column;
		}
	}

	/* Dark mode overrides */
	:global([data-theme="dark"]) .tier-section {
		background: rgba(255, 255, 255, 0.02);
	}
	:global([data-theme="dark"]) .tier-desc,
	:global([data-theme="dark"]) .tier-card .desc,
	:global([data-theme="dark"]) .upgrade-info .desc {
		color: #ccc;
	}
	:global([data-theme="dark"]) .upload-btn {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}
	:global([data-theme="dark"]) .upload-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}
	:global([data-theme="dark"]) .avatar-preview {
		background: #333;
	}
	:global([data-theme="dark"]) .verification-alert {
		background: rgba(255, 152, 0, 0.15);
	}
	:global([data-theme="dark"]) .verification-alert .alert-content p {
		color: #ddd;
	}
	:global([data-theme="dark"]) .tier-badge {
		background: rgba(255, 255, 255, 0.1);
		color: #ddd;
	}
	:global([data-theme="dark"]) .subtitle {
		color: #ccc;
	}
</style>
