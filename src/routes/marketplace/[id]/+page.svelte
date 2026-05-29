<script lang="ts">
	import { page } from '$app/stores';
	import { t, locale } from 'svelte-i18n';
	import Card, { Content } from '@smui/card';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';
	import Dialog, { Title as DialogTitle, Content as DialogContent, Actions as DialogActions } from '@smui/dialog';
	import { fetchApi } from '$lib/api';
	import { onMount } from 'svelte';

	let { data } = $props();
	let teacher = $derived(data.teacher);

	// Contact form state
	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');
	let contactSuccessDialogOpen = $state(false);
	let activeCoupon: any = $state(null);

	onMount(async () => {
		try {
			const resCoupons = await fetchApi('/coupons');
			if (Array.isArray(resCoupons) && resCoupons.length > 0) {
				activeCoupon = resCoupons[0];
			}
		} catch (e) {
			console.error("Failed to load coupons", e);
		}
	});

	function handleContact(e: Event) {
		e.preventDefault();
		contactSuccessDialogOpen = true;
		contactName = '';
		contactEmail = '';
		contactMessage = '';
	}

	function getTitle(surfClass: any) {
		const titleStr = ($locale === 'es' && surfClass.title_es) ? surfClass.title_es : surfClass.title;
		return titleStr ? titleStr.charAt(0).toUpperCase() + titleStr.slice(1) : '';
	}
</script>

{#if teacher}
	<SEO
		title="{teacher.name} - {teacher.specialty}"
		description={teacher.bio}
		image={teacher.image}
		type="profile"
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
			<div
				class="profile-image"
				style="background-image: url({teacher.image});"
				role="img"
				aria-label="Profile photo of {teacher.name}"
			></div>
			<div class="profile-info">
				<h1 id="profile-name">{teacher.name}</h1>
				<h2 class="specialty">{teacher.specialty}</h2>
				<div class="meta-info">
					<span
						><span class="material-icons" aria-hidden="true">place</span> {teacher.location}</span
					>
					<span class="price-badge" aria-label="Price: {$formatPrice(teacher.price)}"
						>{$formatPrice(teacher.price)}</span
					>
				</div>
				<div class="perk-badges">
					{#if teacher.is_featured}
						<span class="perk-badge featured-badge">
							<span class="material-icons" aria-hidden="true">star</span>
							{$t('profile_enhancements.currently_featured')}
						</span>
					{/if}
					{#if teacher.tier === 'premium' || teacher.tier === 'summer_pass'}
						<span class="perk-badge premium-badge">
							<span class="material-icons" aria-hidden="true">workspace_premium</span>
							Premium
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
							<Card class="class-card premium-card" role="listitem" style="cursor: pointer;" onclick={() => window.location.href = `/marketplace/class/${surfClass.id}`}>
								<Content>
									<h4>{getTitle(surfClass)}</h4>
									<div class="class-meta">
										<span
											><strong>{$t('profile.class_duration')}:</strong> {surfClass.duration}</span
										>
										<span
											><strong>Type:</strong> <span style="text-transform: capitalize;">{surfClass.class_type}</span></span
										>
										<span><strong>Level:</strong> {surfClass.difficulty_level || 1}</span>
										<span
											><strong>{$t('profile.price')}:</strong> {$formatPrice(surfClass.price, surfClass.class_type === 'course' || surfClass.class_type === 'curso')}</span
										>
									</div>
								</Content>
							</Card>
						{:else}
							<p>No classes scheduled currently.</p>
						{/each}
					</div>
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
					<form onsubmit={handleContact} class="contact-form">
						<Textfield
							variant="outlined"
							bind:value={contactName}
							label={$t('profile.form_name')}
							required
							style="width: 100%; margin-bottom: 1rem;"
						/>
						<Textfield
							variant="outlined"
							type="email"
							bind:value={contactEmail}
							label={$t('profile.form_email')}
							required
							style="width: 100%; margin-bottom: 1rem;"
						/>
						<Textfield
							variant="outlined"
							textarea
							bind:value={contactMessage}
							label={$t('profile.form_message')}
							required
							style="width: 100%; margin-bottom: 1rem;"
							input$rows={4}
						/>
						<Button type="submit" variant="raised" class="premium-button submit-btn">
							<Label>{$t('profile.form_submit')}</Label>
						</Button>
					</form>
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
		background: white;
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
	.video-section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
		margin-bottom: 2rem;
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
		border: 1px solid #eaeaea;
	}

	:global(.class-card h4) {
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		font-size: 1.1rem;
	}

	.class-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: #666;
	}

	.contact-box {
		background: white;
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
		background: #fff9f5;
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
		background: white;
		border: 1px solid #ccc;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		display: inline-block;
		font-family: monospace;
		font-size: 1.1rem;
	}
</style>
