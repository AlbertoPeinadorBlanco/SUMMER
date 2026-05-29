<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import FormField from '@smui/form-field';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import SEO from '$lib/components/SEO.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let first_name = $state('');
	let last_name = $state('');
	let phone = $state('');
	let consent = $state(false);

	let role = $state('user');
	let bio = $state('');
	let specialization = $state('');

	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	async function handleSignup(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await fetchApi('/users/register', {
				method: 'POST',
				body: JSON.stringify({
					username,
					email,
					password,
					first_name,
					last_name,
					phone,
					role,
					bio,
					specialization
				})
			});
			// Server set httpOnly cookies — restore session and redirect
			await auth.restoreSession();
			success = true;
			setTimeout(() => {
				goto('/');
			}, 2000);
		} catch (err: any) {
			if (err.errors && Array.isArray(err.errors)) {
				error = err.errors.map((e: any) => Object.values(e)[0]).join(', ');
			} else {
				error = err.message || 'Signup failed. Username or email might be taken.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<SEO title="Sign Up" description="Create a new account on SurfMarket" />

<div class="signup-container">
	<h1>Create an Account</h1>

	{#if success}
		<div class="success-message">
			<span class="material-icons">check_circle</span>
			<p>Account created successfully! You can now log in.</p>
			<p>Redirecting to home...</p>
		</div>
	{:else}
		{#if error}
			<div class="error-msg">{error}</div>
		{/if}

		<form onsubmit={handleSignup} class="signup-form">
			<div class="role-selector">
				<label>
					<input type="radio" bind:group={role} value="user" />
					<span>Student</span>
				</label>
				<label>
					<input type="radio" bind:group={role} value="instructor" />
					<span>Instructor</span>
				</label>
			</div>

			<div class="form-row">
				<Textfield variant="outlined" bind:value={first_name} label="First Name" required input$pattern="[A-Za-z\s]+" input$title="Letters only" />
				<Textfield variant="outlined" bind:value={last_name} label="Last Name" required input$pattern="[A-Za-z\s]+" input$title="Letters only" />
			</div>

			<Textfield variant="outlined" bind:value={username} label="Username" required />
			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label="Email Address"
				required
			/>
			<Textfield variant="outlined" type="tel" bind:value={phone} label="Phone Number" />
			<Textfield
				variant="outlined"
				type="password"
				bind:value={password}
				label="Password (min 9 chars)"
				required
				input$minlength={9}
			/>

			{#if role === 'instructor'}
				<div class="instructor-fields">
					<h3>Instructor Details</h3>
					<Textfield
						variant="outlined"
						bind:value={specialization}
						label="Specialization (e.g. Longboard)"
						required
						style="width: 100%; margin-bottom: 1rem;"
					/>
					<Textfield
						textarea
						variant="outlined"
						bind:value={bio}
						label="Biography"
						required
						style="width: 100%;"
					/>
				</div>
			{/if}

			<div class="consent-field">
				<FormField>
					<Checkbox bind:checked={consent} required />
					<span slot="label">
						{$t('legal.agree_to')} <a href="/policies" target="_blank">{$t('legal.terms_of_service')}</a> 
						{$t('legal.and')} <a href="/policies" target="_blank">{$t('legal.privacy_policy')}</a>.
					</span>
				</FormField>
			</div>

			<Button type="submit" variant="raised" disabled={loading || !consent} class="premium-button submit-btn">
				<Label>{loading ? 'Creating...' : 'Sign Up'}</Label>
			</Button>
		</form>

		<p class="login-prompt">Already have an account? Use the Login button in the menu.</p>
	{/if}
</div>

<style>
	.signup-container {
		max-width: 500px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}
	h1 {
		color: var(--terciary-color);
		text-align: center;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}
	.signup-form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.role-selector {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: var(--background-color);
		border-radius: 8px;
	}
	.role-selector label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: 600;
		color: var(--terciary-color);
	}
	.instructor-fields {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-top: 0.5rem;
	}
	.instructor-fields h3 {
		margin-top: 0;
		color: var(--secondary-color);
		font-size: 1.1rem;
	}
	.consent-field {
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}
	.consent-field a {
		color: var(--secondary-color);
		text-decoration: underline;
	}
	:global(.submit-btn) {
		background-color: var(--secondary-color) !important;
		margin-top: 1rem;
		padding: 1.5rem !important;
	}
	.error-msg {
		color: var(--mdc-theme-error);
		background: #ffebee;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		text-align: center;
	}
	.success-message {
		text-align: center;
		color: #2e7d32;
		padding: 2rem;
	}
	.success-message .material-icons {
		font-size: 4rem;
		margin-bottom: 1rem;
	}
	.login-prompt {
		text-align: center;
		margin-top: 1.5rem;
		color: #666;
		font-size: 0.9rem;
	}
	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
