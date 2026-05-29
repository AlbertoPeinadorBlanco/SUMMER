<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
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

	let loading = $state(false);
	let error = $state('');
	let successMsg = $state('');

	let featured_instructor: any = $state(null);

	onMount(async () => {
		try {
			const data = await fetchApi('/users/featured');
			if (data) {
				featured_instructor = data.featured;
			}
		} catch (e) {
			console.error('Failed to load featured instructor', e);
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
			successMsg = 'Profile updated successfully!';
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			if (err.errors && Array.isArray(err.errors)) {
				error = err.errors.map((e: any) => Object.values(e)[0]).join(', ');
			} else {
				error = err.message || 'Update failed';
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
			successMsg = 'Profile picture updated successfully!';
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to upload picture.';
		} finally {
			loading = false;
		}
	}

	async function handleBuyTier(tier: string) {
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}/upgrade`, {
				method: 'POST',
				body: JSON.stringify({ tier })
			});
			auth.updateUser({ tier });
			successMsg = `Successfully upgraded to ${tier === 'summer_pass' ? 'Summer Pass' : 'Premium'}!`;
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Upgrade failed';
		} finally {
			loading = false;
		}
	}

	async function handleBuyUpgrade(type: string) {
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}/upgrades/${type}`, {
				method: 'POST'
			});
			auth.updateUser({ [`has_${type}_upgrade`]: true });
			successMsg = `${type} upgrade unlocked!`;
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Upgrade failed';
		} finally {
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
				body: JSON.stringify({ video_url, booking_link, available_today })
			});
			auth.updateUser({ video_url, booking_link, available_today });
			successMsg = 'Instructor profile updated successfully!';
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Update failed';
		} finally {
			loading = false;
		}
	}

	async function handleBuyFeatured() {
		if (!user) return;
		loading = true;
		error = '';
		successMsg = '';

		try {
			await fetchApi(`/users/${user.id}/feature`, {
				method: 'POST'
			});
			successMsg = 'You are now the Featured Instructor of the Week!';
			
			// Refresh featured status
			const data = await fetchApi('/users/featured');
			if (data) {
				featured_instructor = data.featured;
			}
			
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to purchase featured spot';
		} finally {
			loading = false;
		}
	}
</script>

<SEO title="My Profile" />

<div class="profile-dashboard">
	{#if user}
		<h1>My Profile</h1>
		<p class="subtitle">Update your personal information.</p>

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
				<h3>Visibility Tier: <span class="tier-badge {user.tier === 'premium' ? 'premium' : ''}">{user.tier || 'basic'}</span></h3>
				{#if user.tier !== 'premium'}
					<p class="tier-desc">Choose a plan to pin your profile and classes to the top of the search results!</p>
					<div class="pricing-options">
						<div class="pricing-card">
							<h4>Premium Monthly</h4>
							<p class="price">€29/mo</p>
							<Button variant="outlined" onclick={() => handleBuyTier('premium')} disabled={loading}>
								<Label>{loading ? 'Upgrading...' : 'Subscribe Monthly'}</Label>
							</Button>
						</div>
						<div class="pricing-card highlight">
							<h4>Summer Pass</h4>
							<p class="price">€99 flat</p>
							<p class="desc">Valid June - September</p>
							<Button variant="raised" class="premium-button" onclick={() => handleBuyTier('summer_pass')} disabled={loading}>
								<Label>{loading ? 'Upgrading...' : 'Buy Summer Pass'}</Label>
							</Button>
						</div>
					</div>
				{/if}
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
								<Label>{$t('profile_enhancements.unlock_5')}</Label>
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
								<Label>{$t('profile_enhancements.unlock_5')}</Label>
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
								<Label>{$t('profile_enhancements.unlock_2')}</Label>
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
				<div class="upgrade-row" style="border: 2px solid #FFD700; padding: 1.5rem; border-radius: 8px; background: #fffcf0;">
					<div class="upgrade-info">
						<h4>{$t('profile_enhancements.homepage_spotlight')}</h4>
						{#if featured_instructor && featured_instructor.id === user.id}
							<p class="desc" style="color: #2e7d32; font-weight: bold;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">check_circle</span> {$t('profile_enhancements.currently_featured')}</p>
							<p class="desc">{$t('profile_enhancements.expires_on')}: {new Date(featured_instructor.featured_until).toLocaleDateString()}</p>
						{:else if featured_instructor}
							<p class="desc" style="color: #d32f2f;"><span class="material-icons" style="font-size: 16px; vertical-align: text-bottom;">lock</span> {$t('profile_enhancements.taken_until')} {new Date(featured_instructor.featured_until).toLocaleDateString()}</p>
						{:else}
							<p class="desc">Available now!</p>
						{/if}
					</div>
					<Button variant="raised" onclick={handleBuyFeatured} disabled={loading || (featured_instructor && featured_instructor.id !== user.id)} class="premium-button" style="background-color: #FFD700; color: #000;">
						<Label>{$t('profile_enhancements.buy_featured')}</Label>
					</Button>
				</div>
			</div>

			<div class="tier-section">
				<h3>{$t('profile_enhancements.tier_title')}</h3>
				<p class="tier-desc">{$t('profile_enhancements.tier_desc')}</p>
				<p><strong>{$t('profile_enhancements.current_tier')}</strong> {user.tier || 'basic'}</p>
				
				<div class="tiers-grid">
					<!-- Summer Pass -->
					<div class="tier-card {user.tier === 'summer_pass' ? 'active-tier' : ''}">
						<h4>{$t('profile_enhancements.summer_pass')}</h4>
						<p class="price">€99</p>
						<p class="desc">{$t('profile_enhancements.summer_pass_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('summer_pass')} disabled={loading || user.tier === 'summer_pass'} class="premium-button">
							<Label>{user.tier === 'summer_pass' ? 'Active' : $t('profile_enhancements.buy_summer_pass')}</Label>
						</Button>
					</div>

					<!-- Monthly Premium -->
					<div class="tier-card {user.tier === 'premium' ? 'active-tier' : ''}">
						<h4>{$t('profile_enhancements.premium_monthly')}</h4>
						<p class="price">€15<span style="font-size: 1rem;">/mo</span></p>
						<p class="desc">{$t('profile_enhancements.premium_monthly_desc')}</p>
						<Button variant="raised" onclick={() => handleBuyTier('premium')} disabled={loading || user.tier === 'premium'} class="premium-button">
							<Label>{user.tier === 'premium' ? 'Active' : $t('profile_enhancements.subscribe')}</Label>
						</Button>
					</div>
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
				disabled
				style="width: 100%;"
			/>
			<Textfield
				variant="outlined"
				type="tel"
				bind:value={phone}
				label="Phone Number"
				style="width: 100%;"
			/>

			<Button type="submit" variant="raised" disabled={loading} class="premium-button save-btn">
				<Label>{loading ? 'Saving...' : 'Save Changes'}</Label>
			</Button>
		</form>
	{:else}
		<div class="loading">Loading profile...</div>
	{/if}
</div>

<style>
	.profile-dashboard {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}
	h1 {
		color: var(--terciary-color);
		margin-top: 0;
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
	.avatar-section {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #eee;
	}
	.avatar-preview {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		overflow: hidden;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.avatar-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar-placeholder {
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
		border: 1px solid #eee;
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
	.pricing-options {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
	.pricing-card {
		flex: 1;
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
		background: white;
	}
	.pricing-card.highlight {
		border: 2px solid var(--primary-color);
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.2);
		position: relative;
	}
	.pricing-card h4 {
		margin-top: 0;
		color: var(--terciary-color);
	}
	.pricing-card .price {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--primary-color);
		margin: 0.5rem 0;
	}
	.pricing-card .desc {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 1rem;
	}
	.upgrade-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid #eee;
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
</style>
