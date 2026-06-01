import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

export const load: PageLoad = async ({ params, fetch }) => {
	const classId = params.id;

	try {
		const res = await fetch(`${API_BASE_URL}/classes/${classId}`);
		if (!res.ok) {
			if (res.status === 404) {
				throw error(404, 'Class not found');
			}
			throw error(500, 'Failed to fetch class details');
		}

		const classData = await res.json();
		return {
			advert: classData
		};
	} catch (e) {
		console.error('Error fetching class details:', e);
		throw error(404, 'Class not found');
	}
};
