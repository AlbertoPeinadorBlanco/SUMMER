<script lang="ts">
	import { t, locale } from 'svelte-i18n';
	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import Dialog, { Title as DialogTitle, Content as DialogContent, Actions as DialogActions } from '@smui/dialog';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
	let advert = $derived(data.advert);

	// Booking state
	let isBookingDialogOpen = $state(false);
	let bookingLoading = $state(false);
	let bookingError = $state('');
	let bookingSuccess = $state(false);

	let userBookedClassIds = $state<Set<number>>(new Set());

	$effect(() => {
		if ($auth.isAuthenticated && $auth.user) {
			fetchApi(`/bookings/user/${$auth.user.id}`)
				.then(res => {
					if (Array.isArray(res)) {
						userBookedClassIds = new Set(res.map((b: any) => b.class_id));
					}
				})
				.catch(console.error);
		} else {
			userBookedClassIds = new Set();
		}
	});

	function openBookingDialog() {
		if (!$auth.isAuthenticated) {
			alert('Please log in to book a class.');
			return;
		}

		isBookingDialogOpen = true;
		bookingError = '';
		bookingSuccess = false;
	}

	async function submitBooking() {
		if (!advert || !$auth.user) return;
		
		bookingLoading = true;
		bookingError = '';
		
		try {
			const res = await fetchApi('/bookings', {
				method: 'POST',
				body: JSON.stringify({
					user_id: $auth.user.id,
					class_id: advert.id
				})
			});
			
			if (res.error) {
				bookingError = res.error;
			} else {
				bookingSuccess = true;
				if (advert) {
					userBookedClassIds.add(advert.id);
					userBookedClassIds = new Set(userBookedClassIds); // trigger reactivity
				}
			}
		} catch (err: any) {
			bookingError = err.message || 'An error occurred while booking.';
		} finally {
			bookingLoading = false;
		}
	}

	function getTitle(ad: any) {
		const titleStr = ($locale === 'es' && ad.title_es) ? ad.title_es : ad.title;
		return titleStr ? titleStr.charAt(0).toUpperCase() + titleStr.slice(1) : '';
	}

	function getDescription(ad: any) {
		const descStr = ($locale === 'es' && ad.description_es) ? ad.description_es : ad.description;
		return descStr || '';
	}
</script>

<svelte:head>
	{#if advert}
		<link rel="preload" as="image" href={advert.image_url ? `http://localhost:5000${advert.image_url}` : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'} fetchpriority="high" />
	{/if}
</svelte:head>

{#if advert}
	<SEO
		title="{getTitle(advert)} - SurfMarket"
		description={getDescription(advert).substring(0, 160)}
		image={advert.image_url ? `http://localhost:5000${advert.image_url}` : undefined}
		type="article"
	/>

	<div class="advert-container" role="main">
		<Button
			href="/marketplace"
			variant="outlined"
			class="back-btn"
			aria-label={$t('advert.back_btn')}
		>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">arrow_back</span>
			<Label>{$t('advert.back_btn')}</Label>
		</Button>

		<div class="advert-header">
			<div
				class="advert-image"
				style="background-image: url({advert.image_url ? `http://localhost:5000${advert.image_url}` : 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'});"
				role="img"
				aria-label="Cover photo for {advert.title}"
			>
				<div class="image-overlay">
					<div class="badges">
						<span class="badge {advert.class_type}">{advert.class_type}</span>
						<span class="badge level">{$t('advert.level')} {advert.difficulty_level || 1}</span>
						{#if advert.is_online}
							<span class="badge online">{$t('advert.online')}</span>
						{/if}
					</div>
				</div>
			</div>
			
			<div class="advert-title-section">
				<h1 id="advert-title">{getTitle(advert)}</h1>
				<div class="price-tag">
					{$formatPrice(advert.price, advert.class_type === 'course' || advert.class_type === 'curso')}
				</div>
			</div>
		</div>

		<div class="content-grid">
			<div class="main-column">
				<section class="details-section" aria-labelledby="about-title">
					<h3 id="about-title">{$t('advert.about_class')}</h3>
					<p class="description">{getDescription(advert)}</p>
				</section>
				
				<section class="details-section" aria-labelledby="schedule-title">
					<h3 id="schedule-title">{$t('advert.schedule')}</h3>
					<div class="info-grid">
						<div class="info-item">
							<span class="material-icons" aria-hidden="true">timer</span>
							<div>
								<strong>{$t('advert.duration')}:</strong>
								<p>{advert.duration_minutes} min</p>
							</div>
						</div>
						<div class="info-item">
							<span class="material-icons" aria-hidden="true">group</span>
							<div>
								<strong>{$t('advert.capacity')}:</strong>
								<p>{advert.bookings_count || 0} / {advert.capacity} booked</p>
							</div>
						</div>
						<div class="info-item">
							<span class="material-icons" aria-hidden="true">place</span>
							<div>
								<strong>{$t('advert.location')}:</strong>
								<p>{advert.location || 'Anywhere'}</p>
							</div>
						</div>
					</div>
				</section>
			</div>

			<div class="sidebar">
				<Card class="booking-card premium-card">
					<Content>
						<h3 class="instructor-heading">{$t('advert.instructor')}</h3>
						<div class="instructor-profile">
							<img src={advert.profile_picture_url ? `http://localhost:5000${advert.profile_picture_url}` : 'https://ui-avatars.com/api/?name=' + (advert.first_name || advert.instructor_username) + '&background=random'} alt="Instructor" class="instructor-avatar" loading="lazy" decoding="async" width="64" height="64" />
							<div class="instructor-info">
								<h4>{advert.first_name || advert.instructor_username} {advert.last_name || ''}</h4>
								<a href="/marketplace/{advert.instructor_id}" class="profile-link">
									{$t('advert.view_profile')} <span class="material-icons" aria-hidden="true" style="font-size: 1rem;">arrow_forward</span>
								</a>
							</div>
						</div>

						<div class="booking-action">
							<button 
								class="book-btn-custom" 
								onclick={openBookingDialog}
								disabled={userBookedClassIds.has(advert.id)}
								style={userBookedClassIds.has(advert.id) ? 'background-color: #bdbdbd; cursor: not-allowed; border-color: #bdbdbd;' : ''}
							>
								{userBookedClassIds.has(advert.id) ? $t('marketplace.booked_btn') : $t('advert.book_now')}
							</button>
						</div>
					</Content>
				</Card>
			</div>
		</div>
	</div>
{/if}

<!-- Booking Dialog -->
<Dialog bind:open={isBookingDialogOpen} aria-labelledby="booking-title" aria-describedby="booking-content">
	<DialogTitle id="booking-title">Confirm Booking</DialogTitle>
	<DialogContent id="booking-content">
		{#if bookingSuccess}
			<div class="success-msg" style="text-align: center; padding: 1rem 0;">
				<span class="material-icons" style="font-size: 3rem; color: #2e7d32; margin-bottom: 1rem;">check_circle</span>
				<h3>Successfully Booked!</h3>
				<p>Your spot has been reserved for {getTitle(advert)}.</p>
			</div>
		{:else}
			{#if bookingError}
				<div class="error-msg" style="color: var(--mdc-theme-error); margin-bottom: 1rem;">
					{bookingError}
				</div>
			{/if}
			<p>Are you sure you want to book <strong>{advert ? getTitle(advert) : ''}</strong>?</p>
			{#if advert}
				<ul style="list-style: none; padding: 0; margin-top: 1rem;">
					<li><strong>{$t('advert.duration')}:</strong> {advert.duration_minutes} min</li>
					<li><strong>{$t('advert.price')}:</strong> {$formatPrice(advert.price, advert.class_type === 'course' || advert.class_type === 'curso')}</li>
				</ul>
			{/if}
		{/if}
	</DialogContent>
	<DialogActions>
		{#if bookingSuccess}
			<Button variant="raised" onclick={() => isBookingDialogOpen = false}>
				<Label>Close</Label>
			</Button>
		{:else}
			<Button variant="outlined" onclick={() => isBookingDialogOpen = false} disabled={bookingLoading}>
				<Label>Cancel</Label>
			</Button>
			<Button variant="raised" class="premium-button" onclick={submitBooking} disabled={bookingLoading}>
				<Label>{bookingLoading ? 'Booking...' : 'Confirm'}</Label>
			</Button>
		{/if}
	</DialogActions>
</Dialog>

<style>
	.advert-container {
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.back-btn {
		margin-bottom: 2rem;
	}

	.advert-header {
		margin-bottom: 3rem;
	}

	.advert-image {
		width: 100%;
		height: 400px;
		background-size: cover;
		background-position: center;
		border-radius: 16px;
		margin-bottom: 2rem;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 2rem;
		background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
		display: flex;
		align-items: flex-end;
		box-sizing: border-box;
	}

	.badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.badge {
		font-size: 0.85rem;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		text-transform: uppercase;
		font-weight: bold;
		background: var(--surface-color);
		box-shadow: 0 2px 8px rgba(0,0,0,0.2);
	}

	.badge.course, .badge.curso {
		background: #e3f2fd;
		color: #1565c0;
	}

	.badge.class, .badge.clase {
		background: #fff3e0;
		color: #e65100;
	}

	.badge.level {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge.online {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.advert-title-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin: 0;
		flex: 1;
	}

	.price-tag {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--primary-color);
		background: var(--surface-color);
		padding: 0.5rem 1.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.1);
		border: 2px solid var(--primary-color-soft);
		box-sizing: border-box;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
	}

	.details-section {
		background: var(--surface-color);
		padding: 2.5rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		margin-bottom: 2rem;
		border: 1px solid #f0f0f0;
		box-sizing: border-box;
	}

	.details-section h3 {
		font-size: 1.5rem;
		color: var(--terciary-color);
		margin-top: 0;
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--primary-color-soft);
	}

	.description {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #444;
		white-space: pre-wrap;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		width: 100%;
		box-sizing: border-box;
	}

	.info-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.info-item .material-icons {
		color: var(--secondary-color);
		font-size: 2rem;
	}

	.info-item strong {
		display: block;
		color: var(--terciary-color);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-item p {
		margin: 0.25rem 0 0 0;
		font-size: 1.1rem;
		font-weight: 500;
		color: #333;
	}

	.booking-card {
		position: sticky;
		top: 100px;
	}

	.instructor-heading {
		margin-top: 0;
		color: #555;
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
	}

	.instructor-profile {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.instructor-avatar {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		object-fit: cover;
		box-shadow: 0 4px 10px rgba(0,0,0,0.1);
	}

	.instructor-info h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
		color: var(--terciary-color);
	}

	.profile-link {
		color: var(--primary-color);
		text-decoration: none;
		font-weight: bold;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		transition: color 0.2s ease;
	}

	.profile-link:hover {
		color: var(--secondary-color);
	}

	.booking-action {
		text-align: center;
	}

	.book-btn-custom {
		width: 100%;
		background-color: var(--secondary-color) !important;
		color: #ffffff !important;
		font-size: 1.2rem;
		font-weight: bold;
		padding: 1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.3);
		transition: background-color 0.2s, transform 0.2s;
		box-sizing: border-box;
		font-family: inherit;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.book-btn-custom:hover {
		background-color: #d15c30;
		transform: translateY(-2px);
	}

	.book-btn-custom:active {
		transform: translateY(0);
	}

	@media (max-width: 900px) {
		.content-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		
		.advert-image {
			height: 250px;
		}
		
		h1 {
			font-size: 1.8rem;
		}
		
		.price-tag {
			font-size: 1.5rem;
			padding: 0.5rem 1rem;
		}
		
		.advert-title-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		
		.details-section {
			padding: 1.5rem;
		}
		
		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
