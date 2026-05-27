<script lang="ts">
	import Card, { Content, PrimaryAction, Media, Actions, ActionButtons } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import { t, locale } from 'svelte-i18n';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();

	let searchQuery = $state('');

	let filteredClasses = $derived(
		(data.classes || []).filter((c: any) => {
			const instructorName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.instructor_username || '';
			const displayTitle = ($locale === 'es' && c.title_es) ? c.title_es : c.title;
			return (
				displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
				instructorName.toLowerCase().includes(searchQuery.toLowerCase())
			);
		})
	);
	
	function getTitle(ad: any) {
		const t = ($locale === 'es' && ad.title_es) ? ad.title_es : ad.title;
		return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
	}
</script>

<SEO title={$t('marketplace.title')} description={$t('marketplace.subtitle')} />

<div class="marketplace-header">
	<h1 id="marketplace-title">{$t('marketplace.title')}</h1>
	<p>{$t('marketplace.subtitle')}</p>

	<div class="search-bar" role="search">
		<Textfield
			variant="outlined"
			bind:value={searchQuery}
			label={$t('marketplace.search_placeholder')}
			style="width: 100%; max-width: 600px; background: white; border-radius: 4px;"
			input$aria-label="Search classes"
		>
			{#snippet leadingIcon()}
				<Icon class="material-icons" aria-hidden="true">search</Icon>
			{/snippet}
		</Textfield>
	</div>
</div>

<div class="teacher-grid" role="list" aria-labelledby="marketplace-title">
	{#each filteredClasses as ad (ad.id)}
		<article class="card-container premium-card" role="listitem">
			<Card>
				<PrimaryAction href="/marketplace/{ad.instructor_id}" aria-label="Class {ad.title}">
					<Media
						class="card-media"
						style="background-image: url({ad.image_url ? `http://localhost:5000${ad.image_url}` : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #f4f8fa;"
						aspectRatio="16x9"
						aria-label="Photo of {ad.title}"
					/>
					<Content class="mdc-typography--body2" style="padding: 1.5rem;">
						<div class="ad-header">
							<h2 class="mdc-typography--headline6" style="margin: 0; color: var(--text-color);">
								{getTitle(ad)}
							</h2>
							<span class="badge {ad.class_type}">{ad.class_type}</span>
						</div>

						<div class="instructor-info">
							<img src={ad.profile_picture_url ? `http://localhost:5000${ad.profile_picture_url}` : 'https://ui-avatars.com/api/?name=' + (ad.first_name || ad.instructor_username) + '&background=random'} alt="Instructor" class="instructor-avatar" />
							<div class="instructor-text">
								<span class="instructor-name">{ad.first_name || ad.instructor_username}</span>
								<div class="instructor-contact">
									{#if ad.phone}
										<span title="Phone">📞 {ad.phone}</span>
									{/if}
									{#if ad.email}
										<span title="Email">✉️ {ad.email}</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="teacher-details">
							<span
								><span
									class="material-icons"
									aria-hidden="true"
									style="font-size: 1rem; vertical-align: middle;">place</span
								>
								{ad.location || 'Anywhere'}</span
							>
							<span class="price">{$formatPrice(ad.price)}</span>
						</div>
					</Content>
				</PrimaryAction>
				<Actions style="padding: 0 1.5rem 1.5rem 1.5rem;">
					<ActionButtons>
						<Button variant="raised" class="premium-button book-btn">
							<Label>{$t('marketplace.book_btn')}</Label>
						</Button>
						<Button href="/marketplace/{ad.instructor_id}" class="premium-button">
							<Label>{$t('marketplace.profile_btn')}</Label>
						</Button>
					</ActionButtons>
				</Actions>
			</Card>
		</article>
	{:else}
		<div class="no-results" role="status" aria-live="polite">
			<span class="material-icons" aria-hidden="true" style="font-size: 4rem; color: #ccc;"
				>search_off</span
			>
			<h3>{$t('marketplace.no_results_title')}</h3>
			<p>{$t('marketplace.no_results_desc')}</p>
		</div>
	{/each}
</div>

<style>
	.marketplace-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.marketplace-header h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin-bottom: 0.5rem;
	}

	.marketplace-header p {
		color: #666;
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	.search-bar {
		display: flex;
		justify-content: center;
		padding: 0 1rem;
	}

	.teacher-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
		padding: 1rem 0;
	}

	:global(.card-container) {
		height: 100%;
	}

	.ad-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.instructor-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.instructor-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.instructor-text {
		display: flex;
		flex-direction: column;
	}

	.instructor-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text-color);
	}

	.instructor-contact {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		font-size: 0.75rem;
		color: #666;
		margin-top: 0.2rem;
	}

	.teacher-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		color: #666;
	}

	.price {
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--primary-color);
	}

	.badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		font-weight: bold;
	}
	.badge.course {
		background: #e3f2fd;
		color: #1565c0;
	}
	.badge.class {
		background: #fff3e0;
		color: #e65100;
	}

	:global(.book-btn) {
		background-color: var(--secondary-color) !important;
	}

	.no-results {
		grid-column: 1 / -1;
		text-align: center;
		padding: 4rem 1rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.no-results h3 {
		color: var(--terciary-color);
		margin: 1rem 0 0.5rem;
	}

	.no-results p {
		color: #666;
		margin: 0;
	}
</style>
