<script lang="ts">
	import { urlGenerator } from '$lib/auto-skroutes';
	import { goto } from '$app/navigation';
	
	// Demo data for showcasing different route types
	const demoRoutes = [
		{
			title: 'Basic Route with ID',
			description: 'Simple route parameter validation',
			route: '/[id]',
			examples: [
				{ id: 'demo-1', label: 'Demo 1', searchParams: {} },
				{ id: 'demo-2', label: 'Demo 2', searchParams: {} },
				{ id: 'hello-world', label: 'Hello World', searchParams: {} }
			]
		},
		{
			title: 'User Management',
			description: 'UUID validation with search parameters (tab, page, sort)',
			route: '/users/[id]',
			examples: [
				{ 
					id: '550e8400-e29b-41d4-a716-446655440000', 
					label: 'User Profile',
					searchParams: { tab: 'profile', page: 1 }
				},
				{ 
					id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
					label: 'User Settings',
					searchParams: { tab: 'settings', sort: 'date' }
				}
			]
		},
		{
			title: 'Product Catalog',
			description: 'Regex validation for product IDs with filtering options',
			route: '/products/[id]',
			examples: [
				{ 
					id: 'PROD1234', 
					label: 'Red T-Shirt',
					searchParams: { color: 'red', size: 'M', inStock: true }
				},
				{ 
					id: 'ITEM5678', 
					label: 'Blue Jeans',
					searchParams: { color: 'blue', size: 'L', page: 2 }
				}
			]
		},
		{
			title: 'Server-Side Processing',
			description: 'Server-side validation with required search parameters',
			route: '/server/[id]',
			examples: [
				{ 
					id: 'server-demo', 
					label: 'Server Demo',
					searchParams: { data: 'test-data' }
				}
			]
		}
	];

	// URL Generation Examples
	let urlExamples: Array<{title: string, result: any, code: string}> = [];
	
	// Generate examples for each route type
	demoRoutes.forEach(route => {
		route.examples.forEach(example => {
			const result = urlGenerator({
				address: route.route as any,
				paramsValue: { id: example.id },
				searchParamsValue: example.searchParams || {}
			});
			
			urlExamples.push({
				title: `${route.title} - ${example.label}`,
				result,
				code: `urlGenerator({
  address: '${route.route}',
  paramsValue: { id: '${example.id}' },
  searchParamsValue: ${JSON.stringify(example.searchParams || {}, null, 2)}
})`
			});
		});
	});

	// Error handling example
	const errorExample = urlGenerator({
		address: '/users/[id]' as any,
		paramsValue: { id: 'invalid-uuid' },
		searchParamsValue: { tab: 'profile' }
	});

	function navigateToRoute(url: string) {
		goto(url);
	}
</script>

<div class="demo-container">
	<header class="hero">
		<h1>🚀 skRoutes Demo</h1>
		<p class="subtitle">Type-safe URL generation and route parameter validation for SvelteKit</p>
		<div class="features">
			<span class="feature">🔒 Full Type Safety</span>
			<span class="feature">🏷️ Standard Schema Support</span>
			<span class="feature">⚡ Generic Type System</span>
			<span class="feature">🎯 Non-Optional Results</span>
		</div>
	</header>

	<section class="demo-section">
		<h2>🎯 Interactive Route Examples</h2>
		<p>Click any link below to see the library in action with different validation schemas:</p>
		
		<div class="route-grid">
			{#each demoRoutes as route}
				<div class="route-card">
					<h3>{route.title}</h3>
					<p class="route-description">{route.description}</p>
					<code class="route-pattern">{route.route}</code>
					
					<div class="examples">
						{#each route.examples as example}
							{@const url = urlGenerator({
								address: route.route as any,
								paramsValue: { id: example.id },
								searchParamsValue: example.searchParams || {}
							})}
							<a 
								href={url.url} 
								class="example-link"
								class:error={url.error}
							>
								{example.label}
								{#if example.searchParams}
									<small>({Object.entries(example.searchParams).map(([k,v]) => `${k}=${v}`).join(', ')})</small>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>🔧 URL Generation Results</h2>
		<p>See how the library generates and validates URLs:</p>
		
		<div class="results-grid">
			{#each urlExamples as example}
				<div class="result-card">
					<h4>{example.title}</h4>
					<div class="code-block">
						<pre><code>{example.code}</code></pre>
					</div>
					<div class="result" class:error={example.result.error}>
						<div class="result-item">
							<strong>URL:</strong> <code>{example.result.url}</code>
						</div>
						<div class="result-item">
							<strong>Error:</strong> <code>{example.result.error}</code>
						</div>
						<div class="result-item">
							<strong>Params:</strong> <code>{JSON.stringify(example.result.params)}</code>
						</div>
						<div class="result-item">
							<strong>Search Params:</strong> <code>{JSON.stringify(example.result.searchParams)}</code>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>❌ Error Handling Example</h2>
		<p>When validation fails, skRoutes redirects to the configured error URL:</p>
		
		<div class="error-example">
			<div class="code-block">
				<pre><code>urlGenerator(&#123;
  address: '/users/[id]',
  paramsValue: &#123; id: 'invalid-uuid' &#125;, // ❌ Not a valid UUID
  searchParamsValue: &#123; tab: 'profile' &#125;
&#125;)</code></pre>
			</div>
			<div class="result error">
				<div class="result-item">
					<strong>URL:</strong> <code>{errorExample.url}</code>
				</div>
				<div class="result-item">
					<strong>Error:</strong> <code>{errorExample.error}</code>
				</div>
				<div class="result-item">
					<strong>Redirected to error page with message</strong>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>📚 Key Features Demonstrated</h2>
		<div class="features-grid">
			<div class="feature-card">
				<h3>🔒 Type Safety</h3>
				<p>All route parameters and search parameters are fully typed based on your Zod schemas</p>
			</div>
			<div class="feature-card">
				<h3>🏷️ Schema Validation</h3>
				<p>Support for Zod, Valibot, ArkType, and any Standard Schema-compliant library</p>
			</div>
			<div class="feature-card">
				<h3>⚡ Auto-Generation</h3>
				<p>Vite plugin automatically generates typed routes from your file structure</p>
			</div>
			<div class="feature-card">
				<h3>🎯 No Undefined</h3>
				<p>params and searchParams are never undefined - no optional chaining needed!</p>
			</div>
			<div class="feature-card">
				<h3>🎨 Reactive Updates</h3>
				<p>Debounced URL updates with Svelte 5 runes support</p>
			</div>
			<div class="feature-card">
				<h3>🚦 Compile-time Checking</h3>
				<p>TypeScript validates route addresses and parameter types at build time</p>
			</div>
		</div>
	</section>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.hero {
		text-align: center;
		margin-bottom: 4rem;
		padding: 3rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.subtitle {
		font-size: 1.25rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.features {
		display: flex;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.feature {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.demo-section {
		margin-bottom: 4rem;
	}

	.demo-section h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.demo-section p {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 2rem;
	}

	.route-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.route-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.route-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.route-card h3 {
		margin-bottom: 0.5rem;
		color: #333;
		font-size: 1.25rem;
	}

	.route-description {
		color: #666;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.route-pattern {
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
		display: block;
		margin-bottom: 1rem;
		border: 1px solid #e9ecef;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.example-link {
		display: block;
		padding: 0.75rem;
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		border-radius: 4px;
		text-decoration: none;
		color: #495057;
		transition: all 0.2s;
	}

	.example-link:hover {
		background: #e9ecef;
		border-color: #adb5bd;
	}

	.example-link.error {
		background: #f8d7da;
		border-color: #f5c6cb;
		color: #721c24;
	}

	.example-link small {
		display: block;
		color: #6c757d;
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.result-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.result-card h4 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.1rem;
	}

	.code-block {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.result {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
	}

	.result.error {
		background: #f8d7da;
		border-color: #f5c6cb;
	}

	.result-item {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.result-item:last-child {
		margin-bottom: 0;
	}

	.result-item strong {
		color: #495057;
		min-width: 120px;
		display: inline-block;
	}

	.result-item code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	.error-example {
		max-width: 600px;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.feature-card h3 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.25rem;
	}

	.feature-card p {
		color: #666;
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0;
	}

	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		.hero h1 {
			font-size: 2rem;
		}

		.features {
			gap: 1rem;
		}

		.feature {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}

		.route-grid,
		.results-grid,
		.features-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
