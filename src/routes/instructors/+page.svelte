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
			style="width: 100%; max-width: 600px; background: white;"
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
				<a href="/marketplace/{instructor.id}" class="instructor-card premium-card {isFeatured(instructor) ? 'is-featured' : ''}">
					<div class="card-content">
						<div class="avatar-container">
							{#if instructor.profile_picture_url}
								<img src={`http://127.0.0.1:5000${instructor.profile_picture_url}`} alt="{instructor.first_name}" class="avatar-img" loading="lazy" decoding="async" width="80" height="80" />
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
							{#if isFeatured(instructor)}
								<span class="perk-badge featured-badge">
									<span class="material-icons">star</span>
									{$t('profile_enhancements.currently_featured')}
								</span>
							{/if}
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
							{instructor.bio ? (instructor.bio.length > 100 ? instructor.bio.substring(0, 100) + '...' : instructor.bio) : ''}
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
		background-color: white;
		padding: 3rem 1rem 2rem;
		border-bottom: 1px solid #eaeaea;
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
		background: white;
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid #eee;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.instructor-card.is-featured {
		border: 2px solid #FFD700;
		box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
	}

	.perk-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
		margin: 0.75rem 0;
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

	.featured-badge {
		background: linear-gradient(135deg, #FFD700, #FFA500);
		color: #5a3a00;
		box-shadow: 0 2px 6px rgba(255, 165, 0, 0.4);
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
