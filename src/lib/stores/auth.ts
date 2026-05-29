import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { API_BASE_URL } from '$lib/api';

export interface User {
	id: number;
	username: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	profile_picture_url?: string;
	role?: string;
	tier?: string;
	has_video_upgrade?: boolean;
	has_link_upgrade?: boolean;
	has_badge_upgrade?: boolean;
	video_url?: string;
	booking_link?: string;
	available_today?: boolean;
}

function createAuthStore() {
	// Restore user profile from sessionStorage to avoid UI flash on reload
	// (The actual auth is verified via the httpOnly cookie — this is just for display)
	const storedUser = browser ? sessionStorage.getItem('auth_user') : null;
	let initialUser: User | null = null;
	if (storedUser) {
		try { initialUser = JSON.parse(storedUser); } catch { initialUser = null; }
	}

	const { subscribe, set, update } = writable<{
		user: User | null;
		isAuthenticated: boolean;
		isLoading: boolean;
	}>({
		user: initialUser,
		isAuthenticated: !!initialUser,
		isLoading: !initialUser // still loading if no cached user
	});

	// Called after login/register to set user state
	function setUser(user: User) {
		if (browser) sessionStorage.setItem('auth_user', JSON.stringify(user));
		set({ user, isAuthenticated: true, isLoading: false });
	}

	// Restore session on page load by calling /api/auth/me
	async function restoreSession() {
		if (!browser) return;
		try {
			const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
			if (res.ok) {
				const user: User = await res.json();
				setUser(user);
			} else {
				set({ user: null, isAuthenticated: false, isLoading: false });
				if (browser) sessionStorage.removeItem('auth_user');
			}
		} catch {
			set({ user: null, isAuthenticated: false, isLoading: false });
		}
	}

	return {
		subscribe,
		login: (user: User) => setUser(user),
		logout: async () => {
			try {
				await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
			} catch { /* ignore */ }
			if (browser) sessionStorage.removeItem('auth_user');
			set({ user: null, isAuthenticated: false, isLoading: false });
			if (browser) goto('/');
		},
		restoreSession,
		updateUser: (updates: Partial<User>) => {
			update((state) => {
				if (!state.user) return state;
				const updatedUser = { ...state.user, ...updates };
				if (browser) sessionStorage.setItem('auth_user', JSON.stringify(updatedUser));
				return { ...state, user: updatedUser };
			});
		}
	};
}

export const auth = createAuthStore();
