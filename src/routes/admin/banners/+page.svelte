<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';

	let banners: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentBannerId = $state(null);
	let formTitle = $state('');
	let formPlacement = $state('home_top');
	let formLinkUrl = $state('');
	let formIsActive = $state(true);
	let formImageFile = $state(null);
	let fileInput: HTMLInputElement | undefined;

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchBanners();
	});

	async function fetchBanners() {
		try {
			loading = true;
			banners = await fetchApi('/banners');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentBannerId = null;
		formTitle = '';
		formPlacement = 'home_top';
		formLinkUrl = '';
		formIsActive = true;
		formImageFile = null;
		if (fileInput) fileInput.value = '';
		isModalOpen = true;
	}

	function openEditModal(banner: any) {
		isEditing = true;
		currentBannerId = banner.id;
		formTitle = banner.title;
		formPlacement = banner.placement;
		formLinkUrl = banner.link_url;
		formIsActive = banner.is_active ? true : false;
		formImageFile = null;
		if (fileInput) fileInput.value = '';
		isModalOpen = true;
	}

	function openDeleteModal(banner: any) {
		currentBannerId = banner.id;
		isDeleteModalOpen = true;
	}

	function handleFileChange(event: any) {
		const file = event.target.files[0];
		if (file) {
			formImageFile = file;
		}
	}

	async function saveBanner() {
		try {
			if (!isEditing && !formImageFile) {
				throw new Error('Image file is required when creating a new banner.');
			}

			const endpoint = isEditing 
				? `/banners/${currentBannerId}`
				: `/banners`;
			
			const method = isEditing ? 'PUT' : 'POST';
			
			const formData = new FormData();
			formData.append('title', formTitle);
			formData.append('placement', formPlacement);
			formData.append('link_url', formLinkUrl);
			formData.append('is_active', formIsActive ? 'true' : 'false');
			if (formImageFile) {
				formData.append('image', formImageFile);
			}

			await fetchApi(endpoint, {
				method,
				body: formData
			});

			isModalOpen = false;
			await fetchBanners();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function deleteBanner() {
		try {
			await fetchApi(`/banners/${currentBannerId}`, {
				method: 'DELETE'
			});

			isDeleteModalOpen = false;
			await fetchBanners();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title="Manage Banners" />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>Manage Site Banners</h1>
			<p>Upload and place promotional banners across the site.</p>
		</div>
		<Button variant="raised" onclick={openCreateModal}>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">add</span>
			<Label>Create Banner</Label>
		</Button>
	</div>

	{#if loading}
		<p>Loading banners...</p>
	{:else if error}
		<p class="error">Error fetching banners: {error}</p>
	{:else}
		<div class="table-container">
			<DataTable style="width: 100%;">
				<Head>
					<Row>
						<Cell>ID</Cell>
						<Cell>Image</Cell>
						<Cell>Title</Cell>
						<Cell>Placement</Cell>
						<Cell>Status</Cell>
						<Cell>Actions</Cell>
					</Row>
				</Head>
				<Body>
					{#each banners as banner}
						<Row>
							<Cell>{banner.id}</Cell>
							<Cell>
								{#if banner.image_url}
									<img src={`http://127.0.0.1:5000${banner.image_url}`} alt={banner.title} style="width: auto; height: 50px; max-width: 150px; object-fit: contain; border-radius: 4px;" />
								{:else}
									<div style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
										<span class="material-icons" style="color: #999;">image</span>
									</div>
								{/if}
							</Cell>
							<Cell>
								<strong>{banner.title}</strong><br>
								<a href={banner.link_url} target="_blank" style="font-size: 0.8rem; color: #1976d2;">{banner.link_url}</a>
							</Cell>
							<Cell>
								<span class="badge" style="background: #e3f2fd; color: #1565c0;">{banner.placement}</span>
							</Cell>
							<Cell>
								<span class="badge {banner.is_active ? 'active' : 'inactive'}">
									{banner.is_active ? 'Active' : 'Inactive'}
								</span>
							</Cell>
							<Cell>
								<IconButton class="material-icons" onclick={() => openEditModal(banner)} aria-label="Edit Banner">edit</IconButton>
								<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => openDeleteModal(banner)} aria-label="Delete Banner">delete</IconButton>
							</Cell>
						</Row>
					{/each}
				</Body>
			</DataTable>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
<Dialog bind:open={isModalOpen} aria-labelledby="form-title">
	<Title id="form-title">{isEditing ? 'Edit Banner' : 'Create Banner'}</Title>
	<Content>
		<div class="form-container">
			<Textfield bind:value={formTitle} label="Banner Title" style="width: 100%;" />
			<Textfield bind:value={formLinkUrl} label="Link URL" style="width: 100%;" />
			
			<div class="select-field">
				<Select bind:value={formPlacement} label="Placement" style="width: 100%;">
					<Option value="home_top">Home Page Top</Option>
					<Option value="home_bottom">Home Page Bottom</Option>
					<Option value="marketplace_top">Marketplace Top</Option>
					<Option value="marketplace_sidebar">Marketplace Sidebar</Option>
					<Option value="gear_guide_bottom">Gear Guide Bottom</Option>
					<Option value="instructors_top">Instructors List Top</Option>
				</Select>
			</div>

			<div class="file-field">
				<label for="banner-image-upload">Banner Image {isEditing ? '(Optional, leave blank to keep current)' : ''}</label>
				<input id="banner-image-upload" type="file" accept="image/*" onchange={handleFileChange} bind:this={fileInput} />
			</div>

			<div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
				<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
					<input type="checkbox" bind:checked={formIsActive} style="width: 18px; height: 18px;" />
					Active
				</label>
			</div>
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isModalOpen = false)}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" onclick={saveBanner}>
			<Label>Save</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title">
	<Title id="delete-title">Delete Banner</Title>
	<Content>
		Are you sure you want to permanently delete this banner? This action cannot be undone.
	</Content>
	<Actions>
		<Button onclick={() => (isDeleteModalOpen = false)}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" style="background-color: #d32f2f; color: white;" onclick={deleteBanner}>
			<Label>Delete</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.header h1 {
		margin: 0;
		color: #0d1b2a;
		font-size: 2.5rem;
		font-weight: 800;
	}
	.header p {
		margin: 0.5rem 0 0;
		color: #415a77;
	}
	.table-container {
		background: var(--surface-color);
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
		overflow: hidden;
	}
	.badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: bold;
		text-transform: uppercase;
	}
	.active { background: #e8f5e9; color: #2e7d32; }
	.inactive { background: #ffebee; color: #c62828; }
	
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 1rem;
	}

	.select-field, .file-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.select-field label, .file-field label {
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}
</style>
