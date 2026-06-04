<script lang="ts">
	import { getMediaUrl } from '$lib/api';
	import { locale, t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Button from '@smui/button';
	import BannerAd from '$lib/components/BannerAd.svelte';

	let { data } = $props();
	let post = data.post;

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString($locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function getLocalizedValue(post: any, key: string) {
		if ($locale === 'es' && post[`${key}_es`]) {
			return post[`${key}_es`];
		}
		return post[key] || '';
	}

	function createMarkup(html: string) {
		return html;
	}
</script>

{#if !post}
	<SEO title="{$t('blog.not_found_title', { default: 'Post Not Found' })} - SurfMarket" description="{$t('blog.not_found_desc', { default: 'The requested blog post could not be found.' })}" />
	<div class="error-container">
		<h1>{$t('blog.not_found_title', { default: 'Post Not Found' })}</h1>
		<p>{$t('blog.not_found_desc', { default: "The blog post you're looking for doesn't exist or has been removed." })}</p>
		<Button href="/blog" variant="raised">{$t('blog.back_to_blog', { default: 'Back to Blog' })}</Button>
	</div>
{:else}
	<SEO 
		title="{getLocalizedValue(post, 'title')} - SurfMarket Blog" 
		description={getLocalizedValue(post, 'excerpt') || getLocalizedValue(post, 'title')} 
		image={post.cover_image_url ? getMediaUrl(post.cover_image_url) : undefined} 
	/>

	<article class="post-container">
		<header class="post-header">
			<Button href="/blog" class="back-btn">
				<span class="material-icons" style="font-size: 18px; margin-right: 4px;">arrow_back</span>
				{$t('blog.back_to_blog', { default: 'Back to Blog' })}
			</Button>

			<h1 class="post-title">{getLocalizedValue(post, 'title')}</h1>
			
			<div class="post-meta">
				<div class="author-info">
					{#if post.author_avatar}
						<img src={getMediaUrl(post.author_avatar)} alt="Author avatar" class="author-avatar" />
					{:else}
						<div class="author-avatar placeholder">
							<span class="material-icons">person</span>
						</div>
					{/if}
					<span class="author-name">{post.author_first_name} {post.author_last_name}</span>
				</div>
				<span class="meta-divider">•</span>
				<span class="post-date">{formatDate(post.created_at)}</span>
			</div>
		</header>

		{#if post.cover_image_url}
			<div class="post-cover">
				<img src={getMediaUrl(post.cover_image_url)} alt={post.title} />
			</div>
		{/if}

		<div class="post-content">
			{@html createMarkup(getLocalizedValue(post, 'content'))}
		</div>
		
		<BannerAd placement="blog_bottom" />
	</article>
{/if}

<style>
	.error-container {
		text-align: center;
		padding: 6rem 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.error-container h1 {
		font-size: 2.5rem;
		color: var(--terciary-color);
		margin-bottom: 1rem;
	}

	.post-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 1rem 5rem;
	}

	.post-header {
		margin-bottom: 2.5rem;
	}

	.post-title {
		font-size: 2.8rem;
		line-height: 1.2;
		color: var(--terciary-color);
		margin: 1.5rem 0;
		font-weight: 800;
	}

	.post-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		color: #666;
		font-size: 0.95rem;
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.author-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.author-avatar.placeholder {
		background: #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
	}

	.author-name {
		font-weight: 600;
		color: #333;
	}

	.meta-divider {
		color: #ccc;
	}

	.post-cover {
		margin-bottom: 3rem;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0,0,0,0.1);
	}

	.post-cover img {
		width: 100%;
		height: auto;
		display: block;
	}

	.post-content {
		font-size: 1.15rem;
		line-height: 1.8;
		color: #333;
	}

	/* Rich text styling for content */
	.post-content :global(h2) {
		font-size: 2rem;
		margin: 2.5rem 0 1rem;
		color: var(--terciary-color);
	}

	.post-content :global(h3) {
		font-size: 1.5rem;
		margin: 2rem 0 1rem;
		color: var(--terciary-color);
	}

	.post-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.post-content :global(ul), .post-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.post-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.post-content :global(blockquote) {
		border-left: 4px solid var(--primary-color);
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: #555;
		background: #f9f9f9;
		padding: 1.5rem;
		border-radius: 0 8px 8px 0;
	}

	.post-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 2rem 0;
	}

	.post-content :global(a) {
		color: var(--primary-color);
		text-decoration: underline;
	}
	
	@media (max-width: 768px) {
		.post-title {
			font-size: 2.2rem;
		}
	}
</style>
