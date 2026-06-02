<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import { pricings } from '$lib/stores/pricings';
	import { auth } from '$lib/stores/auth';
	import { fetchApi, getMediaUrl } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
	import { isGeolocationEnabled } from '$lib/stores/location';
	import { formatPrice } from '$lib/stores/currency';
	import { showToast } from '$lib/stores/toast';
	import Dialog, { Title as DialogTitle, Content as DialogContent, Actions as DialogActions } from '@smui/dialog';
	import Icon from '@smui/textfield/icon';
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
	let bio = $state('');

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

            const urlParams = new URLSearchParams(window.location.search);
            const purchasedItem = urlParams.get('item');
            if (purchasedItem && user) {
				if (purchasedItem === 'premium_subscription') {
					auth.updateUser({ tier: 'premium' });
				} else if (purchasedItem === 'summer_pass') {
					auth.updateUser({ tier: 'summer_pass' });
				} else if (purchasedItem === 'video_upgrade') {
					auth.updateUser({ has_video_upgrade: true });
				} else if (purchasedItem === 'link_upgrade') {
					auth.updateUser({ has_link_upgrade: true });
				} else if (purchasedItem === 'badge_upgrade') {
					auth.updateUser({ has_badge_upgrade: true });
				}
            }

			// Clean up URL
			window.history.replaceState({}, document.title, window.location.pathname);
			await auth.restoreSession();

            // Poll the backend after 3 seconds in case the Stripe webhook was slightly delayed
            setTimeout(() => {
                auth.restoreSession();
                if (purchasedItem === 'featured_instructor') {
                    fetchApi('/users/featured').then(data => {
                        if (data && Array.isArray(data.featured)) {
                            featured_instructor = data.featured.find((f: any) => f.id === user?.id) || null;
                        }
                    }).catch(()=>{});
                }
            }, 3000);
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
			bio = user.bio || '';
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

	async function saveInstructorProfile() {
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}/instructor-profile`, {
				method: 'PUT',
				body: JSON.stringify({ video_url, booking_link, available_today, allow_communications, bio })
			});
			auth.updateUser({ video_url, booking_link, available_today, allow_communications, bio });
			successMsg = $t('profile.alerts.instructor_updated');
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || $t('profile.alerts.update_failed');
		} finally {
			loading = false;
		}
	}

	async function handleInstructorUpdate(e: Event) {
		e.preventDefault();
		await saveInstructorProfile();
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

	let isDeleteDialogOpen = $state(false);
	let isDeleting = $state(false);

	async function handleDeleteProfile() {
		isDeleting = true;
		try {
			const res = await fetchApi('/users/me', { method: 'DELETE' });
			if (res.error) throw new Error(res.error);
			showToast($t('profile.danger_zone.delete_success'), 'success');
			isDeleteDialogOpen = false;
			await auth.logout();
			goto('/');
		} catch (err: any) {
			showToast($t('profile.danger_zone.delete_error') + ': ' + err.message, 'error');
		} finally {
			isDeleting = false;
		}
	}

	// --- Security: Change Password ---
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let showCurrentPwd = $state(false);
	let showNewPwd = $state(false);
	let showConfirmPwd = $state(false);
	let passwordLoading = $state(false);
	let passwordError = $state('');
	let resetEmailLoading = $state(false);

	async function handleChangePassword(e: Event) {
		e.preventDefault();
		passwordError = '';
		if (newPassword !== confirmNewPassword) {
			passwordError = $t('security.password_mismatch');
			return;
		}
		passwordLoading = true;
		try {
			await fetchApi('/users/me/password', {
				method: 'PUT',
				body: JSON.stringify({ currentPassword, newPassword })
			});
			showToast($t('security.password_success'), 'success');
			currentPassword = '';
			newPassword = '';
			confirmNewPassword = '';
		} catch (err: any) {
			passwordError = err.message || $t('security.password_error');
		} finally {
			passwordLoading = false;
		}
	}

	async function handleSendResetEmail() {
		if (!user?.email) return;
		resetEmailLoading = true;
		try {
			await fetchApi('/users/forgot-password', {
				method: 'POST',
				body: JSON.stringify({ email: user.email })
			});
			showToast($t('security.reset_email_sent'), 'success');
		} catch (err: any) {
			showToast(err.message || $t('security.password_error'), 'error');
		} finally {
			resetEmailLoading = false;
		}
	}
</script>

<SEO title="My Profile" />

<div class="profile-dashboard">
	{#if user}
		<h1>{$t('profile.page_title')}</h1>
		<p class="subtitle">{$t('profile.page_subtitle')}</p>

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
					<img src={getMediaUrl(profile_picture_url)} alt="Profile Avatar" loading="lazy" decoding="async" width="100" height="100" />
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
					{$t('profile.change_picture')}
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
						<p class="price">{$formatPrice($pricings.summer_pass, true)}</p>
						<p class="desc">{$t('profile_enhancements.summer_pass_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('summer_pass')} disabled={loading || user.tier === 'summer_pass'} class="premium-button">
							<Label>{user.tier === 'summer_pass' ? $t('profile_enhancements.status_active') : $t('profile_enhancements.buy_summer_pass', { values: { price: $formatPrice($pricings.summer_pass, true) } })}</Label>
						</Button>
					</div>

					<!-- Monthly Premium -->
					<div class="tier-card {user.tier === 'premium' ? 'active-tier' : ''}">
						<h4>{$t('profile_enhancements.premium_monthly')}</h4>
						<p class="price">{$formatPrice($pricings.premium_subscription, true)}<span style="font-size: 1rem;">/mo</span></p>
						<p class="desc">{$t('profile_enhancements.premium_monthly_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('premium')} disabled={loading || user.tier === 'premium' || user.tier === 'summer_pass'} class="premium-button">
							<Label>
								{#if user.tier === 'premium'}
									{$t('profile_enhancements.status_active')}
								{:else if user.tier === 'summer_pass'}
									{$t('profile_enhancements.status_included')}
								{:else}
									{$t('profile_enhancements.subscribe', { values: { price: $formatPrice($pricings.premium_subscription, true) } })}
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
					<!-- Bio Upgrade (Available to all instructors by default) -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>{$t('profile_enhancements.biography', { default: 'Biography' })}</h4>
							<p class="desc">{$t('profile_enhancements.biography_desc', { default: 'Write a short bio about yourself and your surfing experience.' })}</p>
						</div>
						<Textfield variant="outlined" textarea bind:value={bio} label={$t('profile_enhancements.biography_label', { default: 'Your Bio' })} style="flex: 1;" input$rows={4} />
					</div>

					<!-- Intro Video Upgrade -->
					<div class="upgrade-row">
						<div class="upgrade-info">
							<h4>{$t('profile_enhancements.intro_video')}</h4>
							<p class="desc">{$t('profile_enhancements.intro_video_desc')}</p>
						</div>
						{#if user.has_video_upgrade}
							<Textfield variant="outlined" bind:value={video_url} label={$t('profile_enhancements.video_url')} style="flex: 1;" />
						{:else}
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('video'); }} disabled={loading || (user.tier !== 'premium' && user.tier !== 'summer_pass')}>
								<Label>
									{#if user.tier !== 'premium' && user.tier !== 'summer_pass'}
										{$t('profile_enhancements.requires_subscription')}
									{:else}
										{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.video_upgrade, true) } })}
									{/if}
								</Label>
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
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('link'); }} disabled={loading || (user.tier !== 'premium' && user.tier !== 'summer_pass')}>
								<Label>
									{#if user.tier !== 'premium' && user.tier !== 'summer_pass'}
										{$t('profile_enhancements.requires_subscription')}
									{:else}
										{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.link_upgrade, true) } })}
									{/if}
								</Label>
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
							<Button variant="outlined" onclick={(e: any) => { e.preventDefault(); handleBuyUpgrade('badge'); }} disabled={loading || (user.tier !== 'premium' && user.tier !== 'summer_pass')}>
								<Label>
									{#if user.tier !== 'premium' && user.tier !== 'summer_pass'}
										{$t('profile_enhancements.requires_subscription')}
									{:else}
										{$t('profile_enhancements.unlock', { values: { price: $formatPrice($pricings.badge_upgrade, true) } })}
									{/if}
								</Label>
							</Button>
						{/if}
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
							<p class="desc" style="color: #d32f2f;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">lock</span> {$t('profile_enhancements.featured_full')}</p>
						{:else}
							<p class="desc">{$t('profile_enhancements.featured_available')}</p>
						{/if}
					</div>
					<Button variant="raised" onclick={handleBuyFeatured} disabled={loading || !!featured_instructor || (user.tier !== 'premium' && user.tier !== 'summer_pass')} class="premium-button" style="background-color: {featured_instructor || (user.tier !== 'premium' && user.tier !== 'summer_pass') ? '#ccc' : '#FFD700'}; color: {featured_instructor || (user.tier !== 'premium' && user.tier !== 'summer_pass') ? '#666' : '#000'};">
						<Label>
							{#if featured_instructor && featured_instructor !== 'full'}
								{$t('profile_enhancements.active_until', { values: { date: new Date(featured_instructor.featured_until).toLocaleDateString('en-GB') } })}
							{:else if featured_instructor === 'full'}
								{$t('profile_enhancements.status_unavailable')}
							{:else if user.tier !== 'premium' && user.tier !== 'summer_pass'}
								{$t('profile_enhancements.requires_subscription')}
							{:else}
								{$t('profile_enhancements.buy_featured', { values: { price: $formatPrice($pricings.featured_instructor, true) } })}
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
				label={$t('profile.username_label')}
				disabled
				style="width: 100%;"
			/>

			<div class="form-row">
				<Textfield variant="outlined" bind:value={first_name} label={$t('profile.first_name_label')} required input$pattern="[A-Za-z\s]+" input$title={$t('profile.letters_only')} />
				<Textfield variant="outlined" bind:value={last_name} label={$t('profile.last_name_label')} required input$pattern="[A-Za-z\s]+" input$title={$t('profile.letters_only')} />
			</div>

			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label={$t('profile.email_label')}
				required
				input$pattern={'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'}
				input$title={$t('profile.email_format')}
				disabled
				style="width: 100%;"
			/>
			<Textfield
				variant="outlined"
				type="tel"
				bind:value={phone}
				label={$t('profile.phone_label')}
				input$pattern={'^6[0-9]{8}$'}
				input$title={$t('profile.phone_format')}
				style="width: 100%;"
			/>

			<Button type="submit" variant="raised" disabled={loading} class="premium-button save-btn">
				<Label>{loading ? $t('profile.saving') : $t('profile.save_changes')}</Label>
			</Button>
		</form>

		<div class="tier-section" style="margin-top: 2rem;">
			<h3>{$t('profile.settings')}</h3>
			<div class="upgrade-row">
				<div class="upgrade-info">
					<h4>{$t('geolocation.toggle_label')}</h4>
					<p class="desc">{$t('geolocation.toggle_desc')}</p>
				</div>
				<label style="display: flex; align-items: center; gap: 0.5rem;">
					<input type="checkbox" bind:checked={$isGeolocationEnabled} aria-label={$t('geolocation.toggle_label')} />
				</label>
			</div>
			{#if user.role === 'instructor'}
				<div class="upgrade-row">
					<div class="upgrade-info">
						<h4>{$t('profile.allow_messages_title')}</h4>
						<p class="desc">{$t('profile.allow_messages_desc')}</p>
					</div>
					<label style="display: flex; align-items: center; gap: 0.5rem;">
						<input type="checkbox" bind:checked={allow_communications} onchange={saveInstructorProfile} aria-label={$t('profile.allow_messages_label')} />
					</label>
				</div>
			{/if}
		</div>

		<div class="tier-section" style="margin-top: 2rem;">
			<h3><span class="material-icons" style="vertical-align: bottom; margin-right: 8px; color: var(--secondary-color);">lock</span>{$t('security.title')}</h3>

			<form onsubmit={handleChangePassword}>
				{#if passwordError}
					<div class="pw-error">{passwordError}</div>
				{/if}
				<div class="pw-grid">
					<Textfield
						variant="outlined"
						type={showCurrentPwd ? 'text' : 'password'}
						bind:value={currentPassword}
						label={$t('security.current_password')}
						required
						input$minlength={9}
						style="width: 100%;"
					>
						{#snippet trailingIcon()}
							<Icon class="material-icons" role="button" tabindex="0" onclick={() => showCurrentPwd = !showCurrentPwd} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showCurrentPwd = !showCurrentPwd)}>
								{showCurrentPwd ? 'visibility_off' : 'visibility'}
							</Icon>
						{/snippet}
					</Textfield>
					<Textfield
						variant="outlined"
						type={showNewPwd ? 'text' : 'password'}
						bind:value={newPassword}
						label={$t('security.new_password')}
						required
						input$minlength={9}
						input$pattern={"(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{9,}"}
						input$title="Password must contain at least 9 characters, including an uppercase letter, a lowercase letter, and a number"
						style="width: 100%;"
					>
						{#snippet trailingIcon()}
							<Icon class="material-icons" role="button" tabindex="0" onclick={() => showNewPwd = !showNewPwd} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showNewPwd = !showNewPwd)}>
								{showNewPwd ? 'visibility_off' : 'visibility'}
							</Icon>
						{/snippet}
					</Textfield>
					<Textfield
						variant="outlined"
						type={showConfirmPwd ? 'text' : 'password'}
						bind:value={confirmNewPassword}
						label={$t('security.confirm_new_password')}
						required
						input$minlength={9}
						style="width: 100%;"
					>
						{#snippet trailingIcon()}
							<Icon class="material-icons" role="button" tabindex="0" onclick={() => showConfirmPwd = !showConfirmPwd} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showConfirmPwd = !showConfirmPwd)}>
								{showConfirmPwd ? 'visibility_off' : 'visibility'}
							</Icon>
						{/snippet}
					</Textfield>
				</div>
				<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
					<Button variant="raised" type="submit" disabled={passwordLoading}>
						<Label>{passwordLoading ? $t('profile.saving') : $t('security.change_password')}</Label>
					</Button>
				</div>
			</form>

			<div class="upgrade-row" style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
				<div class="upgrade-info">
					<h4>{$t('security.send_reset_email')}</h4>
					<p class="desc">{$t('auth.forgot_password_desc')}</p>
				</div>
				<Button variant="outlined" onclick={handleSendResetEmail} disabled={resetEmailLoading}>
					<Label>{resetEmailLoading ? '...' : $t('auth.send_reset_email')}</Label>
				</Button>
			</div>
		</div>

		<div class="tier-section" style="margin-top: 2rem; border-color: #ffcdd2; background: #fff5f5;">
			<h3 style="color: #c62828;"><span class="material-icons" style="vertical-align: bottom; margin-right: 8px;">warning</span>{$t('profile.danger_zone.title')}</h3>
			<div class="upgrade-row">
				<div class="upgrade-info">
					<h4>{$t('profile.danger_zone.delete_profile')}</h4>
					<p class="desc">{$t('profile.danger_zone.delete_warning')}</p>
				</div>
				<Button variant="raised" onclick={(e: any) => { e.preventDefault(); isDeleteDialogOpen = true; }} style="background-color: var(--mdc-theme-error); color: white;">
					<Label>{$t('profile.danger_zone.delete_profile')}</Label>
				</Button>
			</div>
		</div>
	{:else}
		<div class="loading">Loading profile...</div>
	{/if}
</div>

<Dialog bind:open={isDeleteDialogOpen} aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-content">
	<DialogTitle id="delete-dialog-title" style="color: var(--mdc-theme-error); display: flex; align-items: center; gap: 8px;">
		<span class="material-icons">warning</span>
		{$t('profile.danger_zone.delete_profile')}
	</DialogTitle>
	<DialogContent id="delete-dialog-content">
		<p>{$t('profile.danger_zone.delete_warning')}</p>
	</DialogContent>
	<DialogActions>
		<Button variant="outlined" onclick={() => isDeleteDialogOpen = false} disabled={isDeleting}>
			<Label>{$t('profile.danger_zone.no')}</Label>
		</Button>
		<Button variant="raised" style="background-color: var(--mdc-theme-error); color: white;" onclick={handleDeleteProfile} disabled={isDeleting}>
			<Label>{isDeleting ? $t('profile.saving') : $t('profile.danger_zone.yes')}</Label>
		</Button>
	</DialogActions>
</Dialog>

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
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		background: var(--surface-color);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	.tier-card.active-tier {
		border: 2px solid var(--primary-color);
		box-shadow: 0 0 0 4px rgba(226, 109, 63, 0.15), 0 8px 24px rgba(226, 109, 63, 0.25);
		position: relative;
		transform: scale(1.02);
		z-index: 1;
		background: linear-gradient(180deg, rgba(226, 109, 63, 0.05) 0%, var(--surface-color) 100%);
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
		.tiers-grid {
			flex-direction: column;
		}
		.guide-banner, .guide-banner-content {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}
		.upgrade-row {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		.upgrade-info {
			text-align: center;
		}
		.avatar-section {
			flex-direction: column;
			text-align: center;
		}
		.verification-alert {
			flex-direction: column;
			text-align: center;
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
	.pw-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}
	.pw-error {
		color: var(--mdc-theme-error);
		background: #ffebee;
		padding: 0.6rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}
</style>
