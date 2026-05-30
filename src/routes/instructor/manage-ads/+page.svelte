<script lang="ts">
	import Textfield from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Checkbox from '@smui/checkbox';
	import Select, { Option } from '@smui/select';
	import FormField from '@smui/form-field';
	import Dialog, { Title, Content as DialogContent, Actions, InitialFocus } from '@smui/dialog';
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
	let sport_type = $state('surf');
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
	let difficulty_level = $state('1');

	let imageFile: File | null = $state(null);
	let imagePreview = $state('');
	let currentImageUrl = $state('');

	let loading = $state(false);
	let error = $state('');
	let successMsg = $state('');

	let pupilsDialog = $state(false);
	let selectedAdForPupils: any = $state(null);
	let currentPupils: any[] = $state([]);
	let loadingPupils = $state(false);

	let totalEarnings = $derived(
		classes.reduce((sum, ad) => sum + (parseFloat(ad.price) * (ad.bookings_count || 0)), 0)
	);
	
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
			const data = await fetchApi(`/classes?instructor_id=${user?.id}`);
			classes = Array.isArray(data) ? data : [];
		} catch (err: any) {
			console.error('Error loading classes:', err);
		} finally {
			loadingClasses = false;
		}
	}

	async function updatePupilStatus(bookingId: string | number, statusId: number) {
		try {
			await fetchApi(`/bookings/${bookingId}/status`, {
				method: 'PUT',
				body: JSON.stringify({ status_id: statusId })
			});
			
			// Refresh pupils list
			if (selectedAdForPupils) {
				const data = await fetchApi(`/bookings/class/${selectedAdForPupils.id}`);
				currentPupils = Array.isArray(data) ? data : [];
			}
		} catch (err: any) {
			console.error("Failed to update status:", err);
			alert("Failed to update status");
		}
	}

	function editClass(c: any) {
		editingId = c.id;
		class_type_id = (c.class_type === 'course' || c.class_type === 'curso') ? '2' : '1';
		sport_type = c.sport_type || 'surf';
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
		difficulty_level = c.difficulty_level ? c.difficulty_level.toString() : '1';
		currentImageUrl = c.image_url ? `http://127.0.0.1:5000${c.image_url}` : '';
		imageFile = null;
		imagePreview = '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editingId = null;
		class_type_id = '1';
		sport_type = 'surf';
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
		difficulty_level = '1';
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

	async function boostAdvert(classId: number) {
		try {
			const res = await fetchApi('/stripe/create-checkout-session', {
				method: 'POST',
				body: JSON.stringify({ item_key: 'bump_advert', class_id: classId })
			});
			if (res.url) {
				window.location.href = res.url;
			}
		} catch (err: any) {
			alert('Failed to initiate checkout: ' + err.message);
		}
	}

	async function openPupilsDialog(ad: any) {
		selectedAdForPupils = ad;
		pupilsDialog = true;
		loadingPupils = true;
		currentPupils = [];
		try {
			currentPupils = await fetchApi(`/bookings/class/${ad.id}`);
		} catch (err) {
			console.error("Error fetching pupils", err);
		} finally {
			loadingPupils = false;
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
				sport_type,
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
				is_online: is_online ? 1 : 0,
				difficulty_level: parseInt(difficulty_level, 10) || 1
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
	<div class="guide-banner">
		<div class="guide-banner-content">
			<span class="material-icons guide-icon">school</span>
			<div>
				<strong>{$t('manageAds.guide_banner_title')}</strong>
				<p>{$t('manageAds.guide_banner_desc')}</p>
			</div>
		</div>
		<Button variant="outlined" href="/instructor-guide" class="guide-btn">
			<Label>{$t('manageAds.guide_banner_btn')}</Label>
		</Button>
	</div>

	<div class="split-layout">
		<!-- Left Side: Form -->
		<div class="form-section">
			<h1>{editingId ? $t('createAd.form_update') : $t('createAd.title')}</h1>
			<p class="subtitle">{$t('createAd.subtitle')}</p>

			{#if error}
				<div class="error-msg">
					<span class="material-icons">error</span>
					<p>{error}</p>
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
					<Select
						variant="outlined"
						bind:value={sport_type}
						label={$t('sports.filter_sport')}
						style="width: 100%;"
					>
						<Option value="surf">{$t('sports.surf')}</Option>
						<Option value="windsurf">{$t('sports.windsurf')}</Option>
						<Option value="paddle">{$t('sports.paddle')}</Option>
						<Option value="kayak">{$t('sports.kayak')}</Option>
						<Option value="snorkel">{$t('sports.snorkel')}</Option>
						<Option value="other">{$t('sports.other')}</Option>
					</Select>
				</div>
				<div class="form-row">
					<Select
						variant="outlined"
						bind:value={difficulty_level}
						label={$t('createAd.form_difficulty')}
						style="width: 100%;"
					>
						{#each Array.from({ length: 9 }) as _, i}
							<Option value={(i + 1).toString()}>{$t(`levels.level_${i + 1}_title`)}</Option>
						{/each}
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
						input$min="0"
						input$step="0.01"
						style="width: 100%;"
					/>
					<Textfield
						variant="outlined"
						type="number"
						bind:value={capacity}
						label={$t('createAd.form_capacity')}
						required
						input$min="1"
						style="width: 100%;"
					/>
				</div>

				<div class="form-row">
					<Textfield
						variant="outlined"
						type="number"
						bind:value={duration_minutes}
						label={$t('createAd.form_duration')}
						required
						input$min="10"
						style="width: 100%;"
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
		<div class="sidebar">
			<div class="earnings-summary">
				<h3>{$t('manageAds.total_earnings')}</h3>
				<div class="earnings-amount">{$currencySymbol}{totalEarnings}</div>
			</div>

			<h2>{$t('manageAds.my_ads')}</h2>
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
							<div class="ad-card-top">
								{#if ad.image_url}
									<img src={`http://127.0.0.1:5000${ad.image_url}`} alt="Class" class="ad-thumbnail" />
								{/if}
								<div class="ad-info">
									<h3>{($locale === 'es' && ad.title_es) ? ad.title_es.charAt(0).toUpperCase() + ad.title_es.slice(1) : ad.title ? ad.title.charAt(0).toUpperCase() + ad.title.slice(1) : ''}</h3>
									<p class="ad-price">{$currencySymbol}{ad.price}</p>
									<div class="ad-meta">
										<span class="badge {ad.class_type}">{ad.class_type}</span>
										<span class="badge sport">{ad.sport_type ? $t(`sports.${ad.sport_type}`) : $t('sports.surf')}</span>
										<span class="badge level">Level {ad.difficulty_level || 1}</span>
										{#if ad.is_online}
											<span class="badge online">Online</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="ad-card-bottom">
								<div class="ad-earnings">
									<span class="material-icons" aria-hidden="true">payments</span>
									<span>{$t('manageAds.earnings')}: <strong>{$currencySymbol}{parseFloat(ad.price) * (ad.bookings_count || 0)}</strong></span>
									<span class="bookings-count">({ad.bookings_count || 0} {$t('manageAds.bookings')})</span>
								</div>
								<div class="ad-actions">
									<Button variant="outlined" onclick={() => boostAdvert(ad.id)} style="border-color: #FFD700; color: #b89b00; margin-right: 8px;">
										<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">rocket_launch</span>
										<Label>Boost (2€)</Label>
									</Button>
									<Button variant="outlined" onclick={() => editClass(ad)}>
										<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">edit</span>
										<Label>{$t('manageAds.edit')}</Label>
									</Button>
									<Button variant="outlined" onclick={() => openPupilsDialog(ad)} style="margin-left: 8px;">
										<span class="material-icons" aria-hidden="true" style="margin-right: 4px;">group</span>
										<Label>{$t('manageAds.view_pupils')}</Label>
									</Button>
									<Button onclick={() => deleteClass(ad.id)} class="delete-btn" style="margin-left: 8px;">
										<span class="material-icons">delete</span>
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<Dialog bind:open={pupilsDialog} aria-labelledby="pupils-title" aria-describedby="pupils-desc">
	<Title id="pupils-title">{$t('manageAds.pupils_for')} {selectedAdForPupils?.title}</Title>
	<DialogContent id="pupils-desc">
		{#if loadingPupils}
			<p>Loading...</p>
		{:else if currentPupils.length === 0}
			<p>{$t('manageAds.no_pupils')}</p>
		{:else}
			<ul class="pupils-list">
				{#each currentPupils as pupil}
					<li class="pupil-item">
						<div class="pupil-avatar">
							{#if pupil.profile_picture_url}
								<img src={`http://127.0.0.1:5000${pupil.profile_picture_url}`} alt={pupil.first_name} />
							{:else}
								<span class="material-icons" aria-hidden="true">person</span>
							{/if}
						</div>
						<div class="pupil-info">
							<strong>{pupil.first_name} {pupil.last_name}</strong>
							<div class="pupil-contact">
								<span class="material-icons" aria-hidden="true">email</span> {pupil.email}
							</div>
							{#if pupil.phone}
								<div class="pupil-contact">
									<span class="material-icons" aria-hidden="true">phone</span> {pupil.phone}
								</div>
							{/if}
							<div class="pupil-date">
								{$t('manageAds.booked_on')}: {new Date(pupil.booked_at).toLocaleDateString()}
								<span class="status-badge status-{pupil.status}" style="margin-left: 8px;">{pupil.status}</span>
							</div>
							{#if pupil.status === 'pending'}
								<div class="pupil-actions" style="margin-top: 8px;">
									<Button variant="outlined" onclick={() => updatePupilStatus(pupil.id, 2)} style="margin-right: 8px; border-color: #2e7d32; color: #2e7d32;">
										<Label>{$t('manageAds.approve')}</Label>
									</Button>
									<Button variant="outlined" onclick={() => updatePupilStatus(pupil.id, 3)} style="border-color: #c62828; color: #c62828;">
										<Label>{$t('manageAds.reject')}</Label>
									</Button>
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</DialogContent>
	<Actions>
		<Button variant="outlined" use={[InitialFocus]}>
			<Label>{$t('manageAds.close')}</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.manage-ads-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.guide-banner {
		background: linear-gradient(135deg, var(--primary-color-soft) 0%, var(--primary-color) 100%);
		color: white;
		padding: 1.5rem 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.guide-banner-content {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.guide-icon {
		font-size: 32px;
	}

	.guide-banner-content p {
		margin: 0.25rem 0 0 0;
		opacity: 0.9;
	}

	:global(.guide-btn) {
		color: white !important;
		border-color: rgba(255,255,255,0.5) !important;
		white-space: nowrap;
	}

	:global(.guide-btn:hover) {
		background-color: rgba(255,255,255,0.1) !important;
	}

	.split-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: flex-start;
	}
	.form-section {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}
	.sidebar {
		background: var(--surface-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}
	.earnings-summary {
		background: var(--background-color);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
		border: 1px solid var(--primary-color-soft);
	}
	.earnings-summary h3 {
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		font-size: 1.1rem;
	}
	.earnings-amount {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--primary-color);
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
	.ad-earnings {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		color: var(--terciary-color);
	}

	.ad-earnings .material-icons {
		color: var(--primary-color);
		font-size: 1.5rem;
	}

	.bookings-count {
		color: #888;
		font-size: 0.9rem;
		margin-left: 0.5rem;
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
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--surface-color);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(226, 109, 63, 0.08);
		border: 1px solid var(--border-color);
		transition: all 0.2s ease;
	}
	.ad-card-top {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}
	.ad-card-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid #f0f0f0;
		padding-top: 1.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.ad-card:hover {
		box-shadow: 0 6px 16px rgba(226, 109, 63, 0.15);
		transform: translateY(-2px);
	}
	.ad-card.editing {
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
	}
	.ad-info {
		flex: 1;
	}
	.ad-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: var(--terciary-color);
	}
	.ad-price {
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--primary-color);
		margin: 0 0 0.5rem 0;
	}
	.ad-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.badge {
		font-size: 0.75rem;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		background: #eee;
		text-transform: uppercase;
		font-weight: bold;
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
	.ad-actions {
		display: flex;
		gap: 0.5rem;
	}
	.ad-thumbnail {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 8px;
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

	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
		text-transform: uppercase;
	}
	.status-pending { background: #fff3e0; color: #e65100; }
	.status-confirmed { background: #e8f5e9; color: #2e7d32; }
	.status-cancelled { background: #ffebee; color: #c62828; }
	.status-completed { background: #e3f2fd; color: #1565c0; }
</style>
