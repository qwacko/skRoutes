<script lang="ts">
	import { page } from '$app/state';
	import { urlGenerator } from '$lib/auto-skroutes.svelte';
	import { goto } from '$app/navigation';

	// Extract error message from URL parameters
	const errorMessage = $derived(page.url.searchParams.get('message') || 'Unknown error occurred');
	const originalUrl = $derived(page.url.searchParams.get('originalUrl') || '');

	// Examples of validation errors
	const errorExamples = [
		{
			title: 'Invalid UUID',
			description: 'User ID must be a valid UUID format',
			example: 'invalid-user-id',
			route: '/users/[id]',
			fix: '550e8400-e29b-41d4-a716-446655440000'
		},
		{
			title: 'Invalid Product ID',
			description: 'Product ID must be 8 uppercase alphanumeric characters',
			example: 'invalid-product',
			route: '/products/[id]',
			fix: 'PROD1234'
		},
		{
			title: 'Invalid Search Parameter',
			description: 'Tab parameter must be one of: profile, settings, billing',
			example: 'invalid-tab',
			route: '/users/550e8400-e29b-41d4-a716-446655440000?tab=invalid-tab',
			fix: 'profile'
		}
	];

	function generateErrorExample(example: any) {
		const result = urlGenerator({
			address: example.route.split('?')[0] as any,
			paramsValue: example.route.includes('[id]') ? { id: example.example } : {},
			searchParamsValue: example.route.includes('?')
				? Object.fromEntries(new URLSearchParams(example.route.split('?')[1]))
				: {}
		});
		return result;
	}

	function generateFixExample(example: any) {
		const result = urlGenerator({
			address: example.route.split('?')[0] as any,
			paramsValue: example.route.includes('[id]') ? { id: example.fix } : {},
			searchParamsValue: example.route.includes('?') ? { tab: example.fix } : {}
		});
		return result;
	}

	function goHome() {
		goto('/');
	}

	function tryAgain() {
		if (originalUrl) {
			goto(originalUrl);
		} else {
			goHome();
		}
	}
</script>

<div class="error-page">
	<header class="error-header">
		<div class="error-icon">⚠️</div>
		<h1>Validation Error</h1>
		<p class="error-message">{errorMessage}</p>
		{#if originalUrl}
			<p class="original-url">
				<strong>Original URL:</strong> <code>{originalUrl}</code>
			</p>
		{/if}
	</header>

	<section class="error-actions">
		<button onclick={goHome} class="action-button primary"> 🏠 Go Home </button>
		{#if originalUrl}
			<button onclick={tryAgain} class="action-button secondary"> 🔄 Try Again </button>
		{/if}
	</section>

	<section class="demo-section">
		<h2>🧪 Error Handling Demo</h2>
		<p>
			skRoutes automatically redirects to this error page when validation fails. Here are some
			examples:
		</p>

		<div class="examples-grid">
			{#each errorExamples as example}
				{@const errorResult = generateErrorExample(example)}
				{@const fixResult = generateFixExample(example)}
				<div class="example-card">
					<h3>{example.title}</h3>
					<p class="example-description">{example.description}</p>

					<div class="example-section">
						<h4>❌ Invalid Example</h4>
						<div class="code-block error">
							<code>{example.example}</code>
						</div>
						<div class="result-info">
							<div class="result-item">
								<strong>Error:</strong> <code>{errorResult.error}</code>
							</div>
							<div class="result-item">
								<strong>Redirects to:</strong> <code>{errorResult.url}</code>
							</div>
						</div>
					</div>

					<div class="example-section">
						<h4>✅ Valid Example</h4>
						<div class="code-block success">
							<code>{example.fix}</code>
						</div>
						<div class="result-info">
							<div class="result-item">
								<strong>Error:</strong> <code>{fixResult.error}</code>
							</div>
							<div class="result-item">
								<strong>URL:</strong> <code>{fixResult.url}</code>
							</div>
						</div>
						<a href={fixResult.url} class="try-link">Try Valid URL →</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>🔧 How Error Handling Works</h2>
		<div class="explanation">
			<div class="step">
				<div class="step-number">1</div>
				<div class="step-content">
					<h3>Validation Fails</h3>
					<p>
						When a route parameter or search parameter doesn't match the Zod schema, validation
						fails.
					</p>
				</div>
			</div>

			<div class="step">
				<div class="step-number">2</div>
				<div class="step-content">
					<h3>Error URL Generated</h3>
					<p>
						skRoutes automatically generates a URL to the configured <code>errorURL</code> with error
						details.
					</p>
				</div>
			</div>

			<div class="step">
				<div class="step-number">3</div>
				<div class="step-content">
					<h3>User Redirected</h3>
					<p>The user is redirected to this error page with information about what went wrong.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>⚙️ Configuration</h2>
		<div class="config-info">
			<p>Error handling is configured when setting up skRoutes:</p>
			<div class="code-block">
				<pre><code
						>export const &#123; urlGenerator, pageInfo &#125; = skRoutes(&#123;
  config: &#123;
    // Your route configurations...
  &#125;,
  errorURL: '/error' // This page!
&#125;);</code
					></pre>
			</div>

			<div class="config-details">
				<h4>Error URL Parameters:</h4>
				<ul>
					<li><code>message</code> - Description of the validation error</li>
					<li><code>originalUrl</code> - The URL that caused the error (optional)</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🎯 Best Practices</h2>
		<div class="best-practices">
			<div class="practice-item">
				<span class="practice-icon">✅</span>
				<div>
					<h3>Provide Clear Error Messages</h3>
					<p>
						Use descriptive validation messages in your Zod schemas to help users understand what
						went wrong.
					</p>
				</div>
			</div>

			<div class="practice-item">
				<span class="practice-icon">✅</span>
				<div>
					<h3>Offer Recovery Options</h3>
					<p>Provide buttons to go back home or try alternative actions when validation fails.</p>
				</div>
			</div>

			<div class="practice-item">
				<span class="practice-icon">✅</span>
				<div>
					<h3>Log Errors for Debugging</h3>
					<p>Consider logging validation errors to help identify common user mistakes or issues.</p>
				</div>
			</div>

			<div class="practice-item">
				<span class="practice-icon">✅</span>
				<div>
					<h3>Test Edge Cases</h3>
					<p>
						Test your validation schemas with various invalid inputs to ensure proper error
						handling.
					</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.error-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.error-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 3rem 2rem;
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
		color: white;
		border-radius: 12px;
	}

	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.error-header h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.error-message {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.original-url {
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 6px;
		margin-top: 1rem;
	}

	.original-url code {
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
	}

	.error-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 3rem;
	}

	.action-button {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-button.primary {
		background: #007bff;
		color: white;
	}

	.action-button.primary:hover {
		background: #0056b3;
		transform: translateY(-1px);
	}

	.action-button.secondary {
		background: #6c757d;
		color: white;
	}

	.action-button.secondary:hover {
		background: #545b62;
		transform: translateY(-1px);
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
		line-height: 1.6;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.example-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.example-card h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.25rem;
	}

	.example-description {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	.example-section {
		margin-bottom: 1.5rem;
	}

	.example-section:last-child {
		margin-bottom: 0;
	}

	.example-section h4 {
		margin: 0 0 0.75rem 0;
		color: #333;
		font-size: 1rem;
	}

	.code-block {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
	}

	.code-block.error {
		background: #f8d7da;
		border-color: #f5c6cb;
		color: #721c24;
	}

	.code-block.success {
		background: #d4edda;
		border-color: #c3e6cb;
		color: #155724;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.result-info {
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
		min-width: 80px;
		color: #495057;
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
		background: #28a745;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.try-link:hover {
		background: #1e7e34;
	}

	.explanation {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.step-number {
		background: #007bff;
		color: white;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-content h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.25rem;
	}

	.step-content p {
		margin: 0;
		color: #666;
		line-height: 1.5;
	}

	.step-content code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	.config-info {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.config-details {
		margin-top: 1.5rem;
	}

	.config-details h4 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.config-details ul {
		margin: 0;
		padding-left: 2rem;
	}

	.config-details li {
		margin-bottom: 0.5rem;
		color: #666;
	}

	.config-details code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	.best-practices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.practice-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.practice-icon {
		font-size: 1.5rem;
		background: #d4edda;
		padding: 0.5rem;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.practice-item h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.practice-item p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	@media (max-width: 768px) {
		.error-page {
			padding: 1rem;
		}

		.error-header {
			padding: 2rem 1rem;
		}

		.error-header h1 {
			font-size: 2rem;
		}

		.error-actions {
			flex-direction: column;
			align-items: center;
		}

		.examples-grid {
			grid-template-columns: 1fr;
		}

		.explanation {
			gap: 1rem;
		}

		.step {
			flex-direction: column;
			text-align: center;
		}

		.best-practices {
			grid-template-columns: 1fr;
		}
	}
</style>
