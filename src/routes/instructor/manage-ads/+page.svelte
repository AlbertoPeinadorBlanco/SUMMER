<script lang="ts">
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import Select, { Option } from '@smui/select';
	import FormField from '@smui/form-field';
	import { t, locale } from 'svelte-i18n';
	import { auth } from '$lib/stores/auth';
	import { currencySymbol } from '$lib/stores/currency';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';

	let user = $derived($auth.user);
	let isAuthenticated = $derived($auth.isAuthenticated);

	let classes: any[] = $state([]);
	let loadingClasses = $state(true);

	let editingId = $state<number | null>(null);

	let class_type_id = $state('1');
	let title = $state('');
	let title_es = $state('');
	let description = $state('');
	let description_es = $state('');
	let price = $state('');
	let capacity = $state('');
	let duration_minutes = $state('');
	let starts_at = $state('');
	let ends_at = $state('');
	let location = $state('');
	let is_online = $state(false);

	let imageFile: File | null = $state(null);
	let imagePreview = $state('');
	let currentImageUrl = $state('');

	let loading = $state(false);
	let error = $state('');
	let successMsg = $state('');
	
	let lastTranslatedTitleEs = '';
	let lastTranslatedDescEs = '';

	async function translateText(text: string): Promise<string> {
		if (!text) return '';
		try {
			const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`);
			const data = await res.json();
			return data.responseData?.translatedText || '';
		} catch (e) {
			console.error('Translation error', e);
			return '';
		}
	}

	$effect(() => {
		const handler = setTimeout(async () => {
			if (title_es && title_es !== lastTranslatedTitleEs) {
				lastTranslatedTitleEs = title_es;
				const res = await translateText(title_es);
				if (res) title = res;
			}
			if (description_es && description_es !== lastTranslatedDescEs) {
				lastTranslatedDescEs = description_es;
				const res = await translateText(description_es);
				if (res) description = res;
			}
		}, 1500);
		return () => clearTimeout(handler);
	});

	$effect(() => {
		if (isAuthenticated === false) {
			goto('/');
		} else if (user?.id) {
			loadClasses();
		}
	});

	async function loadClasses() {
		loadingClasses = true;
		try {
			classes = await fetchApi(`/classes?instructor_id=${user?.id}`);
		} catch (err) {
			console.error('Error loading classes:', err);
		} finally {
			loadingClasses = false;
		}
	}

	function editClass(c: any) {
		editingId = c.id;
		// Hack because the API returns class_type name not ID. We assume class_type is either 'class' or 'course'.
		class_type_id = c.class_type === 'course' ? '2' : '1';
		title = c.title || '';
		title_es = c.title_es || '';
		lastTranslatedTitleEs = title_es;
		description = c.description || '';
		description_es = c.description_es || '';
		lastTranslatedDescEs = description_es;
		price = c.price.toString();
		capacity = c.capacity ? c.capacity.toString() : '';
		duration_minutes = c.duration_minutes ? c.duration_minutes.toString() : '';
		starts_at = c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : '';
		ends_at = c.ends_at ? new Date(c.ends_at).toISOString().slice(0, 16) : '';
		location = c.location || '';
		is_online = !!c.is_online;
		currentImageUrl = c.image_url ? `http://localhost:5000${c.image_url}` : '';
		imageFile = null;
		imagePreview = '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editingId = null;
		class_type_id = '1';
		title = '';
		title_es = '';
		description = '';
		description_es = '';
		price = '';
		capacity = '';
		duration_minutes = '';
		starts_at = '';
		ends_at = '';
		location = '';
		is_online = false;
		currentImageUrl = '';
		imageFile = null;
		imagePreview = '';
		error = '';
	}

	function handleImageSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			imageFile = target.files[0];
			imagePreview = URL.createObjectURL(imageFile);
		}
	}

	async function deleteClass(id: number) {
		if (!confirm($t('createAd.delete_confirm'))) return;
		try {
			await fetchApi(`/classes/${id}`, { method: 'DELETE' });
			await loadClasses();
		} catch (err: any) {
			alert(err.message || 'Failed to delete');
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		successMsg = '';

		try {
			const payload = {
				instructor_id: user?.id,
				class_type_id: parseInt(class_type_id),
				title,
				title_es,
				description,
				description_es,
				price: parseFloat(price) || 0,
				capacity: parseInt(capacity) || null,
				duration_minutes: parseInt(duration_minutes) || null,
				starts_at: starts_at ? new Date(starts_at).toISOString() : null,
				ends_at: ends_at ? new Date(ends_at).toISOString() : null,
				location,
				is_online: is_online ? 1 : 0
			};

			let classId = editingId;

			if (editingId) {
				await fetchApi(`/classes/${editingId}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
			} else {
				const res = await fetchApi('/classes', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				classId = res.id;
			}

			// Upload image if selected
			if (imageFile && classId) {
				const formData = new FormData();
				formData.append('class_picture', imageFile);
				await fetchApi(`/classes/${classId}/picture`, {
					method: 'POST',
					body: formData
				});
			}

			successMsg = $t('createAd.success_msg');
			cancelEdit();
			await loadClasses();

			setTimeout(() => {
				successMsg = '';
			}, 3000);
		} catch (err: any) {
			error = err.message || $t('createAd.error_msg');
		} finally {
			loading = false;
		}
	}
</script>

<SEO title={$t('nav.manageAds')} />

<div class="manage-ads-container">
	<div class="split-layout">
		<!-- Left Side: Form -->
		<div class="form-section">
			<h1>{editingId ? $t('createAd.form_update') : $t('createAd.title')}</h1>
			<p class="subtitle">{$t('createAd.subtitle')}</p>

			{#if error}
				<div class="error-msg">
					<span class="material-icons">error</span>
					{error}
				</div>
			{/if}

			{#if successMsg}
				<div class="success-msg">
					<span class="material-icons">check_circle</span>
					{successMsg}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="create-form">
				<div class="form-row">
					<Select
						variant="outlined"
						bind:value={class_type_id}
						label={$t('createAd.form_type')}
						style="width: 100%;"
					>
						<Option value="1">{$t('createAd.type_class')}</Option>
						<Option value="2">{$t('createAd.type_course')}</Option>
					</Select>
				</div>
				<div class="form-row">
					<Textfield
						variant="outlined"
						bind:value={title_es}
						label={$t('createAd.form_title_es')}
						required
						style="width: 100%;"
					/>
					<Textfield
						variant="outlined"
						bind:value={title}
						label={$t('createAd.form_title_en')}
						disabled
						style="width: 100%;"
					/>
				</div>

				<div class="form-row">
					<Textfield
						variant="outlined"
						textarea
						bind:value={description_es}
						label={$t('createAd.form_desc_es')}
						style="width: 100%;"
						input$rows={4}
					/>
					<Textfield
						variant="outlined"
						textarea
						bind:value={description}
						label={$t('createAd.form_desc_en')}
						disabled
						style="width: 100%;"
						input$rows={4}
					/>
				</div>

				<div class="form-row">
					<Textfield
						variant="outlined"
						type="number"
						bind:value={price}
						label={$t('createAd.form_price', { values: { symbol: $currencySymbol } })}
						required
					/>
					<Textfield
						variant="outlined"
						type="number"
						bind:value={capacity}
						label={$t('createAd.form_capacity')}
					/>
				</div>

				<div class="form-row">
					<Textfield
						variant="outlined"
						type="number"
						bind:value={duration_minutes}
						label={$t('createAd.form_duration')}
					/>
					<Textfield variant="outlined" bind:value={location} label={$t('createAd.form_location')} />
				</div>

				<div class="form-row">
					<Textfield
						variant="outlined"
						type="datetime-local"
						bind:value={starts_at}
						label={$t('createAd.form_starts_at')}
					/>
					<Textfield
						variant="outlined"
						type="datetime-local"
						bind:value={ends_at}
						label={$t('createAd.form_ends_at')}
					/>
				</div>

				<div class="picture-upload">
					<label class="picture-label">{$t('createAd.form_picture')}</label>
					{#if imagePreview || currentImageUrl}
						<img src={imagePreview || currentImageUrl} alt="Class preview" class="image-preview" />
					{/if}
					
					<div class="custom-file-upload">
						<input 
							type="file" 
							id="picture-upload-input"
							accept="image/*" 
							onchange={handleImageSelect} 
							class="file-input-hidden" 
						/>
						<Button type="button" variant="outlined" onclick={() => document.getElementById('picture-upload-input')?.click()}>
							<Label>{$t('createAd.choose_file')}</Label>
						</Button>
						<span class="file-name">
							{imageFile ? imageFile.name : $t('createAd.no_file_chosen')}
						</span>
					</div>
				</div>

				<div class="checkbox-container" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
					<Checkbox bind:checked={is_online} id="is_online_checkbox" />
					<label for="is_online_checkbox" style="color: var(--text-color); cursor: pointer;">{$t('createAd.form_is_online')}</label>
				</div>

				<div class="actions">
					{#if editingId}
						<Button type="button" variant="outlined" onclick={cancelEdit} class="cancel-btn">
							<Label>{$t('createAd.cancel')}</Label>
						</Button>
					{/if}
					<Button type="submit" variant="raised" class="premium-button" disabled={loading}>
						<Label
							>{loading
								? $t('createAd.form_submitting')
								: editingId
									? $t('createAd.form_update')
									: $t('createAd.form_submit')}</Label
						>
					</Button>
				</div>
			</form>
		</div>

		<!-- Right Side: Ads List -->
		<div class="list-section">
			<h2>{$t('createAd.my_ads')}</h2>
			{#if loadingClasses}
				<p>Loading...</p>
			{:else if classes.length === 0}
				<div class="empty-state">
					<span class="material-icons empty-icon">assignment</span>
					<p>{$t('createAd.no_ads')}</p>
				</div>
			{:else}
				<div class="ads-list">
					{#each classes as ad}
						<div class="ad-card" class:editing={editingId === ad.id}>
							{#if ad.image_url}
								<img src={`http://localhost:5000${ad.image_url}`} alt="Class" class="ad-thumbnail" />
							{/if}
							<div class="ad-info">
								<h3>{($locale === 'es' && ad.title_es) ? ad.title_es.charAt(0).toUpperCase() + ad.title_es.slice(1) : ad.title ? ad.title.charAt(0).toUpperCase() + ad.title.slice(1) : ''}</h3>
								<p class="ad-price">{$currencySymbol}{ad.price}</p>
								<div class="ad-meta">
									<span class="badge {ad.class_type}">{ad.class_type}</span>
									{#if ad.is_online}
										<span class="badge online">Online</span>
									{/if}
								</div>
							</div>
							<div class="ad-actions">
								<Button onclick={() => editClass(ad)} variant="outlined">
									<span class="material-icons">edit</span>
								</Button>
								<Button onclick={() => deleteClass(ad.id)} class="delete-btn">
									<span class="material-icons">delete</span>
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.manage-ads-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1rem;
	}
	.split-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: flex-start;
	}
	.form-section {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}
	.list-section {
		background: #fdfdfd;
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid #eee;
	}
	h1,
	h2 {
		color: var(--terciary-color);
		margin-top: 0;
	}
	h1 {
		margin-bottom: 0.5rem;
	}
	h2 {
		margin-bottom: 1.5rem;
		border-bottom: 2px solid var(--primary-color-soft);
		padding-bottom: 0.5rem;
	}
	.subtitle {
		color: #666;
		margin-bottom: 2rem;
	}
	.create-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.checkbox-container {
		margin-top: -0.5rem;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}
	.error-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--mdc-theme-error);
		background: #ffebee;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}
	.success-msg {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #2e7d32;
		background: #e8f5e9;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1.5rem;
	}
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #888;
	}
	.empty-icon {
		font-size: 3rem;
		opacity: 0.5;
		margin-bottom: 1rem;
	}
	.ads-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.ad-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		border: 1px solid #eee;
		transition: all 0.2s ease;
	}
	.ad-card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}
	.ad-card.editing {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
	}
	.ad-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: var(--terciary-color);
	}
	.ad-price {
		font-weight: bold;
		color: var(--primary-color);
		margin: 0 0 0.5rem 0;
	}
	.ad-meta {
		display: flex;
		gap: 0.5rem;
	}
	.badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: #eee;
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
	.badge.online {
		background: #e8f5e9;
		color: #2e7d32;
	}
	.ad-actions {
		display: flex;
		gap: 0.5rem;
	}
	.ad-thumbnail {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 4px;
		margin-right: 1rem;
	}
	.picture-upload {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.picture-label {
		font-weight: 500;
		color: #555;
	}
	.image-preview {
		width: 150px;
		height: 100px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #ccc;
	}
	.custom-file-upload {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	.file-input-hidden {
		display: none;
	}
	.file-name {
		font-size: 0.9rem;
		color: #666;
	}
	:global(.delete-btn) {
		color: #d32f2f !important;
	}

	@media (max-width: 900px) {
		.split-layout {
			grid-template-columns: 1fr;
		}
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
