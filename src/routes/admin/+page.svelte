<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { fetchApi, getMediaUrl } from '$lib/api';
	import { t } from 'svelte-i18n';
	import { formatPrice } from '$lib/stores/currency';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';
//test
	let users: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let countAdmin = $derived(users.filter(u => u.role === 'admin').length);
	let countInstructor = $derived(users.filter(u => u.role === 'instructor').length);
	let countBasicUser = $derived(users.filter(u => u.role === 'user' || !u.role).length);

	// Modals
	let isCreateEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isDetailsModalOpen = $state(false);
	
	// Details state
	let activeTab = $state('profile');
	let detailsData: any = $state(null);
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
	let advertTitleEs = $state('');
	let advertDescription = $state('');
	let advertDescriptionEs = $state('');
	let advertPrice = $state(0);
	let advertIsActive = $state(true);
	let advertCapacity = $state(10);
	let advertDuration = $state(90);
	let advertLocation = $state('');
	let advertDifficulty = $state(1);
	let advertSportType = $state('surf');
	let advertIsOnline = $state(false);
	let advertImageUrl = $state('');
	
	let ratingStudentId = $state('');
	let ratingBookingId = $state('');
	let ratingValue = $state(5);
	let ratingComment = $state('');
	
	// Form state
	let isEditing = $state(false);
	let currentUserId = $state(null);
	let formUsername = $state('');
	let formEmail = $state('');
	let formPassword = $state('');
	let showPassword = $state(false);
	let formFirstName = $state('');
	let formLastName = $state('');
	let formRole = $state('user');
	let formVerified = $state(false);

	let pendingAdverts: any[] = $state([]);
	let pendingLoading = $state(false);

	let featuredInstructors: any[] = $state([]);
	let featuredLoading = $state(false);
	
	let isFeaturedModalOpen = $state(false);
	let featuredInstructorId = $state('');
	let featuredUntilDate = $state('');
	let featuredModalMode = $state('add');

	async function fetchPendingAdverts() {
		try {
			pendingLoading = true;
			const ads = await fetchApi('/classes?admin=true');
			pendingAdverts = ads.filter((ad: any) => ad.approval_status === 'pending');
		} catch (err: any) {
			console.error("Error fetching pending adverts", err);
		} finally {
			pendingLoading = false;
		}
	}

	async function fetchFeaturedInstructors() {
		try {
			featuredLoading = true;
			featuredInstructors = await fetchApi('/admin/users/featured');
		} catch (err: any) {
			console.error("Error fetching featured instructors", err);
		} finally {
			featuredLoading = false;
		}
	}

	function openFeaturedModal(mode: string, instructor: any = null) {
		featuredModalMode = mode;
		if (mode === 'edit' && instructor) {
			featuredInstructorId = instructor.id.toString();
			if (instructor.featured_until) {
				featuredUntilDate = new Date(instructor.featured_until).toISOString().split('T')[0];
			}
		} else {
			featuredInstructorId = '';
			const nextWeek = new Date();
			nextWeek.setDate(nextWeek.getDate() + 7);
			featuredUntilDate = nextWeek.toISOString().split('T')[0];
		}
		isFeaturedModalOpen = true;
	}

	async function saveFeaturedInstructor() {
		if (!featuredInstructorId || !featuredUntilDate) {
			alert("Please select an instructor and date");
			return;
		}
		try {
			const payload = {
				featured_until: featuredUntilDate
			};
			await fetchApi(`/admin/users/${featuredInstructorId}/perks`, {
				method: 'PUT',
				body: JSON.stringify(payload)
			});
			isFeaturedModalOpen = false;
			await fetchFeaturedInstructors();
			import('$lib/stores/toast').then(({ showToast }) => showToast('Instructor of the Week updated successfully!', 'success'));
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Error saving featured instructor', 'error'));
		}
	}

	async function removeFeaturedInstructor(id: number) {
		if (!confirm("Are you sure you want to remove this instructor from the featured list?")) return;
		try {
			const payload = {
				featured_until: null
			};
			await fetchApi(`/admin/users/${id}/perks`, {
				method: 'PUT',
				body: JSON.stringify(payload)
			});
			await fetchFeaturedInstructors();
			import('$lib/stores/toast').then(({ showToast }) => showToast('Instructor removed from featured list', 'success'));
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Error removing featured instructor', 'error'));
		}
	}

	function formatTimeRemaining(dateString: string) {
		if (!dateString) return '-';
		const targetDate = new Date(dateString);
		const now = new Date();
		const diffMs = targetDate.getTime() - now.getTime();
		
		if (diffMs <= 0) return 'Expired';
		
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		
		if (days > 0) return `${days}d ${hours}h`;
		return `${hours}h`;
	}

	async function approveAdvert(id: number) {
		if (!confirm('Are you sure you want to approve this advert? It will be immediately visible on the marketplace.')) return;
		try {
			await fetchApi(`/classes/${id}/approve`, { method: 'PUT' });
			await fetchPendingAdverts();
			alert('Advert approved successfully!');
		} catch (err: any) {
			alert(err.message || 'Error approving advert');
		}
	}

	async function disapproveAdvert(id: number) {
		if (!confirm('Are you sure you want to reject this advert? The instructor will be notified to review it.')) return;
		try {
			await fetchApi(`/classes/${id}/disapprove`, { method: 'PUT' });
			await fetchPendingAdverts();
			alert('Advert rejected successfully!');
		} catch (err: any) {
			alert(err.message || 'Error rejecting advert');
		}
	}

	//onmount
	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchUsers();
		await fetchPendingAdverts();
		await fetchFeaturedInstructors();
	});

	async function fetchUsers() {
		try {
			loading = true;
			users = await fetchApi('/admin/users');
		} catch (err: any) {
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
		formVerified = false;
		isCreateEditModalOpen = true;
	}

	function openEditModal(user: any) {
		isEditing = true;
		currentUserId = user.id;
		formUsername = user.username;
		formEmail = user.email;
		formPassword = ''; // Password cannot be viewed, only changed if implemented
		formFirstName = user.first_name || '';
		formLastName = user.last_name || '';
		formRole = user.role || 'user';
		formVerified = !!user.is_verified;
		isCreateEditModalOpen = true;
	}

	function openDeleteModal(user: any) {
		currentUserId = user.id;
		formUsername = user.username;
		isDeleteModalOpen = true;
	}

	async function reloadDetails() {
		if (!detailsData || !detailsData.user) return;
		try {
			detailsLoading = true;
			detailsData = await fetchApi(`/admin/users/${detailsData.user.id}/details`);
		} catch (e) {
			console.error(e);
		} finally {
			detailsLoading = false;
		}
	}

	function openInnerBooking(mode: string, booking: any = null) {
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

	function openInnerAdvert(mode: string, advert: any = null) {
		innerModalType = 'advert';
		innerModalMode = mode;
		if (mode === 'edit') {
			innerId = advert.id;
			advertTitle = advert.title || '';
			advertTitleEs = advert.title_es || '';
			advertDescription = advert.description || '';
			advertDescriptionEs = advert.description_es || '';
			advertPrice = advert.price || 0;
			advertIsActive = advert.is_active;
			advertClassTypeId = advert.class_type_id || 1;
			advertCapacity = advert.capacity || 10;
			advertDuration = advert.duration_minutes || 90;
			advertLocation = advert.location || '';
			advertDifficulty = advert.difficulty_level || 1;
			advertSportType = advert.sport_type || 'surf';
			advertIsOnline = advert.is_online || false;
			advertImageUrl = advert.image_url || '';
		} else {
			advertClassTypeId = 1;
			advertTitle = '';
			advertTitleEs = '';
			advertDescription = '';
			advertDescriptionEs = '';
			advertPrice = 0;
			advertIsActive = true;
			advertCapacity = 10;
			advertDuration = 90;
			advertLocation = '';
			advertDifficulty = 1;
			advertSportType = 'surf';
			advertIsOnline = false;
			advertImageUrl = '';
		}
		isInnerModalOpen = true;
	}

	function openInnerRating(mode: string, rating: any = null) {
		innerModalType = 'rating';
		innerModalMode = mode;
		if (mode === 'edit') {
			innerId = rating.id;
			ratingValue = rating.rating;
			ratingComment = rating.comment || '';
		} else {
			ratingStudentId = '';
			ratingBookingId = '';
			ratingValue = 5;
			ratingComment = '';
		}
		isInnerModalOpen = true;
	}

	async function saveInnerModal() {
		if (!detailsData || !detailsData.user) return;
		try {
			if (innerModalType === 'booking') {
				if (innerModalMode === 'edit') {
					await fetchApi(`/bookings/${innerId}/status`, {
						method: 'PUT',
						body: JSON.stringify({ status_id: bookingStatusId })
					});
				} else {
					await fetchApi(`/bookings`, {
						method: 'POST',
						body: JSON.stringify({ user_id: detailsData.user.id, class_id: bookingClassId, status_id: bookingStatusId })
					});
				}
			} else if (innerModalType === 'advert') {
				const advertPayload = {
					title: advertTitle,
					title_es: advertTitleEs,
					description: advertDescription,
					description_es: advertDescriptionEs,
					price: advertPrice,
					class_type_id: advertClassTypeId,
					capacity: advertCapacity,
					duration_minutes: advertDuration,
					location: advertLocation,
					difficulty_level: advertDifficulty,
					sport_type: advertSportType,
					is_online: advertIsOnline ? 1 : 0,
					is_active: advertIsActive ? 1 : 0
				};

				if (innerModalMode === 'edit') {
					await fetchApi(`/classes/${innerId}`, {
						method: 'PUT',
						body: JSON.stringify(advertPayload)
					});
				} else {
					await fetchApi(`/classes`, {
						method: 'POST',
						body: JSON.stringify({ 
							instructor_id: detailsData.user.id, 
							...advertPayload
						})
					});
				}
			} else if (innerModalType === 'rating') {
				if (innerModalMode === 'edit') {
					await fetchApi(`/admin/ratings/${innerId}`, {
						method: 'PUT',
						body: JSON.stringify({ rating: ratingValue, comment: ratingComment })
					});
				} else {
					await fetchApi(`/admin/ratings`, {
						method: 'POST',
						body: JSON.stringify({ 
							instructor_id: detailsData.user.id, 
							student_id: ratingStudentId,
							booking_id: ratingBookingId,
							rating: ratingValue,
							comment: ratingComment
						})
					});
				}
			}
			isInnerModalOpen = false;
			await reloadDetails();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function deleteInnerItem(type: string, id: any) {
		if (!confirm('Are you sure you want to delete this?')) return;
		try {
			let endpoint = '';
			if (type === 'booking') endpoint = `/bookings/${id}`;
			else if (type === 'advert') endpoint = `/classes/${id}`;
			else if (type === 'rating') endpoint = `/admin/ratings/${id}`;

			await fetchApi(endpoint, {
				method: 'DELETE'
			});
			await reloadDetails();
		} catch (err: any) {
			alert(err.message);
		}
	}

	async function sendVerificationEmail(userId: number) {
		try {
			await fetchApi(`/admin/users/${userId}/send-verification`, { method: 'POST' });
			alert('Verification email sent successfully!');
		} catch (err: any) {
			alert(err.message || 'Failed to send email');
		}
	}

	async function handleUserPictureUpload(userId: number, e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const file = target.files[0];
		const formData = new FormData();
		formData.append('profile_picture', file);

		try {
			await fetchApi(`/users/${userId}/picture`, {
				method: 'POST',
				body: formData
			});
			import('$lib/stores/toast').then(({ showToast }) => showToast('User picture uploaded successfully', 'success'));
			await reloadDetails();
			await fetchUsers(); // Refresh main list too
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Error uploading user picture', 'error'));
		}
	}

	async function handleAdvertPictureUpload(advertId: number, e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const file = target.files[0];
		const formData = new FormData();
		formData.append('class_picture', file);

		try {
			const res = await fetchApi(`/classes/${advertId}/picture`, {
				method: 'POST',
				body: formData
			});
			import('$lib/stores/toast').then(({ showToast }) => showToast('Advert picture uploaded successfully', 'success'));
			advertImageUrl = res.image_url;
			await reloadDetails();
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Error uploading advert picture', 'error'));
		}
	}

	async function boostAdvertAdmin(classId: number) {
		if (!confirm('Are you sure you want to instantly boost this advert for 24 hours?')) return;
		try {
			await fetchApi(`/admin/classes/${classId}/boost`, { method: 'PUT' });
			import('$lib/stores/toast').then(({ showToast }) => showToast('Advert boosted successfully!', 'success'));
			await reloadDetails();
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Failed to boost advert', 'error'));
		}
	}

	async function boostInstructorProfileAdmin() {
		if (!detailsData || !detailsData.user) return;
		if (!confirm('Are you sure you want to instantly boost this instructor profile for 24 hours?')) return;
		try {
			const payload = {
				bump_instructor: true
			};
			await fetchApi(`/admin/users/${detailsData.user.id}/perks`, {
				method: 'PUT',
				body: JSON.stringify(payload)
			});
			import('$lib/stores/toast').then(({ showToast }) => showToast('Instructor boosted successfully!', 'success'));
			await reloadDetails();
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Failed to boost instructor', 'error'));
		}
	}

	async function updatePerks() {
		if (!detailsData || !detailsData.user) return;
		try {
			const payload = {
				has_video_upgrade: detailsData.user.has_video_upgrade,
				has_link_upgrade: detailsData.user.has_link_upgrade,
				has_badge_upgrade: detailsData.user.has_badge_upgrade,
				featured_until: detailsData.user.featured_until
			};
			await fetchApi(`/admin/users/${detailsData.user.id}/perks`, {
				method: 'PUT',
				body: JSON.stringify(payload)
			});
			import('$lib/stores/toast').then(({ showToast }) => showToast('Perks updated successfully!', 'success'));
			await reloadDetails();
		} catch (err: any) {
			import('$lib/stores/toast').then(({ showToast }) => showToast(err.message || 'Failed to update perks', 'error'));
		}
	}

	async function sendPasswordReset(userId: number) {
		if (!confirm('Are you sure you want to send a password reset email to this user?')) return;
		try {
			await fetchApi(`/admin/users/${userId}/send-password-reset`, { method: 'POST' });
			alert('Password reset email sent successfully!');
		} catch (err: any) {
			alert(err.message || 'Failed to send email');
		}
	}

	async function openDetailsModal(user: any) {
		isDetailsModalOpen = true;
		activeTab = 'profile';
		detailsLoading = true;
		detailsData = null;
		
		try {
			detailsData = await fetchApi(`/admin/users/${user.id}/details`);
		} catch (err: any) {
			alert(err.message);
			isDetailsModalOpen = false;
		} finally {
			detailsLoading = false;
		}
	}

	async function saveUser() {
		try {
			const endpoint = isEditing 
				? `/admin/users/${currentUserId}`
				: `/admin/users`;
			
			const method = isEditing ? 'PUT' : 'POST';
			const body: any = {
				username: formUsername,
				email: formEmail,
				first_name: formFirstName,
				last_name: formLastName,
				role: formRole,
				is_verified: formVerified
			};
			
			if (!isEditing && formPassword) {
				body.password = formPassword;
			}

			await fetchApi(endpoint, {
				method,
				body: JSON.stringify(body)
			});

			isCreateEditModalOpen = false;
			await fetchUsers();
		} catch (err: any) {
			alert(err.message || 'Error saving user');
		}
	}

	async function deleteUser() {
		try {
			await fetchApi(`/admin/users/${currentUserId}`, {
				method: 'DELETE'
			});

			isDeleteModalOpen = false;
			await fetchUsers();
		} catch (err: any) {
			alert(err.message);
		}
	}
</script>

<SEO title={$t('admin.title')} />

{#if pendingAdverts.length > 0}
	<div class="pending-banner">
		<span class="material-icons">warning</span>
		<strong>Action Required:</strong> You have {pendingAdverts.length} advert{pendingAdverts.length === 1 ? '' : 's'} pending approval. Please review them at the bottom of this page.
	</div>
{/if}

<main class="admin-container">
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
		<div class="user-counters">
			<div class="counter-badge role-admin">
				<span class="material-icons">admin_panel_settings</span>
				<strong>{$t('admin.admin')}:</strong> {countAdmin}
			</div>
			<div class="counter-badge role-instructor">
				<span class="material-icons">school</span>
				<strong>{$t('admin.instructor')}:</strong> {countInstructor}
			</div>
			<div class="counter-badge role-user">
				<span class="material-icons">person</span>
				<strong>{$t('admin.user')}:</strong> {countBasicUser}
			</div>
			<div class="counter-badge" style="background: #eee; color: #333;">
				<span class="material-icons">groups</span>
				<strong>Total:</strong> {users.length}
			</div>
		</div>

		<div class="table-container">
			<DataTable style="width: 100%;">
				<Head>
					<Row>
						<Cell>{$t('admin.id')}</Cell>
						<Cell>{$t('admin.username')}</Cell>
						<Cell>{$t('admin.email')}</Cell>
						<Cell>{$t('admin.role')}</Cell>
						<Cell>{$t('admin.actions')}</Cell>
					</Row>
				</Head>
				<Body>
					{#each users as user}
						<Row>
							<Cell>{user.id}</Cell>
							<Cell>
								<div style="display: flex; align-items: center; gap: 8px;">
									{#if user.profile_picture_url}
										<img src={getMediaUrl(user.profile_picture_url)} alt="Profile" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
									{/if}
									{#if user.last_active_at && (new Date().getTime() - new Date(user.last_active_at).getTime() < 5 * 60 * 1000)}
										<span class="online-indicator" title="Online"></span>
									{/if}
									{user.username}
									{#if user.is_verified}
										<span class="material-icons" style="color: #2196f3; font-size: 14px;" title="Verified">verified</span>
									{/if}
								</div>
							</Cell>
							<Cell>{user.email}</Cell>
							<Cell>
								<span class="badge role-{user.role || 'user'}">
									{$t(`admin.${user.role || 'user'}`) || user.role}
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

		<h2 style="margin-top: 3rem; margin-bottom: 1rem; color: #0d1b2a;">Advert Approvals</h2>
		<div class="table-container">
			{#if pendingLoading}
				<p style="padding: 1rem;">Loading pending adverts...</p>
			{:else if pendingAdverts.length === 0}
				<p style="padding: 1rem; color: #666;">No adverts pending approval.</p>
			{:else}
				<DataTable style="width: 100%;">
					<Head>
						<Row>
							<Cell>Class ID</Cell>
							<Cell>Title</Cell>
							<Cell>Instructor</Cell>
							<Cell>Price</Cell>
							<Cell>Actions</Cell>
						</Row>
					</Head>
					<Body>
						{#each pendingAdverts as ad}
							<Row>
								<Cell>{ad.id}</Cell>
								<Cell>{ad.title}</Cell>
								<Cell>{ad.instructor_username || ad.instructor_id}</Cell>
								<Cell>{$formatPrice(ad.price)}</Cell>
								<Cell>
									<div style="display: flex; gap: 8px;">
										<Button variant="outlined" style="border-color: #2e7d32; color: #2e7d32;" onclick={() => approveAdvert(ad.id)}>
											<span class="material-icons" style="margin-right: 4px; font-size: 18px;">check_circle</span>
											<Label>Approve</Label>
										</Button>
										<Button variant="outlined" style="border-color: #d32f2f; color: #d32f2f;" onclick={() => disapproveAdvert(ad.id)}>
											<span class="material-icons" style="margin-right: 4px; font-size: 18px;">cancel</span>
											<Label>Reject</Label>
										</Button>
									</div>
								</Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
			{/if}
		</div>
		
		<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; margin-bottom: 1rem;">
			<h2 style="margin: 0; color: #0d1b2a;">Instructors of the Week</h2>
			<Button variant="outlined" onclick={() => openFeaturedModal('add')}>Add Featured Instructor</Button>
		</div>
		<div class="table-container">
			{#if featuredLoading}
				<p style="padding: 1rem;">Loading featured instructors...</p>
			{:else if featuredInstructors.length === 0}
				<p style="padding: 1rem; color: #666;">No instructors are currently featured.</p>
			{:else}
				<DataTable style="width: 100%;">
					<Head>
						<Row>
							<Cell>User ID</Cell>
							<Cell>Username</Cell>
							<Cell>Name</Cell>
							<Cell>Featured Until</Cell>
							<Cell>Time Left</Cell>
							<Cell>Actions</Cell>
						</Row>
					</Head>
					<Body>
						{#each featuredInstructors as instructor}
							<Row>
								<Cell>{instructor.id}</Cell>
								<Cell>{instructor.username}</Cell>
								<Cell>{instructor.first_name} {instructor.last_name}</Cell>
								<Cell>{new Date(instructor.featured_until).toLocaleString()}</Cell>
								<Cell>
									<span style="font-weight: bold; color: #ed6c02;">
										{formatTimeRemaining(instructor.featured_until)}
									</span>
								</Cell>
								<Cell>
									<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openFeaturedModal('edit', instructor)} aria-label="Edit Date">edit</IconButton>
									<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => removeFeaturedInstructor(instructor.id)} aria-label="Remove Featured">delete</IconButton>
								</Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
			{/if}
		</div>
	{/if}
</main>

<!-- Create/Edit Modal -->
<Dialog bind:open={isCreateEditModalOpen} aria-labelledby="create-edit-title">
	<Title id="create-edit-title">{isEditing ? $t('admin.edit_user') : $t('admin.create_user')}</Title>
	<Content>
		<div class="form-container">
			<Textfield variant="outlined" bind:value={formUsername} label={$t('admin.username')} style="width: 100%;" disabled={isEditing} />
			<Textfield variant="outlined" bind:value={formEmail} label={$t('admin.email')} type="email" input$pattern={'[^@\\s]+@[^@\\s]+\\.[^@\\s]+'} input$title="Please enter a valid email address with a domain (e.g. .com)" style="width: 100%;" disabled={isEditing} />
			{#if !isEditing}
				<Textfield variant="outlined" bind:value={formPassword} label="Password" type={showPassword ? "text" : "password"} style="width: 100%;">
					{#snippet trailingIcon()}
						<Icon class="material-icons" role="button" tabindex="0" onclick={() => showPassword = !showPassword} style="cursor: pointer;" onkeydown={(e: any) => e.key === 'Enter' && (showPassword = !showPassword)}>
							{showPassword ? 'visibility_off' : 'visibility'}
						</Icon>
					{/snippet}
				</Textfield>
			{/if}
			<Textfield variant="outlined" bind:value={formFirstName} label="First Name" style="width: 100%;" />
			<Textfield variant="outlined" bind:value={formLastName} label="Last Name" style="width: 100%;" />
			
			<div class="select-field">
				<label>{$t('admin.role')}</label>
				<Select variant="outlined" bind:value={formRole} style="width: 100%;">
					<Option value="user">{$t('admin.user')}</Option>
					<Option value="instructor">{$t('admin.instructor')}</Option>
					<Option value="admin">{$t('admin.admin')}</Option>
				</Select>
			</div>

			<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
				<input type="checkbox" id="verified-checkbox" bind:checked={formVerified} style="width: 18px; height: 18px;" />
				<label for="verified-checkbox" style="font-size: 1rem;">Is Verified Account</label>
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
					<button class="tab-btn {activeTab === 'ratings' ? 'active' : ''}" onclick={() => activeTab = 'ratings'}>
						{$t('admin.ratings_tab', { default: 'Ratings' })} ({detailsData.ratings?.length || 0})
					</button>
				{/if}
			</div>

			<div class="tab-content">
				{#if activeTab === 'profile'}
					<div class="details-grid">
						<div class="detail-item" style="grid-column: span 2; display: flex; align-items: center; gap: 1rem;">
							<strong>Profile Picture:</strong>
							{#if detailsData.user.profile_picture_url}
								<img src={getMediaUrl(detailsData.user.profile_picture_url)} alt="Profile" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />
							{:else}
								<span style="color: #666;">No picture</span>
							{/if}
							<input type="file" accept="image/*" onchange={(e) => handleUserPictureUpload(detailsData.user.id, e)} />
						</div>
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
							<strong>Verified:</strong> 
							{#if detailsData.user.is_verified}
								<span class="material-icons" style="color: #2196f3; font-size: 16px; vertical-align: middle;">verified</span> Yes
							{:else}
								No
								<Button variant="outlined" style="margin-left: 8px; padding: 0 8px; height: 24px; min-width: auto; font-size: 0.75rem;" onclick={() => sendVerificationEmail(detailsData.user.id)}>
									<Label>Send Email</Label>
								</Button>
							{/if}
						</div>
					</div>
					<div style="margin-top: 1rem;">
						<Button variant="outlined" style="color: #d32f2f; border-color: #d32f2f;" onclick={() => sendPasswordReset(detailsData.user.id)}>
							<span class="material-icons" style="margin-right: 4px; font-size: 18px;">lock_reset</span>
							<Label>{$t('admin.send_password_reset', { default: 'Send Password Reset' })}</Label>
						</Button>
					</div>
					
					{#if detailsData.user.role === 'instructor' || detailsData.user.role === 'admin'}
						<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
							<h3 style="margin: 0;">Instructor Profile</h3>
							<Button variant="outlined" onclick={updatePerks}>Save Perks</Button>
						</div>
						<div class="details-grid">
							<div class="detail-item" style="grid-column: span 2;"><strong>{$t('admin.bio')}:</strong> {detailsData.user.bio || '-'}</div>
							<div class="detail-item" style="grid-column: span 2;"><strong>{$t('admin.specialization')}:</strong> {detailsData.user.specialization || '-'}</div>
							<div class="detail-item" style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem; background: #f9f9f9; padding: 1rem; border-radius: 8px;">
								<strong style="font-size: 1.1rem;">Manage Upgrades/Perks:</strong>
								
								<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
									<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
										<input type="checkbox" bind:checked={detailsData.user.has_video_upgrade} style="width: 18px; height: 18px;" />
										<span class="material-icons" style="color: #1565c0;">videocam</span>
										Video Upgrade
									</label>

									<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
										<input type="checkbox" bind:checked={detailsData.user.has_link_upgrade} style="width: 18px; height: 18px;" />
										<span class="material-icons" style="color: #1565c0;">link</span>
										Link Upgrade
									</label>

									<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
										<input type="checkbox" bind:checked={detailsData.user.has_badge_upgrade} style="width: 18px; height: 18px;" />
										<span class="material-icons" style="color: #1565c0;">verified</span>
										Badge Upgrade
									</label>
								</div>

								<div style="margin-top: 0.5rem; display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
									<div style="display: flex; flex-direction: column; gap: 0.25rem;">
										<strong>Instructor of the Week Until:</strong>
										<input type="date" bind:value={detailsData.user.featured_until} style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; max-width: 200px;" />
										<small style="color: #666;">Leave empty or set to a past date to disable.</small>
									</div>
									<div style="display: flex; flex-direction: column; gap: 0.25rem;">
										<strong>Boost Profile:</strong>
										<Button variant="outlined" style="color: #ed6c02; border-color: #ed6c02; background: white;" onclick={boostInstructorProfileAdmin}>
											<span class="material-icons" style="margin-right: 4px; font-size: 18px;">rocket_launch</span>
											Boost Instructor (24h)
										</Button>
									</div>
								</div>
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
										<Cell>{$formatPrice(booking.price)}</Cell>
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
										<Cell>{$formatPrice(ad.price)}</Cell>
										<Cell>
											<span class="badge {ad.is_active ? 'role-instructor' : 'role-user'}">
												{ad.is_active ? $t('admin.active') : $t('admin.inactive')}
											</span>
										</Cell>
										<Cell>
											<IconButton class="material-icons" style="color: #ed6c02;" onclick={() => boostAdvertAdmin(ad.id)} title="Boost Advert (24h)" aria-label="Boost Advert">rocket_launch</IconButton>
											<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openInnerAdvert('edit', ad)} aria-label="Edit Advert">edit</IconButton>
											<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => deleteInnerItem('advert', ad.id)} aria-label="Delete Advert">delete</IconButton>
										</Cell>
									</Row>
								{/each}
							</Body>
						</DataTable>
					{/if}
				{:else if activeTab === 'ratings'}
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
						<h3 style="margin: 0;">{$t('admin.ratings_tab', { default: 'Ratings' })}</h3>
						<Button variant="outlined" onclick={() => openInnerRating('create')}>Add Rating</Button>
					</div>
					{#if !detailsData.ratings || detailsData.ratings.length === 0}
						<p>No ratings found.</p>
					{:else}
						<DataTable style="width: 100%;">
							<Head>
								<Row>
									<Cell>ID</Cell>
									<Cell>Student</Cell>
									<Cell>Rating</Cell>
									<Cell>Comment</Cell>
									<Cell>Date</Cell>
									<Cell>Actions</Cell>
								</Row>
							</Head>
							<Body>
								{#each detailsData.ratings as rating}
									<Row>
										<Cell>{rating.id}</Cell>
										<Cell>{rating.student_name}</Cell>
										<Cell>
											<div style="display: flex; align-items: center; gap: 4px;">
												{rating.rating} <span class="material-icons" style="font-size: 14px; color: #fbbf24;">star</span>
											</div>
										</Cell>
										<Cell><div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title={rating.comment}>{rating.comment || '-'}</div></Cell>
										<Cell>{new Date(rating.created_at).toLocaleDateString()}</Cell>
										<Cell>
											<IconButton class="material-icons" style="color: #1976d2;" onclick={() => openInnerRating('edit', rating)} aria-label="Edit Rating">edit</IconButton>
											<IconButton class="material-icons" style="color: #d32f2f;" onclick={() => deleteInnerItem('rating', rating.id)} aria-label="Delete Rating">delete</IconButton>
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

<!-- Featured Instructor Modal -->
<Dialog bind:open={isFeaturedModalOpen} aria-labelledby="featured-modal-title">
	<Title id="featured-modal-title">{featuredModalMode === 'edit' ? 'Edit Featured Instructor' : 'Add Featured Instructor'}</Title>
	<Content>
		<div class="form-container" style="padding-top: 1rem;">
			<p style="margin-bottom: 1rem; color: #666;">Enter the User ID of the instructor and the date they should be featured until.</p>
			
			<Textfield variant="outlined" bind:value={featuredInstructorId} label="Instructor User ID" style="width: 100%;" disabled={featuredModalMode === 'edit'} />
			
			<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
				<label for="featured_until_date" style="font-weight: bold;">Featured Until Date:</label>
				<input id="featured_until_date" type="date" bind:value={featuredUntilDate} style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; width: 100%; font-size: 16px;" />
			</div>
		</div>
	</Content>
	<Actions>
		<Button onclick={() => (isFeaturedModalOpen = false)}>
			<Label>Cancel</Label>
		</Button>
		<Button variant="raised" onclick={saveFeaturedInstructor}>
			<Label>Save</Label>
		</Button>
	</Actions>
</Dialog>
<!-- Inner CRUD Modal for Bookings/Adverts -->
<Dialog bind:open={isInnerModalOpen} aria-labelledby="inner-title" style="--mdc-dialog-z-index: 1000;">
	<Title id="inner-title">{innerModalMode === 'edit' ? 'Edit' : 'Create'} {innerModalType === 'booking' ? 'Booking' : innerModalType === 'advert' ? 'Advert' : 'Rating'}</Title>
	<Content>
		<div class="form-container">
			{#if innerModalType === 'booking'}
				{#if innerModalMode === 'create'}
					<Textfield variant="outlined" bind:value={bookingClassId} label="Class ID" type="number" style="width: 100%;" />
				{/if}
				<div class="select-field">
					<label>Status</label>
					<Select variant="outlined" bind:value={bookingStatusId} style="width: 100%;">
						<Option value={1}>Pending</Option>
						<Option value={2}>Confirmed</Option>
						<Option value={3}>Cancelled</Option>
					</Select>
				</div>
			{:else if innerModalType === 'advert'}
				{#if innerModalMode === 'edit'}
					<div style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
						{#if advertImageUrl}
							<img src={getMediaUrl(advertImageUrl)} alt="Class" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" />
						{/if}
						<div>
							<label style="display: block; font-size: 0.8rem; color: #666; margin-bottom: 4px;">Update Picture</label>
							<input type="file" accept="image/*" onchange={(e) => handleAdvertPictureUpload(innerId, e)} />
						</div>
					</div>
				{/if}
				<div class="select-field" style="margin-bottom: 1rem;">
					<label style="display: block; font-size: 0.8rem; color: #666; margin-bottom: 4px;">Class Type</label>
					<select bind:value={advertClassTypeId} style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
						<option value={1}>Class</option>
						<option value={2}>Course</option>
					</select>
				</div>
				<Textfield variant="outlined" bind:value={advertTitle} label="Title (English)" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertTitleEs} label="Title (Spanish)" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertDescription} label="Description (English)" textarea style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertDescriptionEs} label="Description (Spanish)" textarea style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertPrice} label="Price (€)" type="number" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertCapacity} label="Capacity" type="number" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertDuration} label="Duration (minutes)" type="number" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertLocation} label="Location" style="width: 100%; margin-bottom: 1rem;" />
				<Textfield variant="outlined" bind:value={advertDifficulty} label="Difficulty Level (1-5)" type="number" input$min="1" input$max="5" style="width: 100%; margin-bottom: 1rem;" />
				
				<div class="select-field" style="margin-bottom: 1rem;">
					<label style="display: block; font-size: 0.8rem; color: #666; margin-bottom: 4px;">Sport Type</label>
					<select bind:value={advertSportType} style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
						<option value="surf">Surf</option>
						<option value="skate">Skate</option>
						<option value="yoga">Yoga</option>
						<option value="paddle">Paddle</option>
					</select>
				</div>

				<div class="select-field" style="display: flex; gap: 2rem; margin-top: 1rem;">
					<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
						<input type="checkbox" bind:checked={advertIsOnline} style="width: 18px; height: 18px;" />
						Is Online
					</label>
					<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
						<input type="checkbox" bind:checked={advertIsActive} style="width: 18px; height: 18px;" />
						Is Active
					</label>
				</div>
			{:else if innerModalType === 'rating'}
				{#if innerModalMode === 'create'}
					<Textfield variant="outlined" bind:value={ratingStudentId} label="Student User ID" type="number" style="width: 100%;" />
					<Textfield variant="outlined" bind:value={ratingBookingId} label="Booking ID" type="number" style="width: 100%;" />
				{/if}
				<Textfield variant="outlined" bind:value={ratingValue} label="Rating (1-5)" type="number" input$min="1" input$max="5" style="width: 100%;" />
				<Textfield variant="outlined" bind:value={ratingComment} label="Comment" textarea style="width: 100%;" />
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
	.badge.role-admin, .counter-badge.role-admin { background: #ffebee; color: #c62828; }
	.badge.role-instructor, .counter-badge.role-instructor { background: #e3f2fd; color: #1565c0; }
	.badge.role-user, .counter-badge.role-user { background: #e8f5e9; color: #2e7d32; }

	.online-indicator {
		width: 10px;
		height: 10px;
		background-color: #4caf50;
		border-radius: 50%;
		display: inline-block;
		box-shadow: 0 0 5px rgba(76, 175, 80, 0.6);
	}

	.pending-banner {
		background-color: #fff3cd;
		color: #856404;
		padding: 1rem;
		margin: 1rem 2rem;
		border-radius: 8px;
		border-left: 5px solid #ffeeba;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 1.1rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
	}

	.badge.tier-premium { background: #f3e5f5; color: #6a1b9a; }
	.badge.tier-basic { background: #f5f5f5; color: #616161; }
	
	.user-counters {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	
	.counter-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 1rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
	}

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
