import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const teacherId = params.id;

	try {
		const userRes = await fetch(`http://127.0.0.1:5000/api/users/${teacherId}`);
		if (!userRes.ok) throw new Error('Teacher not found');
		const u = await userRes.json();

		const classesRes = await fetch(`http://127.0.0.1:5000/api/classes`);
		let allClasses = [];
		if (classesRes.ok) {
			allClasses = await classesRes.json();
		}

		// Filter classes belonging to this instructor
		const teacherClasses = allClasses
			.filter((c: any) => c.instructor_id === Number(teacherId))
			.map((c: any) => ({
				id: c.id,
				title: c.title,
				title_es: c.title_es,
				description: c.description,
				description_es: c.description_es,
				duration: `${c.duration_minutes} Minutes`,
				class_type: c.class_type,
				difficulty_level: c.difficulty_level,
				price: c.price
			}));

		const images = [
			'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
			'https://images.unsplash.com/photo-1516584288019-3ee448c5e626?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
			'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
		];

		const isFeatured = u.featured_until && new Date(u.featured_until) > new Date();

		const teacher = {
			id: u.id,
			name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
			specialty: u.specialization || 'Surfing Instructor',
			location: teacherClasses.length > 0 ? teacherClasses[0].location || 'Beach' : 'Beach',
			price: teacherClasses.length > 0 ? teacherClasses[0].price : 50,
			image: u.profile_picture_url ? `http://localhost:5000${u.profile_picture_url}` : images[u.id % images.length],
			bio: u.bio || 'Passionate surfing instructor ready to hit the waves!',
			tier: u.tier || 'basic',
			// Perks — only expose values if the upgrade was purchased
			video_url: u.has_video_upgrade ? u.video_url : null,
			booking_link: u.has_link_upgrade ? u.booking_link : null,
			available_today: u.has_badge_upgrade ? !!u.available_today : false,
			is_featured: isFeatured,
			featured_until: u.featured_until,
			has_video_upgrade: !!u.has_video_upgrade,
			has_link_upgrade: !!u.has_link_upgrade,
			has_badge_upgrade: !!u.has_badge_upgrade,
			classes: teacherClasses
		};

		return { teacher };
	} catch (err) {
		console.error(err);
		return { teacher: null };
	}
};
