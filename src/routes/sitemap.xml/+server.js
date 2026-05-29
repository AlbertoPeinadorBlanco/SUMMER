export async function GET({ fetch, url }) {
	const site = url.origin;

	try {
		// Fetch dynamic routes from backend API
		const res = await fetch('http://127.0.0.1:5000/api/sitemap-data');
		let dynamicRoutes = { classes: [], instructors: [] };
		if (res.ok) {
			dynamicRoutes = await res.json();
		}

		// List of static pages
		const pages = [
			{ path: '', changefreq: 'daily', priority: 1.0 },
			{ path: '/marketplace', changefreq: 'hourly', priority: 0.9 },
			{ path: '/instructors', changefreq: 'daily', priority: 0.8 },
			{ path: '/adverts', changefreq: 'daily', priority: 0.8 },
			{ path: '/policies', changefreq: 'monthly', priority: 0.5 },
			{ path: '/gear-guide', changefreq: 'weekly', priority: 0.7 },
			{ path: '/contact', changefreq: 'monthly', priority: 0.5 },
			{ path: '/about', changefreq: 'monthly', priority: 0.6 },
			{ path: '/bookings', changefreq: 'daily', priority: 0.6 },
			{ path: '/instructor/manage-ads', changefreq: 'weekly', priority: 0.6 },
			{ path: '/levels', changefreq: 'monthly', priority: 0.5 },
			{ path: '/profile', changefreq: 'daily', priority: 0.7 },
			{ path: '/signup', changefreq: 'yearly', priority: 0.8 },
			{ path: '/sitemap', changefreq: 'monthly', priority: 0.4 }
		];

		let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

		// Add static pages
		pages.forEach(page => {
			xml += `
	<url>
		<loc>${site}${page.path}</loc>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`;
		});

		// Add dynamic classes
		dynamicRoutes.classes?.forEach(c => {
			xml += `
	<url>
		<loc>${site}/marketplace/class/${c.id}</loc>
		<lastmod>${new Date(c.lastmod).toISOString()}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>`;
		});

		// Add dynamic instructors
		dynamicRoutes.instructors?.forEach(i => {
			xml += `
	<url>
		<loc>${site}/profile/${i.id}</loc>
		<lastmod>${new Date(i.lastmod).toISOString()}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>`;
		});

		xml += `\n</urlset>`;

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'max-age=0, s-maxage=3600'
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
}
