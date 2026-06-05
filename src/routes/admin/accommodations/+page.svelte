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

	let items: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentId = $state(null);
	let formName = $state('');
	let formType = $state('type_surfhouse');
	let formLocation = $state('');
	let formImageUrl = $state('');
	let formDescEn = $state('');
	let formDescEs = $state('');
	let formLink = $state('');
	let formSubmitting = $state(false);

	let itemToDelete = $state<any>(null);

	onMount(async () => {
		if (!$auth.isAuthenticated) {
			goto('/login');
			return;
		}
		if ($auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		loadItems();
	});

	async function loadItems() {
		try {
			loading = true;
			items = await fetchApi('/accommodations');
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentId = null;
		formName = '';
		formType = 'type_surfhouse';
		formLocation = '';
		formImageUrl = '';
		formDescEn = '';
		formDescEs = '';
		formLink = '';
		isModalOpen = true;
	}

	function openEditModal(item: any) {
		isEditing = true;
		currentId = item.id;
		formName = item.name;
		formType = item.type;
		formLocation = item.location;
		formImageUrl = item.image_url;
		formDescEn = item.description_en;
		formDescEs = item.description_es;
		formLink = item.link;
		isModalOpen = true;
	}

	function confirmDelete(item: any) {
		itemToDelete = item;
		isDeleteModalOpen = true;
	}

	async function saveItem() {
		if (!formName || !formLocation) return;
		
		formSubmitting = true;
		try {
			const payload = {
				name: formName,
				type: formType,
				location: formLocation,
				image_url: formImageUrl,
				description_en: formDescEn,
				description_es: formDescEs,
				link: formLink
			};

			if (isEditing) {
				await fetchApi(`/accommodations/${currentId}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
			} else {
				await fetchApi('/accommodations', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
			}
			isModalOpen = false;
			loadItems();
		} catch (e: any) {
			alert('Error saving: ' + e.message);
		} finally {
			formSubmitting = false;
		}
	}

	async function executeDelete() {
		if (!itemToDelete) return;
		try {
			await fetchApi(`/accommodations/${itemToDelete.id}`, { method: 'DELETE' });
			isDeleteModalOpen = false;
			loadItems();
		} catch (e: any) {
			alert('Error deleting: ' + e.message);
		}
	}
</script>

<SEO title="Manage Accommodations | Admin" description="Admin dashboard for accommodations" />

<div class="page-container">
	<div class="header-row">
		<div>
			<h1>Manage Accommodations</h1>
			<p class="subtitle">Add, edit or remove campings and surf houses.</p>
		</div>
		<Button variant="raised" onclick={openCreateModal} class="premium-button">
			<span class="material-icons" style="margin-right: 8px;">add</span>
			Add Accommodation
		</Button>
	</div>

	{#if loading}
		<div style="display: flex; justify-content: center; padding: 3rem;">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="error-card">{error}</div>
	{:else}
		<div class="table-container">
			<DataTable style="width: 100%;">
				<Head>
					<Row>
						<Cell>ID</Cell>
						<Cell>Name</Cell>
						<Cell>Type</Cell>
						<Cell>Location</Cell>
						<Cell>Actions</Cell>
					</Row>
				</Head>
				<Body>
					{#each items as item}
						<Row>
							<Cell>{item.id}</Cell>
							<Cell><strong>{item.name}</strong></Cell>
							<Cell>{item.type}</Cell>
							<Cell>{item.location}</Cell>
							<Cell>
								<div class="actions-cell">
									<IconButton class="material-icons" onclick={() => openEditModal(item)} title="Edit">edit</IconButton>
									<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => confirmDelete(item)} title="Delete">delete</IconButton>
								</div>
							</Cell>
						</Row>
					{/each}
					{#if items.length === 0}
						<Row>
							<Cell colspan={5} style="text-align: center; padding: 2rem;">No accommodations found.</Cell>
						</Row>
					{/if}
				</Body>
			</DataTable>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
<Dialog bind:open={isModalOpen} aria-labelledby="form-title" aria-describedby="form-content">
	<Title id="form-title">{isEditing ? 'Edit Accommodation' : 'Add Accommodation'}</Title>
	<Content id="form-content">
		<div class="form-grid">
			<Textfield variant="outlined" bind:value={formName} label="Name" style="width: 100%;" required />
			
			<div style="margin-top: 1rem; width: 100%;">
				<Select variant="outlined" bind:value={formType} label="Type" style="width: 100%;">
					<Option value="type_surfhouse">Surf House</Option>
					<Option value="type_camping">Camping</Option>
					<Option value="type_hostel">Hostel</Option>
				</Select>
			</div>

			<Textfield variant="outlined" bind:value={formLocation} label="Location (e.g. Salinas, Asturias)" style="width: 100%;" required />
			<Textfield variant="outlined" bind:value={formImageUrl} label="Image URL" style="width: 100%;" />
			<Textfield variant="outlined" bind:value={formLink} label="Website/Booking Link" style="width: 100%;" />
			
			<Textfield variant="outlined" textarea bind:value={formDescEn} label="Description (EN)" style="width: 100%; margin-top: 1rem;" />
			<Textfield variant="outlined" textarea bind:value={formDescEs} label="Description (ES)" style="width: 100%; margin-top: 1rem;" />
		</div>
	</Content>
	<Actions>
		<Button onclick={() => isModalOpen = false}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" onclick={saveItem} disabled={formSubmitting || !formName || !formLocation} class="premium-button">
			<Label>{formSubmitting ? 'Saving...' : 'Save'}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Confirmation Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title" aria-describedby="delete-content">
	<Title id="delete-title">Delete Accommodation</Title>
	<Content id="delete-content">
		Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
	</Content>
	<Actions>
		<Button onclick={() => isDeleteModalOpen = false}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" onclick={executeDelete} style="background-color: #d32f2f; color: white;">
			<Label>Delete</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}
	h1 {
		color: var(--terciary-color);
		margin: 0 0 0.5rem 0;
	}
	.subtitle {
		color: var(--text-color);
		opacity: 0.8;
		margin: 0;
	}
	.table-container {
		background: var(--surface-color);
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
		overflow: hidden;
	}
	.error-card {
		background: #ffebee;
		color: #d32f2f;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}
	.actions-cell {
		display: flex;
		gap: 0.5rem;
	}
	.form-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0.5rem 0;
		min-width: 400px;
	}
	@media (max-width: 600px) {
		.form-grid {
			min-width: 100%;
		}
	}
	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border-left-color: var(--primary-color);
		animation: spin 1s linear infinite;
	}
	@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
