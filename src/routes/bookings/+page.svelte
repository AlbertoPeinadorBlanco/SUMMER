<script lang="ts">
	import { t } from 'svelte-i18n';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';

	let user = $derived($auth.user);
	let isAuthenticated = $derived($auth.isAuthenticated);

	let myBookings = $state<any[]>([]);
	let loadingBookings = $state(false);
	let loadedBookingsForUserId = $state<number | null>(null);

	async function loadMyBookings() {
		if (!user) return;
		loadingBookings = true;
		try {
			const res = await fetchApi(`/bookings/user/${user.id}`);
			myBookings = Array.isArray(res) ? res : [];
		} catch (err) {
			console.error("Error loading bookings:", err);
		} finally {
			loadingBookings = false;
		}
	}

	$effect(() => {
		if (user) {
			if (loadedBookingsForUserId !== user.id) {
				loadedBookingsForUserId = user.id;
				loadMyBookings();
			}
		} else if (isAuthenticated === false) {
			goto('/');
		}
	});
</script>

<SEO title="My Bookings" />

<div class="bookings-dashboard">
	{#if user}
		<div class="my-bookings-section">
			<h1>My Bookings</h1>
			<p class="subtitle">Track the status of your requested classes.</p>
			{#if loadingBookings}
				<div class="loading">Loading bookings...</div>
			{:else if myBookings.length === 0}
				<div class="empty-state">
					<span class="material-icons" style="font-size: 3rem; color: #ccc;">event_busy</span>
					<p>You haven't booked any classes yet.</p>
				</div>
			{:else}
				<div class="bookings-grid">
					{#each myBookings as booking}
						<div class="booking-card">
							<div class="booking-header">
								<h3>{booking.title}</h3>
								<span class="status-badge status-{booking.status}">{booking.status}</span>
							</div>
							<div class="booking-details">
								<p><span class="material-icons" style="font-size: 1rem; vertical-align: middle; margin-right: 4px;">person</span> {booking.instructor_first_name} {booking.instructor_last_name}</p>
								<p><span class="material-icons" style="font-size: 1rem; vertical-align: middle; margin-right: 4px;">place</span> {booking.location || 'TBD'}</p>
								<p><span class="material-icons" style="font-size: 1rem; vertical-align: middle; margin-right: 4px;">payments</span> €{booking.price}</p>
								<p><span class="material-icons" style="font-size: 1rem; vertical-align: middle; margin-right: 4px;">calendar_today</span> {booking.starts_at ? new Date(booking.starts_at).toLocaleString() : 'TBD'}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="loading">Loading bookings...</div>
	{/if}
</div>

<style>
	.bookings-dashboard {
		max-width: 1000px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--surface-color);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(226, 109, 63, 0.08);
	}
	h1 {
		color: var(--terciary-color);
		margin-top: 0;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: #666;
		margin-bottom: 2rem;
	}
	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #666;
	}
	.empty-state p {
		margin-top: 1rem;
	}
	.bookings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}
	.booking-card {
		background: #f9f9f9;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1.5rem;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.booking-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	}
	.booking-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	.booking-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #333;
		line-height: 1.3;
		padding-right: 10px;
	}
	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.status-pending { background: #fff3e0; color: #e65100; }
	.status-confirmed { background: #e8f5e9; color: #2e7d32; }
	.status-cancelled { background: #ffebee; color: #c62828; }
	.status-completed { background: #e3f2fd; color: #1565c0; }
	.booking-details p {
		margin: 0.75rem 0;
		font-size: 0.9rem;
		color: #555;
		display: flex;
		align-items: center;
	}
</style>
