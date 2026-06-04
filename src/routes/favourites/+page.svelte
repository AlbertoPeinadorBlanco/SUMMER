<script lang="ts">
	import { t } from 'svelte-i18n';
	import { auth } from '$lib/stores/auth';
	import { fetchApi, getMediaUrl } from '$lib/api';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';
	import Card, { Content, PrimaryAction, Media } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import Tab, { Label as TabLabel } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import IconButton from '@smui/icon-button';
	import { showToast } from '$lib/stores/toast';

	let activeTab = $state('classes');
	let classes = $state<any[]>([]);
	let instructors = $state<any[]>([]);
	let loading = $state(true);

	$effect(() => {
		if ($auth.isAuthenticated) {
			loadFavourites();
		}
	});

	async function loadFavourites() {
		loading = true;
		try {
			classes = await fetchApi('/favourites/classes');
			instructors = await fetchApi('/favourites/instructors');
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function toggleFavClass(id: number, event: Event) {
		event.stopPropagation();
		try {
			const res = await fetchApi(`/favourites/classes/${id}`, { method: 'POST' });
			if (!res.is_favourited) {
				classes = classes.filter(c => c.id !== id);
			}
			showToast(res.message, 'success');
		} catch (err: any) {
			showToast(err.message || 'Error', 'error');
		}
	}

	async function toggleFavInstructor(id: number, event: Event) {
		event.stopPropagation();
		try {
			const res = await fetchApi(`/favourites/instructors/${id}`, { method: 'POST' });
			if (!res.is_favourited) {
				instructors = instructors.filter(i => i.id !== id);
			}
			showToast(res.message, 'success');
		} catch (err: any) {
			showToast(err.message || 'Error', 'error');
		}
	}

	function getTitle(ad: any) {
		return ad.title || 'Untitled';
	}
</script>

<SEO title="{$t('favourites.title')} - SurfMarket" description="Your favourite classes and instructors." />

<div class="favourites-page">
	<div class="hero-section">
		<h1>{$t('favourites.title', { default: 'My Favourites' })}</h1>
	</div>

	<div class="tabs-container">
		<TabBar tabs={['classes', 'instructors']} bind:active={activeTab}>
			{#snippet tab(tab)}
				<Tab {tab}>
					<TabLabel>{tab === 'classes' ? $t('favourites.tab_classes', { default: 'Classes' }) : $t('favourites.tab_instructors', { default: 'Instructors' })}</TabLabel>
				</Tab>
			{/snippet}
		</TabBar>
	</div>

	<div class="content-section">
		{#if loading}
			<p>{$t('manageAds.loading', { default: 'Loading...' })}</p>
		{:else if activeTab === 'classes'}
			{#if classes.length === 0}
				<div class="empty-state">
					<span class="material-icons">favorite_border</span>
					<p>{$t('favourites.no_classes', { default: "You haven't favourited any classes yet." })}</p>
					<Button href="/marketplace" variant="raised" class="premium-button">
						<Label>Explore Marketplace</Label>
					</Button>
				</div>
			{:else}
				<div class="teacher-grid">
					{#each classes as ad (ad.id)}
						<article class="card-container premium-card" style="position: relative;">
							<div class="fav-btn-container" style="position: absolute; top: 10px; right: 10px; z-index: 2; background: rgba(255,255,255,0.8); border-radius: 50%;">
								<IconButton class="material-icons" onclick={(e) => toggleFavClass(ad.id, e)} style="color: #e63946;">
									favorite
								</IconButton>
							</div>
							<Card style="height: 100%; display: flex; flex-direction: column;">
								<PrimaryAction onclick={() => window.location.href = `/marketplace/class/${ad.id}`} style="flex: 1; display: flex; flex-direction: column;">
									<Media
										class="card-media"
										style="background-image: url('{ad.image_url ? getMediaUrl(ad.image_url) : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #f4f8fa; flex-shrink: 0;"
										aspectRatio="16x9"
									/>
									<Content class="mdc-typography--body2" style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
										<h2 style="margin: 0 0 0.5rem 0; font-weight: bold;">{getTitle(ad)}</h2>
										<div class="price-section" style="margin-top: auto;">
											<span class="price-amount">{$formatPrice(ad.price)}</span>
										</div>
									</Content>
								</PrimaryAction>
							</Card>
						</article>
					{/each}
				</div>
			{/if}
		{:else}
			{#if instructors.length === 0}
				<div class="empty-state">
					<span class="material-icons">favorite_border</span>
					<p>{$t('favourites.no_instructors', { default: "You haven't favourited any instructors yet." })}</p>
					<Button href="/instructors" variant="raised" class="premium-button">
						<Label>Find Instructors</Label>
					</Button>
				</div>
			{:else}
				<div class="teacher-grid">
					{#each instructors as teacher (teacher.id)}
						<article class="card-container premium-card" style="position: relative;">
							<div class="fav-btn-container" style="position: absolute; top: 10px; right: 10px; z-index: 2; background: rgba(255,255,255,0.8); border-radius: 50%;">
								<IconButton class="material-icons" onclick={(e) => toggleFavInstructor(teacher.id, e)} style="color: #e63946;">
									favorite
								</IconButton>
							</div>
							<Card style="height: 100%; display: flex; flex-direction: column;">
								<PrimaryAction onclick={() => window.location.href = `/profile/${teacher.id}`} style="flex: 1; display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem;">
									<div class="profile-avatar" style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; margin-bottom: 1rem; border: 4px solid var(--primary-color-light);">
										{#if teacher.profile_picture_url}
											<img src={getMediaUrl(teacher.profile_picture_url)} alt="{teacher.name}'s profile" style="width: 100%; height: 100%; object-fit: cover;" />
										{:else}
											<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--surface-color); color: var(--primary-color);">
												<span class="material-icons" style="font-size: 3rem;">person</span>
											</div>
										{/if}
									</div>
									<h2 style="margin: 0 0 0.5rem 0;">{teacher.name} {teacher.surname}</h2>
									<div class="rating-display" style="display: flex; align-items: center; gap: 0.25rem;">
										<span class="material-icons" style="color: #FFD700;">star</span>
										<span style="font-weight: bold;">{parseFloat(teacher.average_rating || 0).toFixed(1)}</span>
										<span style="color: #666;">({teacher.reviews_count || 0})</span>
									</div>
								</PrimaryAction>
							</Card>
						</article>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.favourites-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	.hero-section {
		text-align: center;
		margin-bottom: 2rem;
	}
	.tabs-container {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}
	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		background: var(--surface-color);
		border-radius: 12px;
		color: #666;
	}
	.empty-state .material-icons {
		font-size: 4rem;
		color: #ccc;
		margin-bottom: 1rem;
	}
	.teacher-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}
	.card-media {
		height: 200px;
	}
	.price-amount {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--primary-color);
	}
</style>
