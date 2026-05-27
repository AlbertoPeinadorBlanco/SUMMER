<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';

	let user = $derived($auth.user);
	let isAuthenticated = $derived($auth.isAuthenticated);

	let email = $state('');
	let first_name = $state('');
	let last_name = $state('');
	let phone = $state('');
	let username = $state('');
	let profile_picture_url = $state('');

	let loading = $state(false);
	let error = $state('');
	let successMsg = $state('');

	// Svelte 5 rune to sync auth user data to local form state once authenticated
	$effect(() => {
		if (user) {
			email = user.email || '';
			first_name = user.first_name || '';
			last_name = user.last_name || '';
			phone = user.phone || '';
			username = user.username || '';
			profile_picture_url = user.profile_picture_url || '';
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
					email,
					first_name,
					last_name,
					phone
				})
			});

			// Update local auth store so layout / other components reflect new name
			auth.updateUser({ email, first_name, last_name, phone });
			successMsg = 'Profile updated successfully!';
			setTimeout(() => (successMsg = ''), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to update profile.';
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
					<img src={`http://localhost:5000${profile_picture_url}`} alt="Profile Avatar" />
				{:else}
					<div class="avatar-placeholder">
						<span class="material-icons">person</span>
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
				<Textfield variant="outlined" bind:value={first_name} label="First Name" required />
				<Textfield variant="outlined" bind:value={last_name} label="Last Name" required />
			</div>

			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label="Email Address"
				required
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
	.avatar-placeholder .material-icons {
		font-size: 3rem;
		color: #bdbdbd;
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
	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
