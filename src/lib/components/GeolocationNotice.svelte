<script lang="ts">
    import { t } from 'svelte-i18n';
    import { isGeolocationEnabled } from '$lib/stores/location';
    import { browser } from '$app/environment';
    import Button from '@smui/button';
    import { onMount } from 'svelte';

    let showNotice = false;

    onMount(() => {
        if (browser && $isGeolocationEnabled) {
            const hasSeen = localStorage.getItem('hasSeenGeolocationNotice');
            if (!hasSeen) {
                showNotice = true;
            }
        }
    });

    function dismiss() {
        showNotice = false;
        if (browser) {
            localStorage.setItem('hasSeenGeolocationNotice', 'true');
        }
    }
</script>

{#if showNotice}
    <div class="geo-notice">
        <span class="material-icons info-icon">info</span>
        <div class="message">
            {$t('geolocation.active_toast')}
        </div>
        <Button onclick={dismiss} class="dismiss-btn">
            OK
        </Button>
    </div>
{/if}

<style>
    .geo-notice {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--surface-color);
        color: var(--text-color);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        border-left: 4px solid var(--primary-color);
        max-width: 90%;
        width: max-content;
    }

    .info-icon {
        color: var(--primary-color);
        font-size: 1.5rem;
    }

    .message {
        font-size: 0.9rem;
        flex: 1;
    }

    :global(.dismiss-btn) {
        min-width: unset !important;
        padding: 0 8px !important;
    }
</style>
