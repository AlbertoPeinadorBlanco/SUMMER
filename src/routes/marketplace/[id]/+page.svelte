<script lang="ts">
	import { page } from '$app/stores';
	import { t, locale } from 'svelte-i18n';
	import Card, { Content } from '@smui/card';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';
	import Dialog, { Title as DialogTitle, Content as DialogContent, Actions as DialogActions } from '@smui/dialog';
	import { fetchApi, getMediaUrl, getAvatarPlaceholder } from '$lib/api';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { data } = $props();
	let teacher = $derived(data.teacher);
	let currentUser = $derived($auth.user);

	// Contact form state
	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');
	let contactLoading = $state(false);
	let contactError = $state('');
	let contactSuccessDialogOpen = $state(false);
	let activeCoupon: any = $state(null);

	$effect(() => {
		if (currentUser && !contactName && !contactEmail) {
			contactName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username || '';
			contactEmail = currentUser.email || '';
		}
	});

	onMount(async () => {

		try {
			const resCoupons = await fetchApi('/coupons');
			if (Array.isArray(resCoupons) && resCoupons.length > 0) {
				activeCoupon = resCoupons[0];
			}
		} catch (e) {
			console.error("Failed to load coupons", e);
		}

		if (currentUser) {
			try {
				const favs = await fetchApi('/favourites/instructors');
				userFavInstructors = new Set(favs.map((f: any) => f.id || f.instructor_id));
			} catch (e) {
				console.error('Failed to load fav instructors', e);
			}
		}
	});

	let userFavInstructors = $state<Set<number>>(new Set());

	async function toggleFavInstructor(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		if (!teacher) return;
		if (!currentUser) {
			import('$lib/stores/toast').then(({ showToast }) => showToast($t('favourites.login_required', { default: 'Please login to favourite this item.' }), 'error'));
			return;
		}
		try {
			const res = await fetchApi(`/favourites/instructors/${teacher.id}`, { method: 'POST' });
			const newSet = new Set(userFavInstructors);
			if (res.is_favourited) {
				newSet.add(teacher.id);
			} else {
				newSet.delete(teacher.id);
			}
			userFavInstructors = newSet;
			import('$lib/stores/toast').then(({ showToast }) => showToast(res.message, 'success'));
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message, 'error'));
		}
	}

	async function handleContact(e: Event) {
		e.preventDefault();
		if (!teacher) return;
		contactLoading = true;
		contactError = '';
		try {
			await fetchApi(`/users/${teacher.id}/contact`, {
				method: 'POST',
				body: JSON.stringify({ contactName, contactEmail, contactMessage })
			});
			contactSuccessDialogOpen = true;
			contactName = '';
			contactEmail = '';
			contactMessage = '';
		} catch (err: any) {
			contactError = err.message || 'Failed to send message';
		} finally {
			contactLoading = false;
		}
	}

	function getTitle(surfClass: any) {
		const titleStr = surfClass.title;
		return titleStr ? titleStr.charAt(0).toUpperCase() + titleStr.slice(1) : '';
	}

	let personSchema = $derived(teacher ? {
		"@context": "https://schema.org",
		"@type": "Person",
		"name": teacher.name,
		"description": teacher.bio,
		"image": teacher.image ? [teacher.image] : [],
		"jobTitle": teacher.specialty || "Instructor",
		"url": `https://surf-market.net/profile/${teacher.id}`
	} : null);
</script>

{#if teacher}
	<SEO
		title="{teacher.name} - {teacher.specialty}"
		description={teacher.bio}
		image={teacher.image}
		type="profile"
		schema={personSchema}
	/>

	<div class="profile-container" role="main" aria-labelledby="profile-name">
		<Button
			href="/marketplace"
			variant="outlined"
			class="back-btn"
			aria-label={$t('profile.back_btn')}
		>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">arrow_back</span>
			<Label>{$t('profile.back_btn')}</Label>
		</Button>

		<div class="profile-header">
			<div style="position: relative; display: inline-block;">
				<div
					class="profile-image"
					style="background-image: url({teacher.image}); margin: 0;"
					role="img"
					aria-label="Profile photo of {teacher.name}"
				></div>
				{#if teacher.is_verified}
					<div class="verified-badge-large" title="Verified Instructor" style="position: absolute; bottom: 5px; right: 5px; background: var(--surface-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2196f3; padding: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
						<span class="material-icons" aria-hidden="true" style="font-size: 32px;">verified</span>
					</div>
				{/if}
				{#if teacher.ratings && teacher.ratings.total > 0}
					<div class="header-rating-badge" title="{teacher.ratings.average} out of 5 stars ({teacher.ratings.total} reviews)" style="position: absolute; bottom: 5px; left: 5px; background: var(--surface-color); border-radius: 16px; display: flex; align-items: center; gap: 4px; padding: 4px 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-weight: bold; color: #fbbf24; font-size: 14px;">
						{teacher.ratings.average} <span class="material-icons" style="font-size: 16px;">star</span>
					</div>
				{/if}
			</div>
			<div class="profile-info">
				<div style="display: flex; align-items: center; gap: 10px;">
					<h1 id="profile-name" style="margin: 0;">{teacher.name}</h1>
					<div class="fav-btn-container" style="background: rgba(255,255,255,0.8); border-radius: 50%;">
						{#await import('@smui/icon-button') then { default: IconButton }}
							<IconButton class="material-icons" onclick={toggleFavInstructor} style="color: {userFavInstructors.has(teacher.id) ? '#e63946' : '#666'};" aria-label="Toggle favourite">
								{userFavInstructors.has(teacher.id) ? 'favorite' : 'favorite_border'}
							</IconButton>
						{/await}
					</div>
				</div>
				<h2 class="specialty" style="margin-top: 0.5rem;">{teacher.specialty}</h2>
				<div class="meta-info">
					<span
						><span class="material-icons" aria-hidden="true">place</span> {teacher.location}</span
					>
					{#if teacher.show_contact_info}
						{#if teacher.phone}
							<span style="display: flex; align-items: center; gap: 4px;">
								<span class="material-icons" aria-hidden="true" style="font-size: 1.2rem;">phone</span> {teacher.phone}
							</span>
						{/if}
						{#if teacher.email}
							<span style="display: flex; align-items: center; gap: 4px;">
								<span class="material-icons" aria-hidden="true" style="font-size: 1.2rem;">email</span> 
								<a href="mailto:{teacher.email}" style="color: inherit; text-decoration: none;">{teacher.email}</a>
							</span>
						{/if}
					{/if}
				</div>
				<div class="perk-badges">
					{#if teacher.is_featured}
						<span class="perk-badge featured-badge">
							<span class="material-icons" aria-hidden="true">star</span>
							{$t('profile_enhancements.public_featured')}
						</span>
					{/if}

					{#if teacher.available_today}
						<span class="perk-badge available-badge">
							<span class="material-icons" aria-hidden="true">event_available</span>
							{$t('marketplace.available_today')}
						</span>
					{/if}
					{#if teacher.has_video_upgrade}
						<span class="perk-badge upgrade-badge">
							<span class="material-icons" aria-hidden="true">videocam</span>
							Video
						</span>
					{/if}
					{#if teacher.has_link_upgrade}
						<span class="perk-badge upgrade-badge">
							<span class="material-icons" aria-hidden="true">link</span>
							Online Booking
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="content-grid">
			<div class="main-column">
				{#if teacher.video_url}
					<section class="video-section">
						<h3>Introductory Video</h3>
						<div class="video-container">
							<iframe 
								src={teacher.video_url.includes('youtube.com/watch?v=') ? teacher.video_url.replace('watch?v=', 'embed/') : teacher.video_url} 
								title="Instructor Video"
								frameborder="0" 
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
								allowfullscreen
							></iframe>
						</div>
					</section>
				{/if}

				<section class="about-section" aria-labelledby="about-title">
					<h3 id="about-title">{$t('profile.about')}</h3>
					<p>{teacher.bio}</p>
				</section>


				<section class="classes-section" aria-labelledby="classes-title">
					<h3 id="classes-title">{$t('profile.classes_title')}</h3>
					<div class="classes-list" role="list">
						{#each teacher.classes as surfClass}
							<Card class="class-card premium-card" role="listitem" style="cursor: pointer; {surfClass.capacity && surfClass.bookings_count >= surfClass.capacity ? 'filter: grayscale(80%); opacity: 0.8; position: relative;' : ''}" onclick={() => window.location.href = `/marketplace/class/${surfClass.id}`}>
								{#if surfClass.capacity && surfClass.bookings_count >= surfClass.capacity}
									<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: center; pointer-events: none;">
										<div style="background: rgba(0,0,0,0.6); color: white; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: bold; font-size: 1.2rem; transform: rotate(-15deg); box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 2px solid white;">
											{$t('marketplace.fully_booked')}
										</div>
									</div>
								{/if}
								<Content>
									<div class="class-card-header">
										<h4>{getTitle(surfClass)}</h4>
										<span class="class-price">{$formatPrice(surfClass.price, surfClass.class_type === 'course' || surfClass.class_type === 'curso')}</span>
									</div>
									<div class="class-meta">
										<span class="meta-item">
											<span class="material-icons">schedule</span> {surfClass.duration}
										</span>
										<span class="meta-item">
											<span class="material-icons">surfing</span> <span style="text-transform: capitalize;">{surfClass.class_type}</span>
										</span>
										<span class="meta-item">
											<span class="material-icons">signal_cellular_alt</span> Lvl {surfClass.difficulty_level || 1}
										</span>
									</div>
								</Content>
							</Card>
						{:else}
							<p>No classes scheduled currently.</p>
						{/each}
					</div>
				</section>

				<section class="ratings-section" aria-labelledby="ratings-title" style="margin-top: 3rem;">
					<h3 id="ratings-title">{$t('ratings.average_rating')}</h3>
					{#if teacher.ratings.total > 0}
						<div class="rating-overview">
							<div class="rating-big-number">{teacher.ratings.average}</div>
							<div class="rating-stars">
								{#each [1, 2, 3, 4, 5] as star}
									<span class="material-icons" style="color: {star <= Math.round(teacher.ratings.average) ? '#fbbf24' : '#d1d5db'};">
										{star <= Math.round(teacher.ratings.average) ? 'star' : 'star_border'}
									</span>
								{/each}
								<span class="rating-count">({teacher.ratings.total})</span>
							</div>
						</div>
						<div class="reviews-list">
							{#each teacher.ratings.reviews as review}
								<div class="review-item" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px;">
									<div class="review-avatar">
										<img src={review.profile_picture_url ? getMediaUrl(review.profile_picture_url) : getAvatarPlaceholder(review.student_name, review.student_avatar_color)} alt={review.student_name} style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />
									</div>
									<div class="review-content" style="flex: 1;">
										<div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
											<strong style="color: var(--text-color);">{review.student_name}</strong>
											<span class="review-date" style="color: #6b7280; font-size: 0.85rem;">{new Date(review.created_at).toLocaleDateString()}</span>
										</div>
										<div class="review-stars" style="margin-bottom: 0.5rem;">
											{#each [1, 2, 3, 4, 5] as star}
												<span class="material-icons" style="font-size: 16px; color: {star <= review.rating ? '#FFD700' : '#d1d5db'};">
													{star <= review.rating ? 'star' : 'star_border'}
												</span>
											{/each}
										</div>
										{#if review.comment}
											<p class="review-comment" style="color: #4b5563; margin: 0; line-height: 1.5; font-size: 0.95rem;">{review.comment}</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>{$t('ratings.no_ratings')}</p>
					{/if}
				</section>
			</div>

			<div class="sidebar">
				{#if teacher.booking_link}
					<div class="booking-link-box" style="margin-bottom: 2rem;">
						<Button href={teacher.booking_link} target="_blank" rel="noopener noreferrer" variant="raised" class="premium-button" style="width: 100%;">
							<Label>Book on external software</Label>
						</Button>
					</div>
				{/if}
				<div class="contact-box" role="region" aria-labelledby="contact-title">
					<h3 id="contact-title">{$t('profile.contact_title')}</h3>
					
					{#if teacher.allow_communications === false || teacher.allow_communications === 0}
						<div style="margin-top: 1rem; padding: 1rem; background: #ffebee; color: #c62828; border-radius: 8px; text-align: center;">
							<strong>Notice</strong><br>
							This instructor does not accept direct messages at this time.
						</div>
					{:else}
						{#if contactError}
							<div style="margin-bottom: 1rem; padding: 0.5rem; background: #ffebee; color: #c62828; border-radius: 4px; font-size: 0.9rem;">
								{contactError}
							</div>
						{/if}
						<form onsubmit={handleContact} class="contact-form">
							<Textfield
								variant="outlined"
								bind:value={contactName}
								label={$t('profile.form_name')}
								required
								disabled={contactLoading}
								style="width: 100%; margin-bottom: 1rem;"
							/>
							<Textfield
								variant="outlined"
								type="email"
								bind:value={contactEmail}
								label={$t('profile.form_email')}
								required
								disabled={contactLoading}
								input$pattern={'[^@\\s]+@[^@\\s]+\\.[^@\\s]+'}
								input$title="Please enter a valid email address with a domain (e.g. .com)"
								style="width: 100%; margin-bottom: 1rem;"
							/>
							<Textfield
								variant="outlined"
								textarea
								bind:value={contactMessage}
								label={$t('profile.form_message')}
								required
								disabled={contactLoading}
								style="width: 100%; margin-bottom: 1rem;"
								input$rows={4}
							/>
							<Button type="submit" variant="raised" class="premium-button submit-btn" disabled={contactLoading}>
								<Label>{contactLoading ? 'Sending...' : $t('profile.form_submit')}</Label>
							</Button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="not-found">
		<h2>{$t('profile.not_found')}</h2>
		<Button
			href="/marketplace"
			variant="raised"
			class="premium-button"
			style="background-color: var(--primary-color) !important;"
		>
			<Label>{$t('profile.back_btn')}</Label>
		</Button>
	</div>
{/if}

<Dialog bind:open={contactSuccessDialogOpen} aria-labelledby="contact-success-title" aria-describedby="contact-success-content">
	<DialogTitle id="contact-success-title">{$t('profile.contact_success_title')}</DialogTitle>
	<DialogContent id="contact-success-content">
		<div class="success-msg" style="text-align: center; padding: 1rem 0;">
			<span class="material-icons" style="font-size: 3rem; color: #2e7d32; margin-bottom: 1rem;">check_circle</span>
			<h3>{$t('profile.contact_success_msg')}</h3>
			<p>{$t('profile.contact_success_desc', { values: { name: teacher?.name } })}</p>
			
			{#if activeCoupon}
				<div class="coupon-box">
					<div class="coupon-header">{$t('marketplace.exclusive_offer')}</div>
					<div class="coupon-content">
						{#if activeCoupon.image_url}
							<img src={activeCoupon.image_url} alt={activeCoupon.shop_name} class="coupon-img" />
						{/if}
						<div class="coupon-info">
							<h4>{activeCoupon.shop_name}</h4>
							<p class="discount">{activeCoupon.discount_text}</p>
							<div class="coupon-code">
								{$t('marketplace.use_code')} <strong>{activeCoupon.coupon_code}</strong>
							</div>
							<Button href={activeCoupon.link_url} target="_blank" rel="noopener noreferrer" variant="outlined" style="margin-top: 0.5rem; width: 100%;">
								<Label>{$t('marketplace.visit_shop')}</Label>
							</Button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</DialogContent>
	<DialogActions>
		<Button onclick={() => contactSuccessDialogOpen = false}>
			<Label>{$t('profile.close')}</Label>
		</Button>
	</DialogActions>
</Dialog>

<style>
	.profile-container {
		max-width: 1000px;
		margin: 0 auto;
	}

	:global(.back-btn) {
		margin-bottom: 2rem !important;
		border-color: var(--primary-color) !important;
		color: var(--primary-color) !important;
	}

	.profile-header {
		display: flex;
		gap: 2rem;
		align-items: center;
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		margin-bottom: 2rem;
	}

	.profile-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
		border: 4px solid var(--primary-color-soft);
	}

	.profile-info h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		text-transform: capitalize;
	}

	.specialty {
		font-size: 1.2rem;
		color: var(--secondary-color);
		margin: 0 0 1rem 0;
	}

	.meta-info {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		color: #666;
	}

	.meta-info .material-icons {
		vertical-align: middle;
		font-size: 1.2rem;
	}

	.price-badge {
		background: var(--primary-color);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-weight: bold;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}

	.about-section,
	.classes-section,
	.video-section,
	.ratings-section {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		margin-bottom: 2rem;
	}

	.rating-overview {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.rating-big-number {
		font-size: 3.5rem;
		font-weight: 700;
		color: var(--terciary-color);
		line-height: 1;
	}

	.rating-stars {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.rating-count {
		margin-left: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.review-item {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.review-item:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}

	.review-date {
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.review-comment {
		margin-top: 0.75rem;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.video-container {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 */
		height: 0;
		overflow: hidden;
		border-radius: 8px;
	}
	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	h3 {
		color: var(--primary-color);
		border-bottom: 2px solid var(--background-color);
		padding-bottom: 0.5rem;
		margin-top: 0;
	}

	.perk-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.perk-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.perk-badge .material-icons {
		font-size: 14px;
	}

	.featured-badge {
		background: linear-gradient(135deg, #FFD700, #FFA500);
		color: #5a3a00;
		box-shadow: 0 2px 8px rgba(255, 165, 0, 0.4);
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

	.about-section p {
		line-height: 1.6;
		color: #444;
	}

	.classes-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	:global(.class-card) {
		border: 1px solid var(--border-color);
		background: var(--surface-color);
		padding: 0.5rem;
		border-radius: 12px;
	}

	:global(.class-card-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.75rem;
	}

	:global(.class-card h4) {
		margin: 0;
		color: var(--terciary-color);
		font-size: 1.25rem;
	}

	:global(.class-price) {
		font-weight: bold;
		color: var(--primary-color);
		font-size: 1.1rem;
		background: var(--primary-color-soft);
		padding: 6px 14px;
		border-radius: 20px;
	}

	.class-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.95rem;
		color: #666;
		align-items: center;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #f4f8fa;
		padding: 6px 12px;
		border-radius: 8px;
		font-weight: 500;
	}

	.meta-item .material-icons {
		font-size: 18px;
		color: var(--secondary-color);
	}

	:global([data-theme="dark"]) .meta-item {
		background: rgba(255, 255, 255, 0.05);
		color: #ddd;
	}

	.contact-box {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		position: sticky;
		top: 80px;
	}

	:global(.submit-btn) {
		background-color: var(--secondary-color) !important;
		width: 100%;
		margin-top: 1rem;
	}

	.not-found {
		text-align: center;
		padding: 5rem 0;
	}

	@media (max-width: 768px) {
		.profile-header {
			flex-direction: column;
			text-align: center;
		}

		.meta-info {
			justify-content: center;
		}

		.content-grid {
			grid-template-columns: 1fr;
		}
	}
	
	.opacity {
		opacity: 0.9;
	}

	.coupon-box {
		margin-top: 2rem;
		border: 2px dashed var(--primary-color);
		border-radius: 8px;
		background: var(--surface-color);
		overflow: hidden;
		text-align: left;
	}
	.coupon-header {
		background: var(--primary-color);
		color: white;
		padding: 0.5rem;
		text-align: center;
		font-weight: bold;
		text-transform: uppercase;
		font-size: 0.85rem;
	}
	.coupon-content {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		align-items: center;
	}
	.coupon-img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 4px;
	}
	.coupon-info h4 {
		margin: 0 0 0.25rem 0;
		color: var(--text-color);
	}
	.coupon-info .discount {
		color: var(--secondary-color);
		font-weight: bold;
		margin: 0 0 0.5rem 0;
		font-size: 0.95rem;
	}
	.coupon-code {
		background: var(--surface-color);
		border: 1px solid #ccc;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		display: inline-block;
		font-family: monospace;
		font-size: 1.1rem;
	}
</style>
