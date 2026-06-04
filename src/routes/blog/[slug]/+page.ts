import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
	const slug = params.slug;

	try {
		const res = await fetch(`${API_BASE_URL}/blog/${slug}`);
		if (!res.ok) {
            throw new Error('Blog post not found');
        }
		
        const post = await res.json();

		return {
			post
		};
	} catch (error) {
		console.error('Error loading blog post:', error);
		return {
			post: null
		};
	}
};
