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

	let notifications: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Users list for dropdown
	let users: any[] = $state([]);

	// Modals
	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentNotifId = $state(null);
	let formUserId = $state('');
	let formType = $state('admin_message');
	let formMessage = $state('');
	let formIsRead = $state(false);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchNotifications();
		await fetchUsers();
	});

	async function fetchNotifications() {
		try {
			loading = true;
			notifications = await fetchApi('/notifications/admin');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function fetchUsers() {
		try {
			users = await fetchApi('/admin/users');
		} catch (err) {
			console.error('Failed to fetch users:', err);
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentNotifId = null;
		formUserId = users.length > 0 ? users[0].id : '';
		formType = 'admin_message';
		formMessage = '';
		formIsRead = false;
		isModalOpen = true;
	}

	function openEditModal(notif: any) {
		isEditing = true;
		currentNotifId = notif.id;
		formUserId = notif.user_id;
		formType = notif.type;
		formMessage = notif.message;
		formIsRead = notif.is_read ? true : false;
		isModalOpen = true;
	}

	function openDeleteModal(notif: any) {
		currentNotifId = notif.id;
		isDeleteModalOpen = true;
	}

	async function saveNotification() {
		try {
			const endpoint = isEditing 
				? `/notifications/admin/${currentNotifId}`
				: `/notifications/admin`;
			
			const method = isEditing ? 'PUT' : 'POST';
			const body = {
				user_id: formUserId,
				type: formType,
				message: formMessage,
				is_read: formIsRead
			};

			await fetchApi(endpoint, {
				method,
				body: JSON.stringify(body)
			});

			isModalOpen = false;
			await fetchNotifications();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function deleteNotification() {
		try {
			await fetchApi(`/notifications/admin/${currentNotifId}`, {
				method: 'DELETE'
			});

			isDeleteModalOpen = false;
			await fetchNotifications();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.notif_title')} />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>{$t('admin.notif_title')}</h1>
			<p>{$t('admin.notif_subtitle')}</p>
		</div>
		<Button variant="raised" onclick={openCreateModal}>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">add</span>
			<Label>{$t('admin.notif_send')}</Label>
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
						<Cell>{$t('admin.notif_user')}</Cell>
						<Cell>{$t('admin.notif_type')}</Cell>
						<Cell>{$t('admin.notif_message')}</Cell>
						<Cell>{$t('admin.status')}</Cell>
						<Cell>{$t('admin.notif_date')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each notifications as notif}
						<Row>
							<Cell>{notif.id}</Cell>
							<Cell>
								<div style="display: flex; flex-direction: column;">
									<strong>{notif.username}</strong>
									<small style="color: #666;">{notif.email}</small>
								</div>
							</Cell>
							<Cell><span class="badge" style="background: #e3f2fd; color: #1565c0;">{notif.type}</span></Cell>
							<Cell>
								<div style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
									{notif.message}
								</div>
							</Cell>
							<Cell>
								<span class="badge {notif.is_read ? 'read' : 'unread'}">
									{notif.is_read ? $t('admin.notif_read') : $t('admin.notif_unread')}
								</span>
							</Cell>
							<Cell>{new Date(notif.created_at).toLocaleDateString()}</Cell>
							<Cell>
								<IconButton class="material-icons" onclick={() => openEditModal(notif)} aria-label="Edit">edit</IconButton>
								<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => openDeleteModal(notif)} aria-label="Delete">delete</IconButton>
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
	<Title id="form-title">{isEditing ? $t('admin.notif_edit_title') : $t('admin.notif_send_title')}</Title>
	<Content>
		<div class="form-container">
			{#if !isEditing}
				<div class="select-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>{$t('admin.notif_target_user')}</label>
					<Select bind:value={formUserId} style="width: 100%;">
						{#each users as user}
							<Option value={user.id}>{user.username} ({user.email})</Option>
						{/each}
					</Select>
				</div>
			{:else}
				<Textfield value={formUserId} label={$t('admin.notif_user')} disabled style="width: 100%;" />
			{/if}

			<div class="select-field">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>{$t('admin.notif_type_label')}</label>
				<Select bind:value={formType} style="width: 100%;">
					<Option value="admin_message">{$t('admin.notif_type_admin_message')}</Option>
					<Option value="system_alert">{$t('admin.notif_type_system_alert')}</Option>
					<Option value="booking_created">{$t('admin.notif_type_booking_created')}</Option>
					<Option value="booking_updated">{$t('admin.notif_type_booking_updated')}</Option>
					<Option value="subscription_updated">{$t('admin.notif_type_subscription_updated')}</Option>
				</Select>
			</div>

			<Textfield textarea bind:value={formMessage} label={$t('admin.notif_message_label')} style="width: 100%; height: 100px;" />
			
			{#if isEditing}
				<div class="select-field" style="margin-top: 1rem;">
					<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
						<input type="checkbox" bind:checked={formIsRead} style="width: 18px; height: 18px;" />
						{$t('admin.notif_mark_read')}
					</label>
				</div>
			{/if}
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={saveNotification}>
			<Label>{$t('admin.save')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title">
	<Title id="delete-title">{$t('admin.notif_delete_title')}</Title>
	<Content>
		{$t('admin.notif_delete_confirm')}
	</Content>
	<Actions>
		<Button onclick={() => (isDeleteModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" style="background-color: #d32f2f; color: white;" onclick={deleteNotification}>
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
	.unread { background: #ffebee; color: #c62828; }
	.read { background: #f5f5f5; color: #616161; }
	
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 1rem;
	}
	.select-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.select-field label {
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}
</style>
