<script lang="ts">
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Button, { Label } from '@smui/button';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';

	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		alert('Message sent successfully! (Demo)');
		name = '';
		email = '';
		subject = '';
		message = '';
	}
</script>

<SEO title={$t('contact.title')} description={$t('contact.subtitle')} />

<div class="contact-container" role="main" aria-labelledby="contact-title">
	<h1 id="contact-title">{$t('contact.title')}</h1>
	<p class="subtitle">{$t('contact.subtitle')}</p>

	<form class="contact-form" onsubmit={handleSubmit} aria-label="Contact support form">
		<div class="form-row">
			<Textfield
				variant="outlined"
				bind:value={name}
				label={$t('contact.form_name')}
				required
				style="width: 100%;"
			></Textfield>
		</div>

		<div class="form-row">
			<Textfield
				variant="outlined"
				type="email"
				bind:value={email}
				label={$t('contact.form_email')}
				required
				style="width: 100%;"
			></Textfield>
		</div>

		<div class="form-row">
			<Textfield
				variant="outlined"
				bind:value={subject}
				label={$t('contact.form_subject')}
				required
				style="width: 100%;"
			></Textfield>
		</div>

		<div class="form-row">
			<Textfield
				variant="outlined"
				textarea
				bind:value={message}
				label={$t('contact.form_message')}
				required
				style="width: 100%;"
				input$rows={6}
			></Textfield>
		</div>

		<div class="form-actions">
			<Button type="submit" variant="raised" class="premium-button submit-btn">
				<Label>{$t('contact.form_submit')}</Label>
			</Button>
		</div>
	</form>
</div>

<style>
	.contact-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 3rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	h1 {
		color: var(--terciary-color);
		text-align: center;
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 3rem;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-row {
		width: 100%;
	}

	.form-actions {
		margin-top: 1rem;
		text-align: center;
	}

	:global(.submit-btn) {
		background-color: var(--primary-color) !important;
		width: 100%;
		padding: 1rem 0 !important;
	}

	@media (max-width: 600px) {
		.contact-container {
			padding: 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>
