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

	let pricings: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isModalOpen = $state(false);
	
	// Form state
	let currentPricingKey = $state('');
	let formPrice = $state(0);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchPricings();
	});

	async function fetchPricings() {
		try {
			loading = true;
			pricings = await fetchApi('/pricings');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openEditModal(pricing: any) {
		currentPricingKey = pricing.item_key;
		formPrice = pricing.price;
		isModalOpen = true;
	}

	async function savePricing() {
		try {
			await fetchApi(`/pricings/admin/${currentPricingKey}`, {
				method: 'PUT',
				body: JSON.stringify({ price: formPrice })
			});

			isModalOpen = false;
			await fetchPricings();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.pricings_title')} />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>{$t('admin.pricings_title')}</h1>
			<p>{$t('admin.pricings_subtitle')}</p>
		</div>
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
						<Cell>{$t('admin.pricings_item_key')}</Cell>
						<Cell>{$t('admin.pricings_description')}</Cell>
						<Cell>{$t('admin.price')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each pricings as pricing}
						<Row>
							<Cell>{pricing.id}</Cell>
							<Cell><span class="badge" style="background: #e8f5e9; color: #2e7d32;">{pricing.item_key}</span></Cell>
							<Cell>{pricing.description}</Cell>
							<Cell>
								<strong>{pricing.price} {pricing.currency}</strong>
							</Cell>
							<Cell>
								<IconButton class="material-icons" onclick={() => openEditModal(pricing)} aria-label="Edit Price">edit</IconButton>
							</Cell>
						</Row>
					{/each}
				</Body>
			</DataTable>
		</div>
	{/if}
</div>

<!-- Edit Modal -->
<Dialog bind:open={isModalOpen} aria-labelledby="form-title">
	<Title id="form-title">{$t('admin.pricings_edit_title')}: {currentPricingKey}</Title>
	<Content>
		<div class="form-container">
			<Textfield bind:value={formPrice} label={$t('admin.pricings_price_label')} type="number" step="0.01" style="width: 100%;" />
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={savePricing}>
			<Label>{$t('admin.save')}</Label>
		</Button>
	</Actions>
</Dialog>

<style>
	.admin-container {
		max-width: 1000px;
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
	}
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 1rem;
	}
</style>
