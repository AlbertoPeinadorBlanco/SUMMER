<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';

	let users = $state([]);
	let loading = $state(true);
	let error = $state(null);

	// Modals
	let isCreateEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isDetailsModalOpen = $state(false);
	
	// Details state
	let activeTab = $state('profile');
	let detailsData = $state(null);
	let detailsLoading = $state(false);

	// Inner CRUD Modals (Bookings & Adverts)
	let isInnerModalOpen = $state(false);
	let innerModalType = $state('booking'); // 'booking' or 'advert'
	let innerModalMode = $state('create'); // 'create' or 'edit'
	
	// Inner Modal Form Data
	let innerId = $state(null);
	let bookingClassId = $state('');
	let bookingStatusId = $state(1);
	
	let advertClassTypeId = $state(1);
	let advertTitle = $state('');
	let advertPrice = $state(0);
	let advertIsActive = $state(true);
	
	// Form state
	let isEditing = $state(false);
	let currentUserId = $state(null);
	let formUsername = $state('');
	let formEmail = $state('');
	let formPassword = $state('');
	let formFirstName = $state('');
	let formLastName = $state('');
	let formRole = $state('user');
	let formTier = $state('basic');

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchUsers();
	});

	async function fetchUsers() {
		try {
			loading = true;
			const res = await fetch('http://127.0.0.1:5000/api/admin/users', {
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});
			if (!res.ok) throw new Error('Failed to fetch users');
			users = await res.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentUserId = null;
		formUsername = '';
		formEmail = '';
		formPassword = '';
		formFirstName = '';
		formLastName = '';
		formRole = 'user';
		formTier = 'basic';
		isCreateEditModalOpen = true;
	}

	function openEditModal(user) {
		isEditing = true;
		currentUserId = user.id;
		formUsername = user.username;
		formEmail = user.email;
		formPassword = ''; // Password cannot be viewed, only changed if implemented
		formFirstName = user.first_name || '';
		formLastName = user.last_name || '';
		formRole = user.role || 'user';
		formTier = user.tier || 'basic';
		isCreateEditModalOpen = true;
	}

	function openDeleteModal(user) {
		currentUserId = user.id;
		formUsername = user.username;
		isDeleteModalOpen = true;
	}

	async function reloadDetails() {
		try {
			detailsLoading = true;
			const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${detailsData.user.id}/details`, {
				headers: { 'Authorization': `Bearer ${$auth.token}` }
			});
			if (res.ok) detailsData = await res.json();
		} catch (e) {
			console.error(e);
		} finally {
			detailsLoading = false;
		}
	}

	function openInnerBooking(mode, booking = null) {
		innerModalType = 'booking';
		innerModalMode = mode;
		if (mode === 'edit') {
			innerId = booking.id;
			bookingStatusId = booking.status_id;
		} else {
			bookingClassId = '';
			bookingStatusId = 1;
		}
		isInnerModalOpen = true;
	}

	function openInnerAdvert(mode, advert = null) {
		innerModalType = 'advert';
		innerModalMode = mode;
		if (mode === 'edit') {
			innerId = advert.id;
			advertTitle = advert.title;
			advertPrice = advert.price;
			advertIsActive = advert.is_active;
		} else {
			advertClassTypeId = 1;
			advertTitle = '';
			advertPrice = 0;
			advertIsActive = true;
		}
		isInnerModalOpen = true;
	}

	async function saveInnerModal() {
		try {
			if (innerModalType === 'booking') {
				if (innerModalMode === 'edit') {
					const res = await fetch(`http://127.0.0.1:5000/api/bookings/${innerId}/status`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${$auth.token}` },
						body: JSON.stringify({ status_id: bookingStatusId })
					});
					if(!res.ok) throw new Error('Error updating booking');
				} else {
					const res = await fetch(`http://127.0.0.1:5000/api/bookings`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${$auth.token}` },
						body: JSON.stringify({ user_id: detailsData.user.id, class_id: bookingClassId, status_id: bookingStatusId })
					});
					if(!res.ok) throw new Error('Error creating booking');
				}
			} else if (innerModalType === 'advert') {
				if (innerModalMode === 'edit') {
					const res = await fetch(`http://127.0.0.1:5000/api/classes/${innerId}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${$auth.token}` },
						body: JSON.stringify({ title: advertTitle, price: advertPrice, is_active: advertIsActive ? 1 : 0 })
					});
					if(!res.ok) throw new Error('Error updating advert');
				} else {
					const res = await fetch(`http://127.0.0.1:5000/api/classes`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${$auth.token}` },
						body: JSON.stringify({ 
							instructor_id: detailsData.user.id, 
							class_type_id: advertClassTypeId,
							title: advertTitle,
							price: advertPrice,
							is_online: 0,
							capacity: 10
						})
					});
					if(!res.ok) throw new Error('Error creating advert');
				}
			}
			isInnerModalOpen = false;
			await reloadDetails();
		} catch (err) {
			alert(err.message);
		}
	}

	async function deleteInnerItem(type, id) {
		if (!confirm('Are you sure you want to delete this?')) return;
		try {
			const endpoint = type === 'booking' ? `/api/bookings/${id}` : `/api/classes/${id}`;
			const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${$auth.token}` }
			});
			if(!res.ok) throw new Error(`Error deleting ${type}`);
			await reloadDetails();
		} catch (err) {
			alert(err.message);
		}
	}

	async function openDetailsModal(user) {
		isDetailsModalOpen = true;
		activeTab = 'profile';
		detailsLoading = true;
		detailsData = null;
		
		try {
			const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${user.id}/details`, {
				headers: { 'Authorization': `Bearer ${$auth.token}` }
			});
			if (!res.ok) throw new Error('Error fetching details');
			detailsData = await res.json();
		} catch (err) {
			alert(err.message);
			isDetailsModalOpen = false;
		} finally {
			detailsLoading = false;
		}
	}

	async function saveUser() {
		try {
			const url = isEditing 
				? `http://127.0.0.1:5000/api/admin/users/${currentUserId}`
				: `http://127.0.0.1:5000/api/admin/users`;
			
			const method = isEditing ? 'PUT' : 'POST';
			const body = {
				username: formUsername,
				email: formEmail,
				first_name: formFirstName,
				last_name: formLastName,
				role: formRole,
				tier: formTier
			};
			
			if (!isEditing && formPassword) {
				body.password = formPassword;
			}

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$auth.token}`
				},
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Error saving user');
			}

			isCreateEditModalOpen = false;
			await fetchUsers();
		} catch (err) {
			alert(err.message);
		}
	}

	async function deleteUser() {
		try {
			const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${currentUserId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${$auth.token}`
				}
			});

			if (!res.ok) throw new Error('Error deleting user');

			isDeleteModalOpen = false;
			await fetchUsers();
		} catch (err) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.title')} />

<div class="admin-container">
	<div class="header">
		<div>
			<h1>{$t('admin.title')}</h1>
			<p>{$t('admin.subtitle')}</p>
		</div>
		<Button variant="raised" onclick={openCreateModal}>
			<span class="material-icons" aria-hidden="true" style="margin-right: 8px;">add</span>
			<Label>{$t('admin.create_user')}</Label>
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
						<Cell>{$t('admin.username')}</Cell>
						<Cell>{$t('admin.email')}</Cell>
						<Cell>{$t('admin.role')}</Cell>
						<Cell>{$t('admin.tier')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each users as user}
						<Row>
							<Cell>{user.id}</Cell>
							<Cell>{user.username}</Cell>
							<Cell>{user.email}</Cell>
							<Cell>
								<span class="badge role-{user.role || 'user'}">
									{$t(`admin.${user.role || 'user'}`) || user.role}
								</span>
							</Cell>
							<Cell>
								<span class="badge tier-{user.tier || 'basic'}">
									{$t(`admin.${user.tier || 'basic'}`) || user.tier}
								</span>
							</Cell>
							<Cell>
								<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openDetailsModal(user)} aria-label={$t('admin.view_details')}>visibility</IconButton>
								<IconButton class="material-icons" onclick={() => openEditModal(user)} aria-label={$t('admin.edit_user')}>edit</IconButton>
								<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => openDeleteModal(user)} aria-label={$t('admin.delete_user')}>delete</IconButton>
							</Cell>
						</Row>
					{/each}
				</Body>
			</DataTable>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
<Dialog bind:open={isCreateEditModalOpen} aria-labelledby="create-edit-title">
	<Title id="create-edit-title">{isEditing ? $t('admin.edit_user') : $t('admin.create_user')}</Title>
	<Content>
		<div class="form-container">
			<Textfield bind:value={formUsername} label={$t('admin.username')} style="width: 100%;" disabled={isEditing} />
			<Textfield bind:value={formEmail} label={$t('admin.email')} type="email" style="width: 100%;" />
			{#if !isEditing}
				<Textfield bind:value={formPassword} label="Password" type="password" style="width: 100%;" />
			{/if}
			<Textfield bind:value={formFirstName} label="First Name" style="width: 100%;" />
			<Textfield bind:value={formLastName} label="Last Name" style="width: 100%;" />
			
			<div class="select-field">
				<label>{$t('admin.role')}</label>
				<Select bind:value={formRole} style="width: 100%;">
					<Option value="user">{$t('admin.user')}</Option>
					<Option value="instructor">{$t('admin.instructor')}</Option>
					<Option value="admin">{$t('admin.admin')}</Option>
				</Select>
			</div>
			
			<div class="select-field">
				<label>{$t('admin.tier')}</label>
				<Select bind:value={formTier} style="width: 100%;">
					<Option value="basic">{$t('admin.basic')}</Option>
					<Option value="premium">{$t('admin.premium')}</Option>
				</Select>
			</div>
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isCreateEditModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={saveUser}>
			<Label>{$t('admin.save')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog bind:open={isDeleteModalOpen} aria-labelledby="delete-title">
	<Title id="delete-title">{$t('admin.delete_user')}</Title>
	<Content>
		{$t('admin.delete_confirm').replace('{user}', formUsername)}
	</Content>
	<Actions>
		<Button onclick={() => (isDeleteModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" style="background-color: #d32f2f; color: white;" onclick={deleteUser}>
			<Label>{$t('admin.delete')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- View Details Modal -->
<Dialog bind:open={isDetailsModalOpen} aria-labelledby="details-title" style="--mdc-dialog-min-width: 800px;">
	<Title id="details-title">{$t('admin.view_details')}</Title>
	<Content>
		{#if detailsLoading}
			<p>{$t('admin.loading')}</p>
		{:else if detailsData}
			<div class="tabs">
				<button class="tab-btn {activeTab === 'profile' ? 'active' : ''}" onclick={() => activeTab = 'profile'}>
					{$t('admin.profile_tab')}
				</button>
				<button class="tab-btn {activeTab === 'bookings' ? 'active' : ''}" onclick={() => activeTab = 'bookings'}>
					{$t('admin.bookings_tab')} ({detailsData.bookings.length})
				</button>
				{#if detailsData.user.role === 'instructor' || detailsData.user.role === 'admin'}
					<button class="tab-btn {activeTab === 'adverts' ? 'active' : ''}" onclick={() => activeTab = 'adverts'}>
						{$t('admin.adverts_tab')} ({detailsData.adverts.length})
					</button>
				{/if}
			</div>

			<div class="tab-content">
				{#if activeTab === 'profile'}
					<div class="details-grid">
						<div class="detail-item"><strong>{$t('admin.id')}:</strong> {detailsData.user.id}</div>
						<div class="detail-item"><strong>{$t('admin.username')}:</strong> {detailsData.user.username}</div>
						<div class="detail-item"><strong>{$t('admin.name')}:</strong> {detailsData.user.first_name} {detailsData.user.last_name}</div>
						<div class="detail-item"><strong>{$t('admin.email')}:</strong> {detailsData.user.email}</div>
						<div class="detail-item"><strong>{$t('admin.phone')}:</strong> {detailsData.user.phone || '-'}</div>
						<div class="detail-item">
							<strong>{$t('admin.role')}:</strong> 
							<span class="badge role-{detailsData.user.role || 'user'}">{$t(`admin.${detailsData.user.role || 'user'}`) || detailsData.user.role}</span>
						</div>
						<div class="detail-item">
							<strong>{$t('admin.tier')}:</strong> 
							<span class="badge tier-{detailsData.user.tier || 'basic'}">{$t(`admin.${detailsData.user.tier || 'basic'}`) || detailsData.user.tier}</span>
						</div>
					</div>
					
					{#if detailsData.user.role === 'instructor' || detailsData.user.role === 'admin'}
						<h3 style="margin-top: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Instructor Profile</h3>
						<div class="details-grid">
							<div class="detail-item" style="grid-column: span 2;"><strong>{$t('admin.bio')}:</strong> {detailsData.user.bio || '-'}</div>
							<div class="detail-item"><strong>{$t('admin.specialization')}:</strong> {detailsData.user.specialization || '-'}</div>
							<div class="detail-item"><strong>Upgrades:</strong> 
								{#if detailsData.user.has_video_upgrade} <span class="badge">Video</span> {/if}
								{#if detailsData.user.has_link_upgrade} <span class="badge">Link</span> {/if}
								{#if detailsData.user.has_badge_upgrade} <span class="badge">Badge</span> {/if}
								{#if !detailsData.user.has_video_upgrade && !detailsData.user.has_link_upgrade && !detailsData.user.has_badge_upgrade} - {/if}
							</div>
						</div>
					{/if}
					
				{:else if activeTab === 'bookings'}
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
						<h3 style="margin: 0;">{$t('admin.bookings_tab')}</h3>
						<Button variant="outlined" onclick={() => openInnerBooking('create')}>Add Booking</Button>
					</div>
					{#if detailsData.bookings.length === 0}
						<p>{$t('admin.no_bookings')}</p>
					{:else}
						<DataTable style="width: 100%;">
							<Head>
								<Row>
									<Cell>{$t('admin.id')}</Cell>
									<Cell>{$t('admin.class_title')}</Cell>
									<Cell>{$t('admin.date')}</Cell>
									<Cell>{$t('admin.price')}</Cell>
									<Cell>{$t('admin.status')}</Cell>
									<Cell>Actions</Cell>
								</Row>
							</Head>
							<Body>
								{#each detailsData.bookings as booking}
									<Row>
										<Cell>{booking.id}</Cell>
										<Cell>{booking.title}</Cell>
										<Cell>{new Date(booking.starts_at).toLocaleDateString()}</Cell>
										<Cell>€{booking.price}</Cell>
										<Cell>{booking.status_id === 1 ? 'Pending' : booking.status_id === 2 ? 'Confirmed' : 'Cancelled'}</Cell>
										<Cell>
											<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openInnerBooking('edit', booking)} aria-label="Edit Booking">edit</IconButton>
											<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => deleteInnerItem('booking', booking.id)} aria-label="Delete Booking">delete</IconButton>
										</Cell>
									</Row>
								{/each}
							</Body>
						</DataTable>
					{/if}

				{:else if activeTab === 'adverts'}
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
						<h3 style="margin: 0;">{$t('admin.adverts_tab')}</h3>
						<Button variant="outlined" onclick={() => openInnerAdvert('create')}>Add Advert</Button>
					</div>
					{#if detailsData.adverts.length === 0}
						<p>{$t('admin.no_adverts')}</p>
					{:else}
						<DataTable style="width: 100%;">
							<Head>
								<Row>
									<Cell>{$t('admin.id')}</Cell>
									<Cell>{$t('admin.class_title')}</Cell>
									<Cell>{$t('admin.price')}</Cell>
									<Cell>{$t('admin.status')}</Cell>
									<Cell>Actions</Cell>
								</Row>
							</Head>
							<Body>
								{#each detailsData.adverts as ad}
									<Row>
										<Cell>{ad.id}</Cell>
										<Cell>{ad.title}</Cell>
										<Cell>€{ad.price}</Cell>
										<Cell>
											<span class="badge {ad.is_active ? 'tier-premium' : 'role-user'}">
												{ad.is_active ? 'Active' : 'Inactive'}
											</span>
										</Cell>
										<Cell>
											<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openInnerAdvert('edit', ad)} aria-label="Edit Advert">edit</IconButton>
											<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => deleteInnerItem('advert', ad.id)} aria-label="Delete Advert">delete</IconButton>
										</Cell>
									</Row>
								{/each}
							</Body>
						</DataTable>
					{/if}
				{/if}
			</div>
		{/if}
	</Content>
	<Actions>
		<Button onclick={() => (isDetailsModalOpen = false)}>
			<Label>{$t('admin.close')}</Label>
		</Button>
	</Actions>
</Dialog>

<!-- Inner CRUD Modal for Bookings/Adverts -->
<Dialog bind:open={isInnerModalOpen} aria-labelledby="inner-title" style="--mdc-dialog-z-index: 1000;">
	<Title id="inner-title">{innerModalMode === 'edit' ? 'Edit' : 'Create'} {innerModalType === 'booking' ? 'Booking' : 'Advert'}</Title>
	<Content>
		<div class="form-container">
			{#if innerModalType === 'booking'}
				{#if innerModalMode === 'create'}
					<Textfield bind:value={bookingClassId} label="Class ID" type="number" style="width: 100%;" />
				{/if}
				<div class="select-field">
					<label>Status</label>
					<Select bind:value={bookingStatusId} style="width: 100%;">
						<Option value={1}>Pending</Option>
						<Option value={2}>Confirmed</Option>
						<Option value={3}>Cancelled</Option>
					</Select>
				</div>
			{:else if innerModalType === 'advert'}
				{#if innerModalMode === 'create'}
					<div class="select-field">
						<label>Class Type ID</label>
						<Select bind:value={advertClassTypeId} style="width: 100%;">
							<Option value={1}>Surf</Option>
							<Option value={2}>Skate</Option>
						</Select>
					</div>
				{/if}
				<Textfield bind:value={advertTitle} label="Title" style="width: 100%;" />
				<Textfield bind:value={advertPrice} label="Price (€)" type="number" style="width: 100%;" />
				<div class="select-field" style="margin-top: 1rem;">
					<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
						<input type="checkbox" bind:checked={advertIsActive} style="width: 18px; height: 18px;" />
						Is Active
					</label>
				</div>
			{/if}
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isInnerModalOpen = false)}>
			<Label>{$t('admin.cancel')}</Label>
		</Button>
		<Button variant="raised" onclick={saveInnerModal}>
			<Label>{$t('admin.save')}</Label>
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
	.role-admin { background: #ffebee; color: #c62828; }
	.role-instructor { background: #e3f2fd; color: #1565c0; }
	.role-user { background: #f5f5f5; color: #616161; }
	
	.tier-premium { background: #fff8e1; color: #f57f17; }
	.tier-basic { background: #e8f5e9; color: #2e7d32; }

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
	.error {
		color: #d32f2f;
	}

	.tabs {
		display: flex;
		border-bottom: 2px solid #eee;
		margin-bottom: 1rem;
		padding-top: 1rem;
	}
	.tab-btn {
		background: none;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: #666;
		cursor: pointer;
		border-bottom: 3px solid transparent;
		margin-bottom: -2px;
		transition: all 0.2s ease;
	}
	.tab-btn:hover {
		color: #0077b6;
	}
	.tab-btn.active {
		color: #0077b6;
		border-bottom-color: #0077b6;
	}
	.tab-content {
		min-height: 200px;
		padding: 1rem 0;
	}
	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	.detail-item {
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 4px;
	}
</style>
