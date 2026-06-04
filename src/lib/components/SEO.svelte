<script lang="ts">
	import { t } from 'svelte-i18n';
	import { page } from '$app/stores';

	let {
		title = '',
		description = '',
		image = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
		type = 'website',
		canonical = '',
		author = '',
		publishedTime = '',
		schema = null
	} = $props<{ 
		title?: string; 
		description?: string; 
		image?: string; 
		type?: string;
		canonical?: string;
		author?: string;
		publishedTime?: string;
		schema?: any;
	}>();

	let fullTitle = $derived(title ? `${title} | ${$t('app.title')}` : $t('app.title'));
	let finalDescription = $derived(description || $t('app.meta_description'));
	let url = $derived($page.url.href);
	let finalCanonical = $derived(canonical || url);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={finalDescription} />
	<link rel="canonical" href={finalCanonical} />
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={finalDescription} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content={$t('app.title')} />
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={fullTitle} />
	<meta property="twitter:description" content={finalDescription} />
	<meta property="twitter:image" content={image} />

	<!-- Search Engine specific -->
	<meta name="robots" content="index, follow" />
	<meta
		name="googlebot"
		content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
	/>

	{#if schema}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
	{/if}
</svelte:head>
