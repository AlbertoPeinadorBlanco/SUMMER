<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fetchApi } from '$lib/api';
    import { goto } from '$app/navigation';
    import Button, { Label } from '@smui/button';
    import CircularProgress from '@smui/circular-progress';
    import SEO from '$lib/components/SEO.svelte';

    let loading = $state(true);
    let success = $state(false);
    let message = $state('');

    onMount(async () => {
        const token = $page.url.searchParams.get('token');
        if (!token) {
            loading = false;
            success = false;
            message = 'Verification token is missing from the URL.';
            return;
        }

        try {
            const response = await fetchApi('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ token })
            });
            success = true;
            message = response.message || 'Email successfully verified!';
        } catch (err: any) {
            success = false;
            message = err.message || 'Failed to verify email. The link might be invalid or expired.';
        } finally {
            loading = false;
        }
    });
</script>

<SEO title="Verify Email" />

<div class="verify-container">
    <div class="verify-card">
        {#if loading}
            <CircularProgress style="width: 48px; height: 48px;" indeterminate />
            <h2>Verifying...</h2>
            <p>Please wait while we verify your email address.</p>
        {:else if success}
            <div class="icon-circle success">
                <span class="material-icons" aria-hidden="true" style="font-size: 48px;">check</span>
            </div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <Button variant="raised" class="premium-button" onclick={() => goto('/profile')} style="margin-top: 1rem;">
                <Label>Go to Profile</Label>
            </Button>
        {:else}
            <div class="icon-circle error">
                <span class="material-icons" aria-hidden="true" style="font-size: 48px;">error_outline</span>
            </div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <Button variant="raised" class="premium-button" onclick={() => goto('/profile')} style="margin-top: 1rem;">
                <Label>Return to Profile</Label>
            </Button>
        {/if}
    </div>
</div>

<style>
    .verify-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem;
    }

    .verify-card {
        background: var(--surface-color);
        border-radius: 12px;
        padding: 3rem 2rem;
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(226, 109, 63, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .verify-card h2 {
        color: var(--terciary-color);
        margin: 0;
    }

    .verify-card p {
        color: #666;
        margin: 0;
        line-height: 1.5;
    }

    .icon-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .icon-circle.success {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .icon-circle.error {
        background: #ffebee;
        color: #c62828;
    }
</style>
