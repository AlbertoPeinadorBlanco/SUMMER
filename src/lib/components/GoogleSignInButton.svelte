<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchApi } from '$lib/api';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let { onSuccess = () => {}, onError = (msg: string) => {} } = $props();

	let container: HTMLElement;

	onMount(() => {
		// Wait for Google SDK to load
		const initGoogle = () => {
			if ((window as any).google?.accounts?.id) {
				(window as any).google.accounts.id.initialize({
					// Use the real env variable when ready, or fallback placeholder
					client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-google-client-id',
					callback: handleCredentialResponse
				});
				(window as any).google.accounts.id.renderButton(container, {
					theme: 'outline',
					size: 'large',
					width: '100%'
				});
			} else {
				setTimeout(initGoogle, 100);
			}
		};
		initGoogle();
	});

	async function handleCredentialResponse(response: any) {
		try {
			const res = await fetchApi('/auth/google', {
				method: 'POST',
				body: JSON.stringify({ credential: response.credential })
			});
			
			// Success
			await auth.restoreSession();
			onSuccess();
		} catch (err: any) {
			console.error('Google Sign-In Error:', err);
			onError(err.message || 'Google Sign-In failed');
		}
	}
</script>

<div bind:this={container} class="google-btn-container"></div>

<style>
	.google-btn-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
</style>
