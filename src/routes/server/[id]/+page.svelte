<script lang="ts">
	import { page } from '$app/state';
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const { data } = $props();

	// Server-side processing demo with required search parameters
	const { current, updateParams } = $derived(pageInfo('/server/[id]', page));

	const demoServers = [
		{ id: 'web-server', name: 'Web Server', emoji: '🌐', description: 'HTTP/HTTPS web server' },
		{ id: 'database', name: 'Database', emoji: '🗄️', description: 'SQL database server' },
		{ id: 'cache-server', name: 'Cache Server', emoji: '⚡', description: 'Redis cache server' },
		{ id: 'api-gateway', name: 'API Gateway', emoji: '🚪', description: 'API routing gateway' },
		{ id: 'load-balancer', name: 'Load Balancer', emoji: '⚖️', description: 'Traffic distribution' },
		{ id: 'file-server', name: 'File Server', emoji: '📁', description: 'Static file serving' }
	];

	const dataTypes = ['logs', 'metrics', 'config', 'status', 'health'];

	function updateData(dataType: string) {
		updateParams({ searchParams: { data: dataType } });
	}

	function clearData() {
		updateParams({ searchParams: {} });
	}

	const currentServer = $derived(demoServers.find(server => server.id === current.params.id) || {
		id: current.params.id,
		name: 'Unknown Server',
		emoji: '❓',
		description: 'Server not found'
	});

	const currentData = $derived(current.searchParams.data || '');
</script>

<div class="server-page">
	<header class="server-header">
		<div class="server-info">
			<span class="server-emoji">{currentServer.emoji}</span>
			<div>
				<h1>{currentServer.name}</h1>
				<p class="server-id">Server ID: {current.params.id}</p>
				<p class="server-description">{currentServer.description}</p>
			</div>
		</div>
		
		<div class="server-status">
			<h3>🔧 Server Processing</h3>
			<div class="status-display">
				<div class="status-item">
					<span class="status-indicator online"></span>
					<span>Online</span>
				</div>
			</div>
		</div>
	</header>

	<section class="demo-section">
		<h2>🖥️ Server-Side Processing Demo</h2>
		<p>This route demonstrates server-side validation with required search parameters:</p>
		
		<div class="config-display">
			<div class="code-block">
				<pre><code>// Server route configuration
paramsValidation: z.object(&#123;
  id: z.string()
&#125;),
searchParamsValidation: z.object(&#123;
  data: z.string(),
  date: z.date().optional()
&#125;)</code></pre>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🖥️ Server Navigation</h2>
		<p>Switch between different server types:</p>
		
		<div class="servers-grid">
			{#each demoServers as server}
				{@const serverUrl = urlGenerator({
					address: '/server/[id]',
					paramsValue: { id: server.id },
					searchParamsValue: current.searchParams
				})}
				<a 
					href={serverUrl.url} 
					class="server-card"
					class:current={current.params.id === server.id}
				>
					<span class="server-emoji-large">{server.emoji}</span>
					<h3>{server.name}</h3>
					<p>{server.description}</p>
					{#if current.params.id === server.id}
						<div class="current-badge">Current</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>📊 Data Processing</h2>
		<p>Select the type of data to process (required parameter):</p>
		
		<div class="data-controls">
			<div class="control-group">
				<h3>Data Type</h3>
				<div class="data-buttons">
					{#each dataTypes as dataType}
						<button 
							onclick={() => updateData(dataType)}
							class="data-button"
							class:active={currentData === dataType}
						>
							{dataType.charAt(0).toUpperCase() + dataType.slice(1)}
						</button>
					{/each}
				</div>
				<button onclick={clearData} class="clear-button">
					Clear Data
				</button>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>📈 Current Processing State</h2>
		<div class="state-display">
			<div class="state-card">
				<h3>Server Parameters</h3>
				<div class="param-item">
					<strong>Server ID:</strong>
					<code>{current.params.id}</code>
				</div>
				{#if currentData}
					<div class="param-item">
						<strong>Data Type:</strong>
						<code>{currentData}</code>
					</div>
				{:else}
					<div class="param-item warning">
						<strong>⚠️ Data Type:</strong>
						<code>Required parameter missing</code>
					</div>
				{/if}
			</div>

			<div class="state-card">
				<h3>Server Data</h3>
				<div class="server-data">
					<pre><code>{JSON.stringify(data, null, 2)}</code></pre>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🔧 Server-Side Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<span class="feature-icon">🔒</span>
				<div>
					<h3>Server Validation</h3>
					<p>Parameters validated on the server before page load</p>
				</div>
			</div>
			<div class="feature-card">
				<span class="feature-icon">⚡</span>
				<div>
					<h3>Pre-processed Data</h3>
					<p>Data is processed and validated server-side for better performance</p>
				</div>
			</div>
			<div class="feature-card">
				<span class="feature-icon">🛡️</span>
				<div>
					<h3>Security</h3>
					<p>Server-side validation prevents malicious parameter injection</p>
				</div>
			</div>
			<div class="feature-card">
				<span class="feature-icon">📊</span>
				<div>
					<h3>Type Safety</h3>
					<p>Full TypeScript support for server-side route parameters</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.server-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.server-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
		color: white;
		border-radius: 12px;
	}

	.server-info {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.server-emoji {
		font-size: 4rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 12px;
	}

	.server-info h1 {
		margin: 0;
		font-size: 2rem;
	}

	.server-id {
		margin: 0.5rem 0;
		opacity: 0.9;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
	}

	.server-description {
		margin: 0.5rem 0 0 0;
		opacity: 0.8;
		font-style: italic;
	}

	.server-status {
		text-align: right;
	}

	.server-status h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.status-display {
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 6px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #28a745;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
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

	.servers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.server-card {
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

	.server-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.server-card.current {
		border-color: #2d3748;
		background: #f7fafc;
	}

	.server-emoji-large {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.server-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.server-card p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.current-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: #2d3748;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.data-controls {
		margin-bottom: 2rem;
	}

	.control-group {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.data-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.data-button {
		padding: 0.5rem 1rem;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.data-button:hover {
		background: #e9ecef;
	}

	.data-button.active {
		background: #2d3748;
		color: white;
		border-color: #2d3748;
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

	.param-item.warning {
		background: #fff3cd;
		border-left: 4px solid #ffc107;
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

	.server-data {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		overflow-x: auto;
	}

	.server-data pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-card {
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

	.feature-card h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.feature-card p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	@media (max-width: 768px) {
		.server-page {
			padding: 1rem;
		}

		.server-header {
			flex-direction: column;
			gap: 2rem;
		}

		.server-status {
			text-align: left;
		}

		.servers-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		}

		.data-buttons {
			flex-direction: column;
		}
	}
</style>
