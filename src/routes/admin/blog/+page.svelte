<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { fetchApi, getMediaUrl } from '$lib/api';
	import SEO from '$lib/components/SEO.svelte';
	import Button, { Label } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import Checkbox from '@smui/checkbox';
	import IconButton from '@smui/icon-button';
	import { showToast } from '$lib/stores/toast';

	let posts: any[] = $state([]);
	let loading = $state(true);

	// Modals
	let isCreateEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	
	// Form state
	let isEditing = $state(false);
	let currentPostId = $state(null);
	let formTitle = $state('');
	let formTitleEs = $state('');
	let formExcerpt = $state('');
	let formExcerptEs = $state('');
	let formContent = $state('');
	let formContentEs = $state('');
	let formCoverImage = $state('');
	let formIsPublished = $state(true);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchPosts();
	});

	async function fetchPosts() {
		try {
			loading = true;
			posts = await fetchApi('/blog?all=true');
		} catch (err: any) {
			showToast(err.message, 'error');
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		isEditing = false;
		currentPostId = null;
		formTitle = '';
		formTitleEs = '';
		formExcerpt = '';
		formExcerptEs = '';
		formContent = '';
		formContentEs = '';
		formCoverImage = '';
		formIsPublished = true;
		isCreateEditModalOpen = true;
	}

	function openEditModal(post: any) {
		isEditing = true;
		currentPostId = post.id;
		formTitle = post.title;
		formTitleEs = post.title_es || '';
		formExcerpt = post.excerpt || '';
		formExcerptEs = post.excerpt_es || '';
		formContent = post.content || '';
		formContentEs = post.content_es || '';
		formCoverImage = post.cover_image_url || '';
		formIsPublished = post.is_published === 1;
		isCreateEditModalOpen = true;
	}

	function openDeleteModal(post: any) {
		currentPostId = post.id;
		isDeleteModalOpen = true;
	}

	async function savePost() {
		if (!formTitle.trim() || !formContent.trim()) {
			showToast('Title and content are required', 'error');
			return;
		}

		try {
			const payload = {
				title: formTitle,
				title_es: formTitleEs,
				excerpt: formExcerpt,
				excerpt_es: formExcerptEs,
				content: formContent,
				content_es: formContentEs,
				cover_image_url: formCoverImage,
				is_published: formIsPublished
			};

			if (isEditing) {
				await fetchApi(`/blog/${currentPostId}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
				showToast('Blog post updated successfully', 'success');
			} else {
				await fetchApi('/blog', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				showToast('Blog post created successfully', 'success');
			}
			isCreateEditModalOpen = false;
			await fetchPosts();
		} catch (err: any) {
			showToast(err.message || 'Error saving post', 'error');
		}
	}

	async function deletePost() {
		try {
			await fetchApi(`/blog/${currentPostId}`, { method: 'DELETE' });
			showToast('Blog post deleted', 'success');
			isDeleteModalOpen = false;
			await fetchPosts();
		} catch (err: any) {
			showToast(err.message || 'Error deleting post', 'error');
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<SEO title="Manage Blog - Admin" />

<div class="admin-container">
	<div class="header-actions">
		<h1>Manage Blog</h1>
		<Button variant="raised" onclick={openCreateModal} class="premium-button">
			<span class="material-icons" style="margin-right: 8px;">add</span>
			<Label>New Post</Label>
		</Button>
	</div>

	{#if loading}
		<p>Loading posts...</p>
	{:else}
		<DataTable table$aria-label="Blog posts list" style="width: 100%;">
			<Head>
				<Row>
					<Cell>ID</Cell>
					<Cell>Title</Cell>
					<Cell>Author</Cell>
					<Cell>Status</Cell>
					<Cell>Date</Cell>
					<Cell>Actions</Cell>
				</Row>
			</Head>
			<Body>
				{#each posts as post (post.id)}
					<Row>
						<Cell>{post.id}</Cell>
						<Cell>
							<div class="title-cell">
								{#if post.cover_image_url}
									<img src={getMediaUrl(post.cover_image_url)} alt="Cover" class="tiny-cover" />
								{:else}
									<div class="tiny-cover placeholder"><span class="material-icons">image</span></div>
								{/if}
								<strong>{post.title}</strong>
							</div>
						</Cell>
						<Cell>{post.author_first_name} {post.author_last_name}</Cell>
						<Cell>
							<span class="status-badge {post.is_published ? 'published' : 'draft'}">
								{post.is_published ? 'Published' : 'Draft'}
							</span>
						</Cell>
						<Cell>{formatDate(post.created_at)}</Cell>
						<Cell>
							<IconButton class="material-icons" onclick={() => window.open(`/blog/${post.slug}`, '_blank')} title="View Post">visibility</IconButton>
							<IconButton class="material-icons" onclick={() => openEditModal(post)} title="Edit">edit</IconButton>
							<IconButton class="material-icons" onclick={() => openDeleteModal(post)} style="color: #e63946;" title="Delete">delete</IconButton>
						</Cell>
					</Row>
				{/each}
				{#if posts.length === 0}
					<Row>
						<Cell colspan={6} style="text-align: center;">No blog posts found. Create one!</Cell>
					</Row>
				{/if}
			</Body>
		</DataTable>
	{/if}
</div>

<!-- Create/Edit Modal -->
<Dialog
	bind:open={isCreateEditModalOpen}
	aria-labelledby="post-modal-title"
	aria-describedby="post-modal-content"
	surface$style="width: 800px; max-width: calc(100vw - 32px);"
>
	<Title id="post-modal-title">{isEditing ? 'Edit Post' : 'Create New Post'}</Title>
	<Content id="post-modal-content">
		<form class="post-form" onsubmit={(e) => { e.preventDefault(); savePost(); }}>
			<div class="form-row" style="display: flex; gap: 1rem;">
				<Textfield bind:value={formTitle} label="Title (EN)" style="width: 100%;" required />
				<Textfield bind:value={formTitleEs} label="Title (ES)" style="width: 100%;" />
			</div>
			
			<div class="form-row" style="display: flex; gap: 1rem;">
				<Textfield bind:value={formExcerpt} label="Excerpt (EN)" style="width: 100%;" />
				<Textfield bind:value={formExcerptEs} label="Excerpt (ES)" style="width: 100%;" />
			</div>

			<div class="form-row">
				<Textfield bind:value={formCoverImage} label="Cover Image URL (e.g. from Unsplash)" style="width: 100%;" />
				{#if formCoverImage}
					<div class="preview-img">
						<img src={getMediaUrl(formCoverImage)} alt="Preview" />
					</div>
				{/if}
			</div>

			<div class="form-row" style="display: flex; gap: 1rem;">
				<div class="editor-container" style="flex: 1;">
					<label for="content-editor">Content (EN) (HTML allowed)</label>
					<textarea 
						id="content-editor"
						bind:value={formContent} 
						rows="12" 
						placeholder="Write your blog post in English here..."
						required
					></textarea>
				</div>
				<div class="editor-container" style="flex: 1;">
					<label for="content-editor-es">Content (ES) (HTML allowed)</label>
					<textarea 
						id="content-editor-es"
						bind:value={formContentEs} 
						rows="12" 
						placeholder="Escribe tu entrada de blog en español aquí..."
					></textarea>
				</div>
			</div>

			<div class="form-row switch-row">
				<div style="display: flex; align-items: center; gap: 10px;">
					<Checkbox bind:checked={formIsPublished} />
					<Label>Publish immediately</Label>
				</div>
			</div>
		</form>
	</Content>
	<Actions>
		<Button onclick={() => isCreateEditModalOpen = false}>Cancel</Button>
		<Button variant="raised" onclick={savePost}>{isEditing ? 'Update Post' : 'Create Post'}</Button>
	</Actions>
</Dialog>

<!-- Delete Modal -->
<Dialog
	bind:open={isDeleteModalOpen}
	aria-labelledby="delete-modal-title"
	aria-describedby="delete-modal-content"
>
	<Title id="delete-modal-title">Delete Blog Post</Title>
	<Content id="delete-modal-content">
		Are you sure you want to delete this blog post? This action cannot be undone.
	</Content>
	<Actions>
		<Button onclick={() => isDeleteModalOpen = false}>Cancel</Button>
		<Button onclick={deletePost} style="color: #e63946;">Delete</Button>
	</Actions>
</Dialog>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.title-cell {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.tiny-cover {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		object-fit: cover;
	}

	.tiny-cover.placeholder {
		background: #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: bold;
		text-transform: uppercase;
	}

	.status-badge.published {
		background: #e6f4ea;
		color: #1e8e3e;
	}

	.status-badge.draft {
		background: #fef7e0;
		color: #f29900;
	}

	.form-row {
		margin-bottom: 1.5rem;
	}

	.preview-img {
		margin-top: 0.5rem;
		height: 120px;
		border-radius: 8px;
		overflow: hidden;
	}

	.preview-img img {
		height: 100%;
		object-fit: cover;
	}

	.editor-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.editor-container label {
		font-weight: 500;
		color: #555;
	}

	.editor-container textarea {
		width: 100%;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
	}

	.editor-container textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
	}
</style>
