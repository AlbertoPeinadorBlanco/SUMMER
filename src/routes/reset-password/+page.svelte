<script lang="ts">
	import { t } from 'svelte-i18n';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import Button, { Label } from '@smui/button';
	import SEO from '$lib/components/SEO.svelte';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let token = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNew = $state(false);
	let showConfirm = $state(false);
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	onMount(() => {
		token = $page.url.searchParams.get('token') || '';
		if (!token) {
			error = 'Invalid or missing reset token.';
		}
	});

	async function handleReset(e: Event) {
		e.preventDefault();
		error = '';

		if (newPassword !== confirmPassword) {
			error = $t('security.password_mismatch');
			return;
		}

		loading = true;
		try {
			await fetchApi('/users/reset-password', {
				method: 'POST',
				body: JSON.stringify({ token, newPassword })
			});
			success = true;
			setTimeout(() => goto('/'), 3000);
		} catch (err: any) {
			error = err.message || $t('security.password_error');
		} finally {
			loading = false;
		}
	}
</script>

<SEO title={$t('auth.reset_password')} />

<div class="reset-container">
	<div class="reset-card">
		<div class="card-icon">
			<span class="material-icons">lock_reset</span>
		</div>
		<h1>{$t('auth.reset_password')}</h1>

		{#if success}
			<div class="success-msg">
				<span class="material-icons">check_circle</span>
				<div>
					<strong>{$t('security.password_success')}</strong>
					<p>Redirecting to the homepage...</p>
				</div>
			</div>
		{:else if error && !token}
			<div class="error-msg">
				<span class="material-icons">error</span>
				<p>{error}</p>
			</div>
			<Button variant="raised" onclick={() => goto('/')} style="margin-top: 1rem;">
				<Label>Go Home</Label>
			</Button>
		{:else}
			<p class="desc">{$t('auth.reset_password_desc')}</p>
			{#if error}
				<div class="error-msg">
					<span class="material-icons">error</span>
					<p>{error}</p>
				</div>
			{/if}
			<form onsubmit={handleReset} class="reset-form">
				<Textfield
					variant="outlined"
					type={showNew ? 'text' : 'password'}
					bind:value={newPassword}
					label={$t('security.new_password')}
					required
					input$minlength={9}
					style="width: 100%;"
				>
					{#snippet trailingIcon()}
						<Icon class="material-icons" role="button" tabindex="0" onclick={() => showNew = !showNew} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showNew = !showNew)}>
							{showNew ? 'visibility_off' : 'visibility'}
						</Icon>
					{/snippet}
				</Textfield>
				<Textfield
					variant="outlined"
					type={showConfirm ? 'text' : 'password'}
					bind:value={confirmPassword}
					label={$t('security.confirm_new_password')}
					required
					input$minlength={9}
					style="width: 100%;"
				>
					{#snippet trailingIcon()}
						<Icon class="material-icons" role="button" tabindex="0" onclick={() => showConfirm = !showConfirm} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showConfirm = !showConfirm)}>
							{showConfirm ? 'visibility_off' : 'visibility'}
						</Icon>
					{/snippet}
				</Textfield>
				<Button variant="raised" type="submit" disabled={loading} style="margin-top: 1.5rem;">
					<Label>{loading ? '...' : $t('auth.reset_password')}</Label>
				</Button>
			</form>
		{/if}
	</div>
</div>

<style>
	.reset-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	.reset-card {
		background: var(--surface-color);
		border-radius: 16px;
		padding: 3rem 2.5rem;
		box-shadow: 0 8px 32px rgba(0,0,0,0.08);
		width: 100%;
		max-width: 420px;
		text-align: center;
	}
	.card-icon {
		width: 64px;
		height: 64px;
		background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
	}
	.card-icon .material-icons {
		font-size: 2rem;
		color: white;
	}
	h1 {
		color: var(--terciary-color);
		font-size: 1.75rem;
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.desc {
		color: #666;
		font-size: 0.95rem;
		margin-bottom: 1.5rem;
	}
	.reset-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: left;
	}
	.error-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--mdc-theme-error);
		background: #ffebee;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		text-align: left;
	}
	.error-msg p { margin: 0; }
	.success-msg {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #2e7d32;
		background: #e8f5e9;
		padding: 1.25rem;
		border-radius: 8px;
		text-align: left;
	}
	.success-msg .material-icons { font-size: 2.5rem; }
	.success-msg p { margin: 0.25rem 0 0; font-size: 0.9rem; }
</style>
