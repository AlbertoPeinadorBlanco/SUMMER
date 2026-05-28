import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('http://127.0.0.1:5000/api/users/featured');
		if (res.ok) {
			const data = await res.json();
			return { featured: data.featured };
		}
	} catch (e) {
		console.error("Failed to load featured instructor", e);
	}
	return { featured: null };
};
