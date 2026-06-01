<script lang="ts">
    import { toastMessage, toastType } from '$lib/stores/toast';
    import { fly, fade } from 'svelte/transition';
</script>

{#if $toastMessage}
    <div 
        class="toast toast-{$toastType}" 
        in:fly={{ y: -50, duration: 300 }} 
        out:fade
    >
        <span class="material-icons">
            {#if $toastType === 'error'}
                error
            {:else if $toastType === 'success'}
                check_circle
            {:else}
                info
            {/if}
        </span>
        <span class="message">{$toastMessage}</span>
    </div>
{/if}

<style>
    .toast {
        position: fixed;
        top: 80px; /* Below the top app bar */
        left: 50%;
        transform: translateX(-50%);
        padding: 1.25rem 2rem;
        border-radius: 12px;
        background: var(--surface-color, #fff);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        font-weight: 600;
        font-size: 1.1rem;
        min-width: 350px;
        max-width: 90vw;
    }
    .toast .material-icons {
        font-size: 1.75rem;
    }
    .toast-error {
        background: #fdecea;
        color: #d32f2f;
        border-left: 4px solid #d32f2f;
    }
    .toast-success {
        background: #e8f5e9;
        color: #2e7d32;
        border-left: 4px solid #2e7d32;
    }
    .toast-info {
        background: #e3f2fd;
        color: #1976d2;
        border-left: 4px solid #1976d2;
    }
    .message {
        flex: 1;
    }
</style>
