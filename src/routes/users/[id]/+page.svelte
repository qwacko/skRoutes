<script lang="ts">
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes.svelte.js';
	import { page } from '$app/state';

	const { data } = $props();

	// Reactive state management with URL updates
	const urlInfo = pageInfo('/users/[id]', () => page);

	const tabs = ['profile', 'settings', 'billing'] as const;
	const sortOptions = ['name', 'date', 'activity'] as const;

	// Demo user data
	const userData = {
		profile: {
			name: 'John Doe',
			email: 'john@example.com',
			avatar: '👤',
			joinDate: '2023-01-15'
		},
		settings: {
			theme: 'dark',
			notifications: true,
			language: 'en'
		},
		billing: {
			plan: 'Pro',
			nextBilling: '2024-02-15',
			amount: '$29/month'
		}
	};

	function switchTab(tab: (typeof tabs)[number]) {
		urlInfo.updateParams({ searchParams: { tab } });
	}

	function changePage(page: number) {
		urlInfo.updateParams({ searchParams: { page } });
	}

	function changeSort(sort: (typeof sortOptions)[number]) {
		urlInfo.updateParams({ searchParams: { sort } });
	}

	// Generate example URLs for different users
	const exampleUsers = [
		{ id: '550e8400-e29b-41d4-a716-446655440000', name: 'Alice' },
		{ id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', name: 'Bob' },
		{ id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', name: 'Charlie' }
	];

	const activeTab = $derived(urlInfo.current.searchParams.tab || 'profile');
	const currentPage = $derived(urlInfo.current.searchParams.page || 1);
	const sortBy = $derived(urlInfo.current.searchParams.sort || 'name');
</script>

<div class="user-page">
	<header class="user-header">
		<div class="user-info">
			<span class="avatar">👤</span>
			<div>
				<h1>User Profile</h1>
				<p class="user-id">ID: {urlInfo.current.params.id}</p>
			</div>
		</div>

		<div class="url-info">
			<h3>🔗 Current URL State</h3>
			<div class="url-display">
				<code>{page.url.pathname}{page.url.search}</code>
			</div>
		</div>
	</header>

	<section class="demo-section">
		<h2>🎯 Reactive State Management Demo</h2>
		<p>Watch how URL parameters update reactively with debounced navigation:</p>

		<div class="controls-grid">
			<div class="control-group">
				<h3>Tab Navigation</h3>
				<div class="tab-buttons">
					{#each tabs as tab}
						<button
							onclick={() => switchTab(tab)}
							class="tab-button"
							class:active={activeTab === tab}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					{/each}
				</div>
			</div>

			<div class="control-group">
				<h3>Pagination</h3>
				<div class="pagination">
					{#each [1, 2, 3, 4, 5] as pageNum}
						<button
							onclick={() => changePage(pageNum)}
							class="page-button"
							class:active={currentPage === pageNum}
						>
							{pageNum}
						</button>
					{/each}
				</div>
			</div>

			<div class="control-group">
				<h3>Sort Options</h3>
				<select
					value={sortBy}
					onchange={(e) => changeSort((e.target as HTMLSelectElement).value as any)}
					class="sort-select"
				>
					{#each sortOptions as option}
						<option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>📊 Current State</h2>
		<div class="state-display">
			<div class="state-item">
				<strong>Active Tab:</strong>
				<span class="badge">{activeTab}</span>
			</div>
			<div class="state-item">
				<strong>Current Page:</strong>
				<span class="badge">{currentPage}</span>
			</div>
			<div class="state-item">
				<strong>Sort By:</strong>
				<span class="badge">{sortBy}</span>
			</div>
		</div>

		<div class="content-area">
			{#if activeTab === 'profile'}
				<div class="tab-content">
					<h3>👤 Profile Information</h3>
					<div class="profile-info">
						<p><strong>Name:</strong> {userData.profile.name}</p>
						<p><strong>Email:</strong> {userData.profile.email}</p>
						<p><strong>Joined:</strong> {userData.profile.joinDate}</p>
					</div>
				</div>
			{:else if activeTab === 'settings'}
				<div class="tab-content">
					<h3>⚙️ Settings</h3>
					<div class="settings-info">
						<p><strong>Theme:</strong> {userData.settings.theme}</p>
						<p>
							<strong>Notifications:</strong>
							{userData.settings.notifications ? 'Enabled' : 'Disabled'}
						</p>
						<p><strong>Language:</strong> {userData.settings.language}</p>
					</div>
				</div>
			{:else if activeTab === 'billing'}
				<div class="tab-content">
					<h3>💳 Billing</h3>
					<div class="billing-info">
						<p><strong>Plan:</strong> {userData.billing.plan}</p>
						<p><strong>Amount:</strong> {userData.billing.amount}</p>
						<p><strong>Next Billing:</strong> {userData.billing.nextBilling}</p>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<section class="demo-section">
		<h2>🔗 URL Generation Examples</h2>
		<p>Try different users with the same tab/page/sort parameters:</p>

		<div class="user-links">
			{#each exampleUsers as user}
				{@const userUrl = urlGenerator({
					address: '/users/[id]',
					paramsValue: { id: user.id },
					searchParamsValue: {
						tab: activeTab,
						page: currentPage,
						sort: sortBy
					}
				})}
				<a href={userUrl.url} class="user-link">
					<span class="user-name">{user.name}</span>
					<small>ID: {user.id.slice(0, 8)}...</small>
				</a>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>🧪 Type Safety Demo</h2>
		<div class="type-info">
			<p>All parameters are fully typed based on the Zod schema:</p>
			<div class="code-block">
				<pre><code
						>// Route configuration with UUID validation
paramsValidation: z.object(&#123;
  id: z.uuid()
&#125;),
searchParamsValidation: z.object(&#123;
  tab: z.enum(['profile', 'settings', 'billing']).optional(),
  page: z.coerce.number().positive().default(1),
  sort: z.enum(['name', 'date', 'activity']).default('name')
&#125;)</code
					></pre>
			</div>
			<p>TypeScript knows:</p>
			<ul>
				<li><code>current.params.id</code> is a <strong>string</strong> (validated as UUID)</li>
				<li>
					<code>current.searchParams.tab</code> is
					<strong>'profile' | 'settings' | 'billing' | undefined</strong>
				</li>
				<li><code>current.searchParams.page</code> is a <strong>number</strong> (positive)</li>
				<li>
					<code>current.searchParams.sort</code> is <strong>'name' | 'date' | 'activity'</strong>
				</li>
			</ul>
		</div>
	</section>
</div>

<style>
	.user-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.user-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.avatar {
		font-size: 3rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 50%;
	}

	.user-info h1 {
		margin: 0;
		font-size: 2rem;
	}

	.user-id {
		margin: 0.5rem 0 0 0;
		opacity: 0.8;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
	}

	.url-info {
		text-align: right;
	}

	.url-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.url-display {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	.demo-section {
		margin-bottom: 3rem;
	}

	.demo-section h2 {
		font-size: 1.75rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.demo-section p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.control-group {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.tab-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tab-button {
		padding: 0.5rem 1rem;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.tab-button:hover {
		background: #e9ecef;
	}

	.tab-button.active {
		background: #007bff;
		color: white;
		border-color: #007bff;
	}

	.pagination {
		display: flex;
		gap: 0.25rem;
	}

	.page-button {
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.page-button:hover {
		background: #e9ecef;
	}

	.page-button.active {
		background: #007bff;
		color: white;
		border-color: #007bff;
	}

	.sort-select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #dee2e6;
		border-radius: 4px;
		background: white;
		font-size: 0.9rem;
	}

	.state-display {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.state-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.badge {
		background: #007bff;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.content-area {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.tab-content h3 {
		margin: 0 0 1.5rem 0;
		color: #333;
	}

	.profile-info,
	.settings-info,
	.billing-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.profile-info p,
	.settings-info p,
	.billing-info p {
		margin: 0;
		padding: 0.75rem;
		background: #f8f9fa;
		border-radius: 4px;
		border-left: 4px solid #007bff;
	}

	.user-links {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.user-link {
		display: block;
		padding: 1rem;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		text-decoration: none;
		color: #333;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.user-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.user-name {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.user-link small {
		color: #666;
		font-size: 0.8rem;
	}

	.type-info {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.code-block {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		margin: 1rem 0;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.type-info ul {
		margin: 1rem 0;
		padding-left: 2rem;
	}

	.type-info li {
		margin-bottom: 0.5rem;
		color: #666;
	}

	.type-info code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		.user-page {
			padding: 1rem;
		}

		.user-header {
			flex-direction: column;
			gap: 2rem;
		}

		.url-info {
			text-align: left;
		}

		.controls-grid {
			grid-template-columns: 1fr;
		}

		.state-display {
			flex-direction: column;
			gap: 1rem;
		}

		.user-links {
			flex-direction: column;
		}
	}
</style>
