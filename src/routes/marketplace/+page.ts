import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('http://localhost:5000/api/classes');
		if (!response.ok) throw new Error('Failed to fetch classes');
		const classes = await response.json();

		return { classes };
	} catch (err) {
		console.error(err);
		return { classes: [] };
	}
};
