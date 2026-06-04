<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchApi, getMediaUrl } from '$lib/api';
	import { locale, t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import Card, { Content, PrimaryAction, Media } from '@smui/card';
	import BannerAd from '$lib/components/BannerAd.svelte';

	let posts: any[] = $state([]);
	let loading = $state(true);
	let error = $state(null);

	onMount(async () => {
		try {
			posts = await fetchApi('/blog');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString($locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function getLocalizedValue(post: any, key: string) {
		if ($locale === 'es' && post[`${key}_es`]) {
			return post[`${key}_es`];
		}
		return post[key] || '';
	}
</script>

<SEO title="{$t('blog.title', { default: 'Blog' })} - SurfMarket" description="{$t('blog.description', { default: 'Read the latest news about sea activities, beach conditions, and surfing tips.' })}" />

<div class="blog-hero">
	<div class="hero-content">
		<h1>{$t('blog.hero_title', { default: 'SurfMarket Blog' })}</h1>
		<p>{$t('blog.hero_subtitle', { default: 'Latest news, beach conditions, and stories from the sea.' })}</p>
	</div>
</div>

<BannerAd placement="blog_top" />

<div class="blog-container" role="main">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>{$t('common.loading', { default: 'Loading...' })}</p>
		</div>
	{:else if error}
		<div class="error-msg">
			{error}
		</div>
	{:else if posts.length === 0}
		<div class="empty-state">
			<span class="material-icons" style="font-size: 48px; color: #ccc;">article</span>
			<p>{$t('blog.no_posts', { default: 'No blog posts published yet. Check back soon!' })}</p>
		</div>
	{:else}
		<div class="posts-grid">
			{#each posts as post}
				<article class="post-card">
					<Card style="height: 100%; display: flex; flex-direction: column;">
						<PrimaryAction onclick={() => window.location.href = `/blog/${post.slug}`} style="flex: 1; display: flex; flex-direction: column;">
							{#if post.cover_image_url}
								<Media
									class="card-media"
									style="background-image: url('{getMediaUrl(post.cover_image_url)}');"
									aspectRatio="16x9"
								/>
							{:else}
								<Media
									class="card-media placeholder"
									style="background-image: url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');"
									aspectRatio="16x9"
								/>
							{/if}
							<Content style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
								<div class="post-meta">
									<span class="date">{formatDate(post.created_at)}</span>
									{#if post.author_first_name}
										<span class="author">• {$t('blog.by', { default: 'By' })} {post.author_first_name} {post.author_last_name}</span>
									{/if}
								</div>
								<h2 class="post-title">{getLocalizedValue(post, 'title')}</h2>
								{#if getLocalizedValue(post, 'excerpt')}
									<p class="post-excerpt">{getLocalizedValue(post, 'excerpt')}</p>
								{/if}
								<div class="read-more">{$t('blog.read_article', { default: 'Read article' })} <span class="material-icons" style="font-size: 14px;">arrow_forward</span></div>
							</Content>
						</PrimaryAction>
					</Card>
				</article>
			{/each}
		</div>
	{/if}
</div>

<BannerAd placement="blog_bottom" />

<style>
	.blog-hero {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--terciary-color) 100%);
		color: white;
		padding: 4rem 1rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.blog-hero h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
	}

	.blog-hero p {
		font-size: 1.2rem;
		margin: 0;
		opacity: 0.9;
	}

	.blog-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem 4rem;
	}

	.loading-state, .empty-state, .error-msg {
		text-align: center;
		padding: 4rem 0;
		color: #666;
	}

	.error-msg {
		color: var(--mdc-theme-error);
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
	}

	.card-media {
		background-size: cover;
		background-position: center;
	}

	.post-meta {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.post-title {
		font-size: 1.25rem;
		margin: 0 0 0.5rem 0;
		color: var(--terciary-color);
		line-height: 1.3;
	}

	.post-excerpt {
		color: #444;
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0 0 1.5rem 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		flex: 1;
	}

	.read-more {
		margin-top: auto;
		color: var(--primary-color);
		font-weight: bold;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		text-transform: uppercase;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}
	
	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-left-color: var(--primary-color);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
