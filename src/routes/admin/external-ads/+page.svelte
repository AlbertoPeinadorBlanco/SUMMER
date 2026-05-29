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
	import IconButton from '@smui/icon-button';

	let ads: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentAdId = $state(null);
	let formShopName = $state('');
	let formLocation = $state('');
	let formImageUrl = $state('');
	let formLinkUrl = $state('');
	let formIsActive = $state(true);
	let formDisplayOrder = $state(0);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchAds();
	});

	async function fetchAds() {
		try {
			loading = true;
			ads = await fetchApi('/ads/admin');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentAdId = null;
		formShopName = '';
		formLocation = '';
		formImageUrl = '';
		formLinkUrl = '';
		formIsActive = true;
		formDisplayOrder = 0;
		isModalOpen = true;
	}

	function openEditModal(ad: any) {
		isEditing = true;
		currentAdId = ad.id;
		formShopName = ad.shop_name;
		formLocation = ad.location;
		formImageUrl = ad.image_url || '';
		formLinkUrl = ad.link_url;
		formIsActive = ad.is_active ? true : false;
		formDisplayOrder = ad.display_order || 0;
		isModalOpen = true;
	}

	function openDeleteModal(ad: any) {
		currentAdId = ad.id;
		isDeleteModalOpen = true;
	}

	async function saveAd() {
		try {
			const endpoint = isEditing 
				? `/ads/admin/${currentAdId}`
				: `/ads/admin`;
			
			const method = isEditing ? 'PUT' : 'POST';
			const body = {
				shop_name: formShopName,
				location: formLocation,
				image_url: formImageUrl,
				link_url: formLinkUrl,
				is_active: formIsActive,
				display_order: parseInt(formDisplayOrder as any) || 0
			};

			await fetchApi(endpoint, {
				method,
				body: JSON.stringify(body)
			});

			isModalOpen = false;
			await fetchAds();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function deleteAd() {
		try {
			await fetchApi(`/ads/admin/${currentAdId}`, {
				method: 'DELETE'
			});

			isDeleteModalOpen = false;
			await fetchAds();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.ext_ads_title')} />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>{$t('admin.ext_ads_title')}</h1>
			<p>{$t('admin.ext_ads_subtitle')}</p>
		</div>
		<Button variant="raised" onclick={openCreateModal}>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">add</span>
			<Label>{$t('admin.ext_ads_create')}</Label>
		</Button>
	</div>

	{#if loading}
		<p>{$t('admin.loading')}</p>
	{:else if error}
		<p class="error">{$t('admin.error_fetching')}: {error}</p>
	{:else}
		<div class="table-container">
			<DataTable style="width: 100%;">
				<Head>
					<Row>
						<Cell>{$t('admin.id')}</Cell>
						<Cell>Order</Cell>
						<Cell>{$t('admin.ext_ads_image')}</Cell>
						<Cell>{$t('admin.ext_ads_shop_name')}</Cell>
						<Cell>{$t('admin.ext_ads_location')}</Cell>
						<Cell>{$t('admin.ext_ads_status')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each ads as ad}
						<Row>
							<Cell>{ad.id}</Cell>
							<Cell><strong style="color: var(--primary-color); font-size: 1.1rem;">{ad.display_order}</strong></Cell>
							<Cell>
								{#if ad.image_url}
									<img src={ad.image_url} alt={ad.shop_name} style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
								{:else}
									<div style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
										<span class="material-icons" style="color: #999;">image</span>
									</div>
								{/if}
							</Cell>
							<Cell>
								<strong>{ad.shop_name}</strong><br>
								<a href={ad.link_url} target="_blank" style="font-size: 0.8rem; color: #1976d2;">{ad.link_url}</a>
							</Cell>
							<Cell>{ad.location}</Cell>
							<Cell>
								<span class="badge {ad.is_active ? 'active' : 'inactive'}">
									{ad.is_active ? $t('admin.ext_ads_active') : $t('admin.ext_ads_inactive')}
								</span>
							</Cell>
							<Cell>
								<IconButton class="material-icons" onclick={() => openEditModal(ad)} aria-label="Edit Advert">edit</IconButton>
								<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => openDeleteModal(ad)} aria-label="Delete Advert">delete</IconButton>
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
	<Title id="form-title">{isEditing ? $t('admin.ext_ads_edit_title') : $t('admin.ext_ads_create_title')}</Title>
	<Content>
		<div class="form-container">
			<Textfield bind:value={formShopName} label={$t('admin.ext_ads_shop_name_label')} style="width: 100%;" />
			<Textfield bind:value={formLocation} label={$t('admin.ext_ads_location_label')} style="width: 100%;" />
			<Textfield bind:value={formImageUrl} label={$t('admin.ext_ads_image_url_label')} style="width: 100%;" />
			<Textfield bind:value={formLinkUrl} label={$t('admin.ext_ads_link_url_label')} style="width: 100%;" />
			
			<div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
				<Textfield type="number" bind:value={formDisplayOrder} label="Display Order (0 is first)" style="width: 200px;" />
				<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
					<input type="checkbox" bind:checked={formIsActive} style="width: 18px; height: 18px;" />
					{$t('admin.ext_ads_is_active_label')}
				</label>
			</div>
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={saveAd}>
			<Label>{$t('admin.save')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title">
	<Title id="delete-title">{$t('admin.ext_ads_delete_title')}</Title>
	<Content>
		{$t('admin.ext_ads_delete_confirm')}
	</Content>
	<Actions>
		<Button onclick={() => (isDeleteModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" style="background-color: #d32f2f; color: white;" onclick={deleteAd}>
			<Label>{$t('admin.delete')}</Label>
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
		background: white;
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
</style>
