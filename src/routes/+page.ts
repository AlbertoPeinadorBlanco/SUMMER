import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${API_BASE_URL}/users/featured`);
		if (res.ok) {
			const data = await res.json();
			return { featured_instructors: data.featured || [] };
		}
	} catch (e) {
		console.error("Failed to load featured instructors", e);
	}
	return { featured_instructors: [] };
};
