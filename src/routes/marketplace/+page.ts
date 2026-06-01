import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`${API_BASE_URL}/classes`);
		if (!response.ok) throw new Error('Failed to fetch classes');
		const classes = await response.json();

		return { classes };
	} catch (err) {
		console.error(err);
		return { classes: [] };
	}
};
