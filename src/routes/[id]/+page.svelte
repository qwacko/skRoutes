<script lang="ts">
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	// Basic route with simple string validation
	const urlInfo = $derived(
		pageInfo(
			'/[id]',
			page,
			200, // Fast updates for demo
			(newUrl) => (browser ? goto(newUrl) : undefined)
		)
	);

	const demoItems = [
		{ id: 'horse', name: 'Horse', emoji: '🐴', description: 'Majestic and strong' },
		{ id: 'donkey', name: 'Donkey', emoji: '🫏', description: 'Hardworking and loyal' },
		{ id: 'cat', name: 'Cat', emoji: '🐱', description: 'Independent and curious' },
		{ id: 'dog', name: 'Dog', emoji: '🐶', description: 'Friendly and loyal' },
		{ id: 'elephant', name: 'Elephant', emoji: '🐘', description: 'Wise and gentle' },
		{ id: 'lion', name: 'Lion', emoji: '🦁', description: 'Brave and powerful' }
	];

	// Search parameters for this route (from the route config)
	const tabs = ['profile', 'settings'] as const;
	const pages = [1, 2, 3, 4, 5];

	function switchTab(tab: (typeof tabs)[number]) {
		urlInfo.updateParams({ searchParams: { tab } });
	}

	function changePage(pageNum: number) {
		urlInfo.updateParams({ searchParams: { page: pageNum } });
	}

	function clearSearchParams() {
		urlInfo.updateParams({ searchParams: {} });
	}

	// Generate URLs for different combinations
	function generateExampleUrls() {
		return demoItems.slice(0, 3).map((item) => {
			const result = urlGenerator({
				address: '/[id]',
				paramsValue: { id: item.id },
				searchParamsValue: { tab: 'profile', page: 2 }
			});
			return { item, result };
		});
	}

	const currentItem = $derived(
		demoItems.find((item) => item.id === urlInfo.current.params.id) || {
			id: urlInfo.current.params.id,
			name: 'Unknown Item',
			emoji: '❓',
			description: 'Item not found'
		}
	);

	const activeTab = $derived(urlInfo.current.searchParams.tab);
	const currentPage = $derived(urlInfo.current.searchParams.page || 1);
	const exampleUrls = $derived(generateExampleUrls());
</script>

<div class="basic-page">
	<header class="page-header">
		<div class="item-display">
			<span class="item-emoji">{currentItem.emoji}</span>
			<div>
				<h1>{currentItem.name}</h1>
				<p class="item-id">ID: {urlInfo.current.params.id}</p>
				<p class="item-description">{currentItem.description}</p>
			</div>
		</div>

		<div class="url-state">
			<h3>🔗 URL State</h3>
			<code>{page.url.pathname}{page.url.search}</code>
		</div>
	</header>

	<section class="demo-section">
		<h2>🎯 Basic Route Demo</h2>
		<p>This route uses simple string validation with optional search parameters:</p>

		<div class="config-display">
			<div class="code-block">
				<pre><code
						>// Route configuration
paramsValidation: z.object(&#123; 
  id: z.string().min(1) 
&#125;),
searchParamsValidation: z.object(&#123;
  tab: z.enum(['profile', 'settings']).optional(),
  page: z.coerce.number().positive().optional()
&#125;)</code
					></pre>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🐾 Item Navigation</h2>
		<p>Click any item to see the URL update with validation:</p>

		<div class="items-grid">
			{#each demoItems as item}
				{@const itemUrl = urlInfo.updateParams({ params: { id: item.id } })}
				<a
					href={itemUrl.url}
					class="item-card"
					class:current={urlInfo.current.params.id === item.id}
				>
					<span class="item-emoji-large">{item.emoji}</span>
					<h3>{item.name}</h3>
					<p>{item.description}</p>
					{#if urlInfo.current.params.id === item.id}
						<div class="current-badge">Current</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>🎛️ Search Parameters</h2>
		<p>Add optional search parameters to see reactive updates:</p>

		<div class="controls-row">
			<div class="control-group">
				<h3>Tab</h3>
				<div class="tab-buttons">
					<button
						onclick={() => switchTab('profile')}
						class="control-button"
						class:active={activeTab === 'profile'}
					>
						Profile
					</button>
					<button
						onclick={() => switchTab('settings')}
						class="control-button"
						class:active={activeTab === 'settings'}
					>
						Settings
					</button>
				</div>
			</div>

			<div class="control-group">
				<h3>Page</h3>
				<div class="page-buttons">
					{#each pages as pageNum}
						<button
							onclick={() => changePage(pageNum)}
							class="control-button page-btn"
							class:active={currentPage === pageNum}
						>
							{pageNum}
						</button>
					{/each}
				</div>
			</div>

			<div class="control-group">
				<button onclick={clearSearchParams} class="clear-button"> Clear All </button>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>📊 Current State</h2>
		<div class="state-display">
			<div class="state-card">
				<h3>Parameters</h3>
				<div class="param-item">
					<strong>ID:</strong>
					<code>{urlInfo.current.params.id}</code>
				</div>
				{#if activeTab}
					<div class="param-item">
						<strong>Tab:</strong>
						<code>{activeTab}</code>
					</div>
				{/if}
				{#if currentPage > 1}
					<div class="param-item">
						<strong>Page:</strong>
						<code>{currentPage}</code>
					</div>
				{/if}
			</div>

			<div class="state-card">
				<h3>Raw Data</h3>
				<div class="json-display">
					<pre><code>{JSON.stringify(urlInfo.current, null, 2)}</code></pre>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🔗 URL Generation Examples</h2>
		<p>See how the library generates URLs for different parameter combinations:</p>

		<div class="examples-grid">
			{#each exampleUrls as { item, result }}
				<div class="example-card">
					<h4>{item.emoji} {item.name}</h4>
					<div class="example-code">
						<pre><code
								>urlGenerator(&#123;
  address: '/[id]',
  paramsValue: &#123; id: '{item.id}' &#125;,
  searchParamsValue: &#123; tab: 'profile', page: 2 &#125;
&#125;)</code
							></pre>
					</div>
					<div class="example-result">
						<div class="result-item">
							<strong>URL:</strong> <code>{result.url}</code>
						</div>
						<div class="result-item">
							<strong>Error:</strong> <code>{result.error}</code>
						</div>
					</div>
					<a href={result.url} class="try-link">Try this URL →</a>
				</div>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>✨ Key Features</h2>
		<div class="features-list">
			<div class="feature-item">
				<span class="feature-icon">🔒</span>
				<div>
					<h3>Type Safety</h3>
					<p>All parameters are typed based on your Zod schema</p>
				</div>
			</div>
			<div class="feature-item">
				<span class="feature-icon">⚡</span>
				<div>
					<h3>Reactive Updates</h3>
					<p>URL changes are debounced and automatically applied</p>
				</div>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🎯</span>
				<div>
					<h3>No Undefined</h3>
					<p>params and searchParams are never undefined</p>
				</div>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🚦</span>
				<div>
					<h3>Validation</h3>
					<p>Runtime validation with helpful error messages</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.basic-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		color: white;
		border-radius: 12px;
	}

	.item-display {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.item-emoji {
		font-size: 4rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 12px;
	}

	.item-display h1 {
		margin: 0;
		font-size: 2rem;
	}

	.item-id {
		margin: 0.5rem 0;
		opacity: 0.9;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
	}

	.item-description {
		margin: 0.5rem 0 0 0;
		opacity: 0.8;
		font-style: italic;
	}

	.url-state {
		text-align: right;
	}

	.url-state h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.url-state code {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		display: block;
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

	.config-display {
		margin-bottom: 2rem;
	}

	.code-block {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 1.5rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.item-card {
		display: block;
		padding: 1.5rem;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		text-decoration: none;
		color: #333;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
		text-align: center;
	}

	.item-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.item-card.current {
		border-color: #007bff;
		background: #f8f9ff;
	}

	.item-emoji-large {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.item-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.item-card p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.current-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: #007bff;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.controls-row {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.control-group {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		flex: 1;
		min-width: 200px;
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1rem;
	}

	.tab-buttons,
	.page-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.control-button {
		padding: 0.5rem 1rem;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.control-button:hover {
		background: #e9ecef;
	}

	.control-button.active {
		background: #007bff;
		color: white;
		border-color: #007bff;
	}

	.page-btn {
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-button {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.clear-button:hover {
		background: #c82333;
	}

	.state-display {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.state-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.state-card h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.param-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	.param-item:last-child {
		margin-bottom: 0;
	}

	.param-item code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	.json-display {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		overflow-x: auto;
	}

	.json-display pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.example-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.example-card h4 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.example-code {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
		overflow-x: auto;
	}

	.example-code pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.example-result {
		margin-bottom: 1rem;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.result-item strong {
		min-width: 60px;
	}

	.result-item code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.8rem;
	}

	.try-link {
		display: inline-block;
		background: #007bff;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.try-link:hover {
		background: #0056b3;
	}

	.features-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		font-size: 2rem;
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.feature-item h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.feature-item p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	@media (max-width: 768px) {
		.basic-page {
			padding: 1rem;
		}

		.page-header {
			flex-direction: column;
			gap: 2rem;
		}

		.url-state {
			text-align: left;
		}

		.controls-row {
			flex-direction: column;
		}

		.items-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		}

		.examples-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
