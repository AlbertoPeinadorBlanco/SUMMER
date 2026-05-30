<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { fetchApi } from '$lib/api';
	import { t } from 'svelte-i18n';
	import SEO from '$lib/components/SEO.svelte';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Tab, { Label as TabLabel } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import Textfield from '@smui/textfield';
	import Select, { Option } from '@smui/select';

	let activeTab = $state('analytics');
	let auditLogs: any[] = $state([]);
	let userAuditLogs: any[] = $state([]);
	let analytics: any = $state({
		total_requests: 0,
		avg_response_time: 0,
		error_count: 0,
		popular_endpoints: []
	});
	let loading = $state(true);

	// Filters
	let filterAction = $state('All');
	let filterEntity = $state('All');
	let searchQuery = $state('');

	let uniqueActions = $derived(
		Array.from(new Set(
			(activeTab === 'user_audit' ? userAuditLogs : auditLogs).map(l => l.action)
		)).sort()
	);

	let uniqueEntities = $derived(
		Array.from(new Set(
			(activeTab === 'user_audit' ? userAuditLogs : auditLogs).map(l => l.entity_type)
		)).sort()
	);

	$effect(() => {
		// Reset filters on tab change
		if (activeTab) {
			filterAction = 'All';
			filterEntity = 'All';
			searchQuery = '';
		}
	});

	let filteredUserLogs = $derived(
		userAuditLogs.filter(log => {
			const actionMatch = filterAction === 'All' ? true : log.action === filterAction;
			const entityMatch = filterEntity === 'All' ? true : log.entity_type === filterEntity;
			const searchMatch = searchQuery ? (
				(log.user_username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(log.details ? JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()) : false)
			) : true;
			return actionMatch && entityMatch && searchMatch;
		})
	);

	let filteredAuditLogs = $derived(
		auditLogs.filter(log => {
			const actionMatch = filterAction === 'All' ? true : log.action === filterAction;
			const entityMatch = filterEntity === 'All' ? true : log.entity_type === filterEntity;
			const searchMatch = searchQuery ? (
				(log.admin_username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(log.details ? JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()) : false)
			) : true;
			return actionMatch && entityMatch && searchMatch;
		})
	);

	onMount(async () => {
		if (!$auth.isAuthenticated || $auth.user?.role !== 'admin') {
			goto('/');
			return;
		}
		await fetchAllData();
	});

	async function fetchAllData() {
		try {
			loading = true;
			const [logsRes, userLogsRes, analyticsRes] = await Promise.all([
				fetchApi('/logs/audit'),
				fetchApi('/logs/user-audit'),
				fetchApi('/logs/analytics')
			]);

			if (logsRes) auditLogs = logsRes;
			if (userLogsRes) userAuditLogs = userLogsRes;
			if (analyticsRes) analytics = analyticsRes;
		} catch (error) {
			console.error('Failed to fetch logs and analytics', error);
		} finally {
			loading = false;
		}
	}
</script>

<SEO title={$t('admin.logs_title')} />

<div class="admin-container">
	<div class="header">
		<h1>{$t('admin.logs_title')}</h1>
		<p>{$t('admin.logs_subtitle')}</p>
	</div>

	<TabBar tabs={['analytics', 'user_audit', 'audit']} bind:active={activeTab}>
		{#snippet tab(tab: any)}
			<Tab {tab}>
				<TabLabel>{tab === 'analytics' ? $t('admin.tab_analytics') : tab === 'user_audit' ? $t('admin.tab_user_audit') : $t('admin.tab_audit')}</TabLabel>
			</Tab>
		{/snippet}
	</TabBar>

	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
		</div>
	{:else}
		<div class="tab-content">
			{#if activeTab === 'user_audit' || activeTab === 'audit'}
				<div class="filter-bar" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: var(--surface-color); padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); align-items: center;">
					<div style="flex: 1;">
						<Select bind:value={filterAction} label="Filter by Action" style="width: 100%;">
							<Option value="All">All Actions</Option>
							{#each uniqueActions as action}
								<Option value={action}>{action}</Option>
							{/each}
						</Select>
					</div>
					<div style="flex: 1;">
						<Select bind:value={filterEntity} label="Filter by Entity" style="width: 100%;">
							<Option value="All">All Entities</Option>
							{#each uniqueEntities as entity}
								<Option value={entity}>{entity}</Option>
							{/each}
						</Select>
					</div>
					<div style="flex: 1.5;">
						<Textfield bind:value={searchQuery} label="Search User or Details..." style="width: 100%;">
							{#snippet trailingIcon()}
								<span class="material-icons">search</span>
							{/snippet}
						</Textfield>
					</div>
				</div>
			{/if}

			{#if activeTab === 'analytics'}
				<div class="kpi-grid">
					<div class="kpi-card">
						<h3>{$t('admin.analytics_total_req')}</h3>
						<div class="kpi-value">{analytics.total_requests}</div>
					</div>
					<div class="kpi-card">
						<h3>{$t('admin.analytics_avg_time')}</h3>
						<div class="kpi-value">{analytics.avg_response_time}ms</div>
					</div>
					<div class="kpi-card error-card">
						<h3>{$t('admin.analytics_errors')}</h3>
						<div class="kpi-value">{analytics.error_count}</div>
					</div>
				</div>

				<div class="table-container" style="margin-top: 2rem;">
					<h3 style="padding: 1rem 1.5rem; margin: 0; background: #fafafa; border-bottom: 1px solid var(--border-color);">
						{$t('admin.analytics_popular')}
					</h3>
					<DataTable style="width: 100%;">
						<Head>
							<Row>
								<Cell>{$t('admin.analytics_endpoint')}</Cell>
								<Cell numeric>{$t('admin.analytics_hits')}</Cell>
								<Cell numeric>{$t('admin.analytics_avg_time')}</Cell>
							</Row>
						</Head>
						<Body>
							{#each analytics.popular_endpoints as ep}
								<Row>
									<Cell>{ep.endpoint}</Cell>
									<Cell numeric>{ep.hits}</Cell>
									<Cell numeric>{parseFloat(ep.avg_time).toFixed(1)}ms</Cell>
								</Row>
							{/each}
						</Body>
					</DataTable>
				</div>
			{:else if activeTab === 'user_audit'}
				<div class="table-container">
					<DataTable style="width: 100%;">
						<Head>
							<Row>
								<Cell>{$t('admin.audit_date')}</Cell>
								<Cell>{$t('admin.user')}</Cell>
								<Cell>IP Address</Cell>
								<Cell>{$t('admin.audit_action')}</Cell>
								<Cell>{$t('admin.audit_entity')}</Cell>
								<Cell>{$t('admin.audit_entity_id')}</Cell>
								<Cell>{$t('admin.audit_details')}</Cell>
							</Row>
						</Head>
						<Body>
							{#each filteredUserLogs as log}
								<Row>
									<Cell>{new Date(log.created_at).toLocaleString()}</Cell>
									<Cell>
										<span class="admin-badge">{log.user_username}</span>
									</Cell>
									<Cell>{log.ip_address || '-'}</Cell>
									<Cell>
										<span class="action-badge {log.action.toLowerCase()}">{log.action}</span>
									</Cell>
									<Cell>{log.entity_type}</Cell>
									<Cell>{log.entity_id || '-'}</Cell>
									<Cell>
										<div class="details-cell" title={log.details ? JSON.stringify(log.details) : ''}>
											{log.details ? JSON.stringify(log.details) : '-'}
										</div>
									</Cell>
								</Row>
							{/each}
						</Body>
					</DataTable>
				</div>
			{:else}
				<div class="table-container">
					<DataTable style="width: 100%;">
						<Head>
							<Row>
								<Cell>{$t('admin.audit_date')}</Cell>
								<Cell>{$t('admin.audit_admin')}</Cell>
								<Cell>IP Address</Cell>
								<Cell>{$t('admin.audit_action')}</Cell>
								<Cell>{$t('admin.audit_entity')}</Cell>
								<Cell>{$t('admin.audit_entity_id')}</Cell>
								<Cell>{$t('admin.audit_details')}</Cell>
							</Row>
						</Head>
						<Body>
							{#each filteredAuditLogs as log}
								<Row>
									<Cell>{new Date(log.created_at).toLocaleString()}</Cell>
									<Cell>
										<span class="admin-badge">{log.admin_username}</span>
									</Cell>
									<Cell>{log.ip_address || '-'}</Cell>
									<Cell>
										<span class="action-badge {log.action.toLowerCase()}">{log.action}</span>
									</Cell>
									<Cell>{log.entity_type}</Cell>
									<Cell>{log.entity_id || '-'}</Cell>
									<Cell>
										<div class="details-cell" title={log.details ? JSON.stringify(log.details) : ''}>
											{log.details ? JSON.stringify(log.details) : '-'}
										</div>
									</Cell>
								</Row>
							{/each}
						</Body>
					</DataTable>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	.header {
		margin-bottom: 2rem;
	}
	.header h1 {
		margin: 0;
		color: #0d1b2a;
		font-size: 2.5rem;
		font-weight: 800;
	}
	.header p {
		margin: 0.5rem 0 0;
		color: #415a77;
	}
	.tab-content {
		margin-top: 1.5rem;
	}
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}
	.kpi-card {
		background: var(--surface-color);
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
		border-left: 4px solid var(--primary-color);
	}
	.error-card {
		border-left-color: #d32f2f;
	}
	.kpi-card h3 {
		margin: 0 0 0.5rem 0;
		color: #666;
		font-size: 1rem;
		font-weight: 500;
	}
	.kpi-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--terciary-color);
	}
	.table-container {
		background: var(--surface-color);
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.05);
		overflow: hidden;
	}
	.admin-badge {
		background: #f0f4f8;
		padding: 2px 8px;
		border-radius: 12px;
		font-weight: 600;
		color: var(--secondary-color);
	}
	.action-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
	}
	.create { background: #e8f5e9; color: #2e7d32; }
	.update { background: #fff3e0; color: #ef6c00; }
	.delete { background: #ffebee; color: #c62828; }
	
	.details-cell {
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: monospace;
		font-size: 0.85rem;
		color: #555;
	}

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
