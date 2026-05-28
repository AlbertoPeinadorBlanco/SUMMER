import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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
	const isBrowser = browser;
	const initialToken = isBrowser ? localStorage.getItem('auth_token') : null;
	const initialUserStr = isBrowser ? localStorage.getItem('auth_user') : null;

	let initialUser = null;
	if (initialUserStr) {
		try {
			initialUser = JSON.parse(initialUserStr);
		} catch (e) {
			initialUser = null;
		}
	}

	const { subscribe, set, update } = writable<{
		token: string | null;
		user: User | null;
		isAuthenticated: boolean;
	}>({
		token: initialToken,
		user: initialUser,
		isAuthenticated: !!initialToken
	});

	return {
		subscribe,
		login: (token: string, user: User) => {
			if (isBrowser) {
				localStorage.setItem('auth_token', token);
				localStorage.setItem('auth_user', JSON.stringify(user));
			}
			set({ token, user, isAuthenticated: true });
		},
		logout: () => {
			if (isBrowser) {
				localStorage.removeItem('auth_token');
				localStorage.removeItem('auth_user');
			}
			set({ token: null, user: null, isAuthenticated: false });
		},
		updateUser: (updates: Partial<User>) => {
			update((state) => {
				if (!state.user) return state;
				const updatedUser = { ...state.user, ...updates };
				if (isBrowser) {
					localStorage.setItem('auth_user', JSON.stringify(updatedUser));
				}
				return { ...state, user: updatedUser };
			});
		}
	};
}

export const auth = createAuthStore();
