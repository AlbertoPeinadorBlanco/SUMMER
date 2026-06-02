<script lang="ts">
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import { t } from 'svelte-i18n';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';

	let { open = $bindable(false) } = $props();

	// Views: 'login' | 'forgot'
	let view = $state<'login' | 'forgot'>('login');

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	// Forgot password
	let forgotEmail = $state('');
	let forgotLoading = $state(false);
	let forgotSuccess = $state('');
	let forgotError = $state('');

	function switchView(v: 'login' | 'forgot') {
		view = v;
		error = '';
		forgotError = '';
		forgotSuccess = '';
	}

	$effect(() => {
		if (!open) {
			// Reset when dialog closes
			view = 'login';
			email = '';
			password = '';
			error = '';
			forgotEmail = '';
			forgotSuccess = '';
			forgotError = '';
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await fetchApi('/users/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});

			await auth.restoreSession();
			open = false;
			goto('/profile');
		} catch (err: any) {
			if (err.message === 'Invalid credentials') {
				error = $t('auth.invalid_credentials');
			} else {
				error = err.message || 'Login failed';
			}
		} finally {
			loading = false;
		}
	}

	async function handleForgotPassword(e: Event) {
		e.preventDefault();
		forgotLoading = true;
		forgotError = '';
		forgotSuccess = '';

		try {
			await fetchApi('/users/forgot-password', {
				method: 'POST',
				body: JSON.stringify({ email: forgotEmail })
			});
			forgotSuccess = $t('security.reset_email_sent');
		} catch (err: any) {
			forgotError = err.message || 'Failed to send reset email';
		} finally {
			forgotLoading = false;
		}
	}
</script>

<Dialog bind:open aria-labelledby="login-title" aria-describedby="login-content">
	<Title id="login-title">
		{view === 'login' ? $t('auth.login_title') : $t('auth.forgot_password')}
	</Title>
	<Content id="login-content">
		{#if view === 'login'}
			{#if error}
				<div class="error-msg" role="alert">{error}</div>
			{/if}
			<form onsubmit={handleLogin} class="login-form">
				<Textfield
					variant="outlined"
					type="text"
					bind:value={email}
					label={$t('auth.email_or_username')}
					required
					input$autocomplete="username"
					style="width: 100%; margin-bottom: 1rem;"
				/>
				<Textfield
					variant="outlined"
					type={showPassword ? "text" : "password"}
					bind:value={password}
					label={$t('auth.password')}
					required
					input$minlength={9}
					input$autocomplete="current-password"
					style="width: 100%; margin-bottom: 0.5rem;"
				>
					{#snippet trailingIcon()}
						<Icon class="material-icons" role="button" tabindex="0" onclick={() => showPassword = !showPassword} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showPassword = !showPassword)}>
							{showPassword ? 'visibility_off' : 'visibility'}
						</Icon>
					{/snippet}
				</Textfield>
				<div class="forgot-link">
					<button type="button" onclick={() => switchView('forgot')}>{$t('auth.forgot_password')}</button>
				</div>
				<div class="actions">
					<Button onclick={() => (open = false)} type="button">
						<Label>{$t('auth.cancel')}</Label>
					</Button>
					<Button variant="raised" type="submit" disabled={loading} class="premium-button">
						<Label>{loading ? $t('auth.logging_in') : $t('auth.login_btn')}</Label>
					</Button>
				</div>
			</form>
			<div class="signup-prompt">
				<p>
					{$t('auth.no_account')} <a href="/signup" onclick={() => (open = false)}>{$t('auth.signup_here')}</a>
				</p>
			</div>
		{:else}
			{#if forgotSuccess}
				<div class="success-msg" role="alert">
					<span class="material-icons">check_circle</span>
					{forgotSuccess}
				</div>
				<div class="actions">
					<Button variant="raised" onclick={() => switchView('login')}>
						<Label>{$t('auth.back_to_login')}</Label>
					</Button>
				</div>
			{:else}
				<p class="forgot-desc">{$t('auth.forgot_password_desc')}</p>
				{#if forgotError}
					<div class="error-msg" role="alert">{forgotError}</div>
				{/if}
				<form onsubmit={handleForgotPassword} class="login-form">
					<Textfield
						variant="outlined"
						type="email"
						bind:value={forgotEmail}
						label={$t('auth.email')}
						required
						style="width: 100%; margin-bottom: 1rem;"
					/>
					<div class="actions">
						<Button type="button" onclick={() => switchView('login')}>
							<Label>{$t('auth.back_to_login')}</Label>
						</Button>
						<Button variant="raised" type="submit" disabled={forgotLoading}>
							<Label>{forgotLoading ? '...' : $t('auth.send_reset_email')}</Label>
						</Button>
					</div>
				</form>
			{/if}
		{/if}
	</Content>
</Dialog>

<style>
	.login-form {
		display: flex;
		flex-direction: column;
		margin-top: 0.5rem;
		min-width: 250px;
		padding-top: 16px; /* room for floating labels */
		overflow: visible;
	}
	/* Prevent the Dialog Content from clipping SMUI floating labels */
	:global(.mdc-dialog__content) {
		overflow: visible !important;
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
	.success-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #2e7d32;
		background: #e8f5e9;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}
	.forgot-link {
		text-align: right;
		margin-bottom: 0.5rem;
	}
	.forgot-link button {
		background: none;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0;
		text-decoration: underline;
	}
	.forgot-desc {
		color: #666;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		margin-bottom: 0;
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
