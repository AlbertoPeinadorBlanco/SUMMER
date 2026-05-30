import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('http://127.0.0.1:5000/api/users/featured');
		if (res.ok) {
			const data = await res.json();
			return { featured_instructors: data.featured || [] };
		}
	} catch (e) {
		console.error("Failed to load featured instructors", e);
	}
	return { featured_instructors: [] };
};
