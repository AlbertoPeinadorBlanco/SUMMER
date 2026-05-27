<script lang="ts">
	import { page } from '$app/stores';
	import { t, locale } from 'svelte-i18n';
	import Card, { Content } from '@smui/card';
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();
	let teacher = $derived(data.teacher);

	// Contact form state
	let contactName = $state('');
	let contactEmail = $state('');
	let contactMessage = $state('');

	function handleContact(e: Event) {
		e.preventDefault();
		alert(`Message sent to ${teacher?.name} successfully!`);
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
			</div>
		</div>

		<div class="content-grid">
			<div class="main-column">
				<section class="about-section" aria-labelledby="about-title">
					<h3 id="about-title">{$t('profile.about')}</h3>
					<p>{teacher.bio}</p>
				</section>

				<section class="classes-section" aria-labelledby="classes-title">
					<h3 id="classes-title">{$t('profile.classes_title')}</h3>
					<div class="classes-list" role="list">
						{#each teacher.classes as surfClass}
							<Card class="class-card premium-card" role="listitem">
								<Content>
									<h4>{getTitle(surfClass)}</h4>
									<div class="class-meta">
										<span
											><strong>{$t('profile.class_duration')}:</strong> {surfClass.duration}</span
										>
										<span><strong>{$t('profile.class_level')}:</strong> {surfClass.level}</span>
										<span
											><strong>{$t('profile.price')}:</strong> {$formatPrice(surfClass.price)}</span
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
	.classes-section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		margin-bottom: 2rem;
	}

	h3 {
		color: var(--primary-color);
		border-bottom: 2px solid var(--background-color);
		padding-bottom: 0.5rem;
		margin-top: 0;
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
</style>
