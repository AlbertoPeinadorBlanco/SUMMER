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

	let coupons: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentCouponId = $state(null);
	let formShopName = $state('');
	let formDiscountText = $state('');
	let formCouponCode = $state('');
	let formImageUrl = $state('');
	let formLinkUrl = $state('');
	let formIsActive = $state(true);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchCoupons();
	});

	async function fetchCoupons() {
		try {
			loading = true;
			coupons = await fetchApi('/coupons/admin');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentCouponId = null;
		formShopName = '';
		formDiscountText = '';
		formCouponCode = '';
		formImageUrl = '';
		formLinkUrl = '';
		formIsActive = true;
		isModalOpen = true;
	}

	function openEditModal(coupon: any) {
		isEditing = true;
		currentCouponId = coupon.id;
		formShopName = coupon.shop_name;
		formDiscountText = coupon.discount_text;
		formCouponCode = coupon.coupon_code;
		formImageUrl = coupon.image_url || '';
		formLinkUrl = coupon.link_url || '';
		formIsActive = coupon.is_active ? true : false;
		isModalOpen = true;
	}

	function openDeleteModal(coupon: any) {
		currentCouponId = coupon.id;
		isDeleteModalOpen = true;
	}

	async function saveCoupon() {
		try {
			const endpoint = isEditing 
				? `/coupons/admin/${currentCouponId}`
				: `/coupons/admin`;
			
			const method = isEditing ? 'PUT' : 'POST';
			const body = {
				shop_name: formShopName,
				discount_text: formDiscountText,
				coupon_code: formCouponCode,
				image_url: formImageUrl,
				link_url: formLinkUrl,
				is_active: formIsActive
			};

			await fetchApi(endpoint, {
				method,
				body: JSON.stringify(body)
			});

			isModalOpen = false;
			await fetchCoupons();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function deleteCoupon() {
		try {
			await fetchApi(`/coupons/admin/${currentCouponId}`, {
				method: 'DELETE'
			});

			isDeleteModalOpen = false;
			await fetchCoupons();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.coupons_title')} />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>{$t('admin.coupons_title')}</h1>
			<p>{$t('admin.coupons_subtitle')}</p>
		</div>
		<Button variant="raised" onclick={openCreateModal}>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">add</span>
			<Label>{$t('admin.coupons_create')}</Label>
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
						<Cell>{$t('admin.coupons_image_url')}</Cell>
						<Cell>{$t('admin.coupons_shop_name')}</Cell>
						<Cell>{$t('admin.coupons_discount_text')}</Cell>
						<Cell>{$t('admin.coupons_code')}</Cell>
						<Cell>{$t('admin.coupons_active')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each coupons as coupon}
						<Row>
							<Cell>{coupon.id}</Cell>
							<Cell>
								{#if coupon.image_url}
									<img src={coupon.image_url} alt={coupon.shop_name} style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
								{:else}
									<div style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
										<span class="material-icons" style="color: #999;">image</span>
									</div>
								{/if}
							</Cell>
							<Cell>
								<strong>{coupon.shop_name}</strong><br>
								{#if coupon.link_url}
									<a href={coupon.link_url} target="_blank" style="font-size: 0.8rem; color: #1976d2;">{coupon.link_url}</a>
								{/if}
							</Cell>
							<Cell>{coupon.discount_text}</Cell>
							<Cell><strong>{coupon.coupon_code}</strong></Cell>
							<Cell>
								<span class="badge {coupon.is_active ? 'active' : 'inactive'}">
									{coupon.is_active ? $t('admin.coupons_active') : $t('admin.coupons_inactive')}
								</span>
							</Cell>
							<Cell>
								<IconButton class="material-icons" onclick={() => openEditModal(coupon)} aria-label="Edit Coupon">edit</IconButton>
								<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => openDeleteModal(coupon)} aria-label="Delete Coupon">delete</IconButton>
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
	<Title id="form-title">{isEditing ? $t('admin.coupons_edit_title') : $t('admin.coupons_create_title')}</Title>
	<Content>
		<div class="form-container">
			<Textfield bind:value={formShopName} label={$t('admin.coupons_shop_name_label')} style="width: 100%;" />
			<Textfield bind:value={formDiscountText} label={$t('admin.coupons_discount_text_label')} style="width: 100%;" />
			<Textfield bind:value={formCouponCode} label={$t('admin.coupons_code_label')} style="width: 100%;" />
			<Textfield bind:value={formImageUrl} label={$t('admin.coupons_image_url')} style="width: 100%;" />
			<Textfield bind:value={formLinkUrl} label={$t('admin.coupons_link_url')} style="width: 100%;" />
			
			<div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
				<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
					<input type="checkbox" bind:checked={formIsActive} style="width: 18px; height: 18px;" />
					{$t('admin.coupons_is_active_label')}
				</label>
			</div>
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={saveCoupon}>
			<Label>{$t('admin.save')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title">
	<Title id="delete-title">{$t('admin.coupons_delete_title')}</Title>
	<Content>
		{$t('admin.coupons_delete_confirm')}
	</Content>
	<Actions>
		<Button onclick={() => (isDeleteModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" style="background-color: #d32f2f; color: white;" onclick={deleteCoupon}>
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
</style>
