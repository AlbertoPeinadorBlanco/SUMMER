<script lang="ts">
    import { page } from '$app/stores';
    import { t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/stores/auth';
    import { fetchApi } from '$lib/api';

    let bookingId = $page.params.booking_id;
    let rating = $state(0);
    let comment = $state('');
    let isSubmitting = $state(false);
    let errorMessage = $state('');
    let successMessage = $state('');
    let hoverRating = $state(0);

    onMount(() => {
        if (!$auth.isAuthenticated) {
            goto('/login?redirect=/rate/' + bookingId);
        }
    });

    async function submitRating() {
        if (rating === 0) {
            errorMessage = $t('ratings.select_rating');
            return;
        }

        isSubmitting = true;
        errorMessage = '';

        try {
            await fetchApi('/ratings', {
                method: 'POST',
                body: JSON.stringify({
                    booking_id: bookingId,
                    rating,
                    comment
                })
            });

            successMessage = $t('ratings.rating_submitted');
            setTimeout(() => {
                goto('/profile');
            }, 3000);

        } catch (error: any) {
            errorMessage = error.message;
        } finally {
            isSubmitting = false;
        }
    }

    function setRating(val: number) {
        rating = val;
    }
</script>

<svelte:head>
    <title>{$t('ratings.rate_instructor')} - Summer Marketplace</title>
</svelte:head>

<div class="rate-container">
    <div class="rate-card">
        <h1>{$t('ratings.rate_instructor')}</h1>
        
        {#if successMessage}
            <div class="alert success">
                <span class="material-icons">check_circle</span>
                {successMessage}
            </div>
        {:else}
            {#if errorMessage}
                <div class="alert error">
                    <span class="material-icons">error_outline</span>
                    {errorMessage}
                </div>
            {/if}

            <div class="stars-container" onmouseleave={() => hoverRating = 0} role="group" aria-label="Rating">
                {#each [1, 2, 3, 4, 5] as star}
                    <button 
                        class="star-btn"
                        class:active={star <= (hoverRating || rating)}
                        onmouseenter={() => hoverRating = star}
                        onclick={() => setRating(star)}
                        type="button"
                    >
                        <span class="material-icons">
                            {star <= (hoverRating || rating) ? 'star' : 'star_border'}
                        </span>
                    </button>
                {/each}
            </div>

            <div class="form-group">
                <label for="comment">{$t('ratings.leave_comment')}</label>
                <textarea 
                    id="comment" 
                    bind:value={comment} 
                    rows="4" 
                    placeholder="Tell us about your experience..."
                ></textarea>
            </div>

            <button 
                class="submit-btn" 
                onclick={submitRating} 
                disabled={isSubmitting || rating === 0}
            >
                {#if isSubmitting}
                    <span class="spinner"></span>
                {:else}
                    {$t('ratings.submit_review')}
                {/if}
            </button>
        {/if}
    </div>
</div>

<style>
    .rate-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 2rem 1rem;
        background: var(--bg-primary);
    }

    .rate-card {
        background: var(--bg-card);
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px var(--shadow-color);
        max-width: 500px;
        width: 100%;
        text-align: center;
        border: 1px solid var(--border-color);
    }

    h1 {
        font-size: 1.75rem;
        color: var(--text-primary);
        margin-bottom: 2rem;
        font-weight: 700;
    }

    .stars-container {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .star-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: #d1d5db;
        transition: transform 0.2s, color 0.2s;
    }

    .star-btn:hover {
        transform: scale(1.1);
    }

    .star-btn .material-icons {
        font-size: 3rem;
    }

    .star-btn.active {
        color: #fbbf24;
    }

    .form-group {
        margin-bottom: 2rem;
        text-align: left;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 0.95rem;
    }

    textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background: var(--bg-input);
        color: var(--text-primary);
        font-size: 1rem;
        resize: vertical;
        transition: all 0.3s ease;
    }

    textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px var(--primary-color-alpha);
    }

    .submit-btn {
        width: 100%;
        padding: 1rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--primary-color-alpha);
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .alert {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        font-weight: 500;
        text-align: left;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .alert.success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
