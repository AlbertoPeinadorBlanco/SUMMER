import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('http://127.0.0.1:5000/api/classes');
		if (!response.ok) throw new Error('Failed to fetch classes');
		const classes = await response.json();

		return { classes };
	} catch (err) {
		console.error(err);
		return { classes: [] };
	}
};
