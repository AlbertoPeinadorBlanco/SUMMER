<script lang="ts">
	import { t } from 'svelte-i18n';
	
	let { text = '', limit = 200 } = $props();
	let expanded = $state(false);
	
	function toggle(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		expanded = !expanded;
	}
	
	let isLong = $derived(text && text.length > limit);
	let displayText = $derived(isLong && !expanded ? text.substring(0, limit) + '...' : text);
</script>

<span>
	{displayText}
	{#if isLong}
		<button type="button" class="show-more-btn" onclick={toggle}>
			{expanded ? $t('common.show_less') : $t('common.show_more')}
		</button>
	{/if}
</span>

<style>
	.show-more-btn {
		background: none;
		border: none;
		color: var(--primary-color, #1e88e5);
		cursor: pointer;
		padding: 0;
		font-size: inherit;
		font-weight: 500;
		margin-left: 4px;
	}
	.show-more-btn:hover {
		text-decoration: underline;
	}
</style>
