<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import { t } from 'svelte-i18n';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';

	let { open = $bindable(false) } = $props();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			// Send login request to the API
			const res = await fetchApi('/users/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});

			// Decode the JWT to get the user ID
			// Real app: use jwt-decode library, here we just do a simple base64 decode
			const base64Url = res.token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(function (c) {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					})
					.join('')
			);

			const payload = JSON.parse(jsonPayload);
			const userId = payload.user.id;

			// Set the token temporarily in localStorage so fetchApi can use it for the next request
			localStorage.setItem('auth_token', res.token);

			// Fetch the full user details to store in context
			const userDetails = await fetchApi(`/users/${userId}`);

			auth.login(res.token, userDetails);
			open = false;
		} catch (err: any) {
			error = err.message || 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<Dialog bind:open aria-labelledby="login-title" aria-describedby="login-content">
	<Title id="login-title">Login</Title>
	<Content id="login-content">
		{#if error}
			<div class="error-msg" role="alert">{error}</div>
		{/if}
		<form onsubmit={handleLogin} class="login-form">
			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label="Email"
				required
				input$autocomplete="username"
				style="width: 100%; margin-bottom: 1rem;"
			/>
			<Textfield
				variant="outlined"
				type="password"
				bind:value={password}
				label="Password"
				required
				input$autocomplete="current-password"
				style="width: 100%; margin-bottom: 1rem;"
			/>
			<div class="actions">
				<Button onclick={() => (open = false)} type="button">
					<Label>Cancel</Label>
				</Button>
				<Button variant="raised" type="submit" disabled={loading} class="premium-button">
					<Label>{loading ? 'Logging in...' : 'Login'}</Label>
				</Button>
			</div>
		</form>
		<div class="signup-prompt">
			<p>
				Don't have an account? <a href="/signup" onclick={() => (open = false)}>Sign up here</a>
			</p>
		</div>
	</Content>
</Dialog>

<style>
	.login-form {
		display: flex;
		flex-direction: column;
		margin-top: 1rem;
		min-width: 300px;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}
	.error-msg {
		color: var(--mdc-theme-error);
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}
	.signup-prompt {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.9rem;
	}
	.signup-prompt a {
		color: var(--primary-color);
		text-decoration: none;
		font-weight: bold;
	}
</style>
