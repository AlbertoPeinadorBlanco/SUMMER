<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import BannerAd from '$lib/components/BannerAd.svelte';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';

	import { fetchApi } from '$lib/api';

	let instructors: any[] = $state([]);
	let filteredInstructors: any[] = $state([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let defaultBio = $derived($t('home.default_bio'));

	function truncateWords(text: string, limit: number = 50) {
		if (!text) return '';
		const words = text.split(/\s+/);
		if (words.length > limit) {
			return words.slice(0, limit).join(' ') + '...';
		}
		return text;
	}

	onMount(async () => {
		try {
			const data = await fetchApi('/users?role=instructor');
			if (data && !data.error) {
				// Sort: featured first, then premium, then the rest
				instructors = data.sort((a: any, b: any) => {
					const aFeatured = a.featured_until && new Date(a.featured_until) > new Date() ? 1 : 0;
					const bFeatured = b.featured_until && new Date(b.featured_until) > new Date() ? 1 : 0;
					if (bFeatured !== aFeatured) return bFeatured - aFeatured;
					const aPremium = (a.tier === 'premium' || a.tier === 'summer_pass') ? 1 : 0;
					const bPremium = (b.tier === 'premium' || b.tier === 'summer_pass') ? 1 : 0;
					return bPremium - aPremium;
				});
				filteredInstructors = instructors;
			}
		} catch (error) {
			console.error('Error fetching instructors:', error);
		} finally {
			loading = false;
		}
	});

	function isFeatured(instructor: any) {
		return instructor.featured_until && new Date(instructor.featured_until) > new Date();
	}

	$effect(() => {
		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			filteredInstructors = instructors.filter((instructor) => {
				const fullName = `${instructor.first_name} ${instructor.last_name}`.toLowerCase();
				const spec = (instructor.specialization || '').toLowerCase();
				return fullName.includes(lowerQuery) || spec.includes(lowerQuery);
			});
		} else {
			filteredInstructors = instructors;
		}
	});
</script>

<SEO title={$t('instructors.title')} description={$t('instructors.subtitle')} />

<BannerAd placement="instructors_top" />

<div class="instructors-header">
	<div class="header-content">
		<h1>{$t('instructors.title')}</h1>
		<p class="subtitle">{$t('instructors.subtitle')}</p>
	</div>

	<div class="search-bar" role="search">
		<Textfield
			variant="outlined"
			bind:value={searchQuery}
			label={$t('instructors.search_placeholder')}
			style="width: 100%; max-width: 600px; background: var(--surface-color);"
		>
			{#snippet leadingIcon()}
				<Icon class="material-icons" aria-hidden="true">search</Icon>
			{/snippet}
		</Textfield>
	</div>
</div>

<div class="instructors-container">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
		</div>
	{:else if filteredInstructors.length === 0}
		<div class="empty-state">
			<span class="material-icons empty-icon" aria-hidden="true">group_off</span>
			<p>{$t('instructors.no_results')}</p>
		</div>
	{:else}
		<div class="instructor-grid">
			{#each filteredInstructors as instructor}
				<a href="/marketplace/{instructor.id}" class="instructor-card premium-card {isFeatured(instructor) ? 'is-featured' : ''}" style="position: relative;">
					{#if isFeatured(instructor)}
						<div class="featured-star-badge" title={$t('profile_enhancements.public_featured')}>
							<span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span>
						</div>
					{/if}
					<div class="card-content">
						<div class="avatar-container">
							{#if instructor.profile_picture_url}
								<img src={`http://localhost:5000${instructor.profile_picture_url}`} alt="{instructor.first_name}" class="avatar-img" loading="lazy" decoding="async" width="80" height="80" />
							{:else}
								<span class="material-icons avatar-placeholder" aria-hidden="true">person</span>
							{/if}
						</div>
						
						<h2 class="instructor-name">{instructor.first_name} {instructor.last_name}</h2>
						
						{#if instructor.specialization}
							<span class="specialization-badge">{instructor.specialization}</span>
						{/if}

						<!-- Perk badges -->
						<div class="perk-badges">
							{#if instructor.tier === 'premium' || instructor.tier === 'summer_pass'}
								<span class="perk-badge premium-badge">
									<span class="material-icons">workspace_premium</span>
									Premium
								</span>
							{/if}
							{#if instructor.available_today && instructor.has_badge_upgrade}
								<span class="perk-badge available-badge">
									<span class="material-icons">event_available</span>
									{$t('marketplace.available_today')}
								</span>
							{/if}
							{#if instructor.has_video_upgrade}
								<span class="perk-badge upgrade-badge">
									<span class="material-icons">videocam</span>
									Video
								</span>
							{/if}
							{#if instructor.has_link_upgrade}
								<span class="perk-badge upgrade-badge">
									<span class="material-icons">link</span>
									Online Booking
								</span>
							{/if}
						</div>

						<p class="instructor-bio">
							{truncateWords(typeof instructor.bio === 'string' && instructor.bio.trim() ? instructor.bio : defaultBio, 50)}
						</p>
					</div>
					<div class="card-footer">
						<span class="view-profile-link">
							{$t('instructors.view_profile')} <span class="material-icons" aria-hidden="true">arrow_forward</span>
						</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.instructors-header {
		background-color: var(--surface-color);
		padding: 3rem 1rem 2rem;
		border-bottom: 1px solid var(--border-color);
		text-align: center;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto 2rem;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.search-bar {
		display: flex;
		justify-content: center;
		padding: 0 1rem;
	}

	.instructors-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1rem;
	}

	.instructor-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 2rem;
	}

	.instructor-card {
		background: var(--surface-color);
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.instructor-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 25px rgba(226, 109, 63, 0.15);
	}

	.instructor-card.is-featured {
		border: 2px solid #FFD700;
		box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
	}

	.card-content {
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-grow: 1;
		text-align: center;
	}

	.avatar-container {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		overflow: hidden;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		border: 4px solid white;
		box-shadow: 0 4px 10px rgba(0,0,0,0.1);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		font-size: 50px;
		color: #ccc;
	}

	.instructor-name {
		font-size: 1.4rem;
		color: var(--terciary-color);
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.specialization-badge {
		font-size: 0.85rem;
		color: var(--primary-color);
		background-color: var(--primary-color-soft);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.instructor-bio {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.5;
		margin: 1rem 0 0 0;
	}

	.perk-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
		margin: 0.5rem 0 1rem 0;
	}

	.perk-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 3px 10px;
		border-radius: 20px;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.perk-badge .material-icons {
		font-size: 12px;
	}

	.featured-star-badge {
		position: absolute;
		top: -12px;
		right: -12px;
		background: linear-gradient(135deg, #FFD700, #FDB931);
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
		z-index: 10;
	}

	.premium-badge {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.available-badge {
		background: #e8f5e9;
		color: #2e7d32;
		border: 1px solid #a5d6a7;
	}

	.upgrade-badge {
		background: #e3f2fd;
		color: #1565c0;
		border: 1px solid #90caf9;
	}

	.card-footer {
		background-color: #fafafa;
		padding: 1rem;
		border-top: 1px solid var(--border-color);
		text-align: center;
		border-bottom-left-radius: 11px;
		border-bottom-right-radius: 11px;
	}

	:global([data-theme="dark"]) .card-footer {
		background-color: var(--primary-color-soft);
	}

	.view-profile-link {
		color: var(--primary-color);
		font-weight: bold;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		transition: color 0.2s ease;
	}

	.instructor-card:hover .view-profile-link {
		color: var(--secondary-color);
	}

	.view-profile-link .material-icons {
		font-size: 1.1rem;
	}

	.loading-state, .empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: #888;
	}

	.empty-icon {
		font-size: 4rem;
		opacity: 0.5;
		margin-bottom: 1rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid var(--primary-color-soft);
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
