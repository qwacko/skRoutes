<script lang="ts">
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export const data = undefined; // Unused but required by SvelteKit

	// Reactive state management with URL updates
	const { current, updateParams } = pageInfo('/products/[id]', () => page);

	const colors = ['red', 'blue', 'green', 'black', 'white'] as const;
	const sizes = ['S', 'M', 'L', 'XL'] as const;

	// Demo product data
	const productData = {
		PROD1234: {
			name: 'Premium T-Shirt',
			description: 'High-quality cotton t-shirt',
			price: 29.99,
			image: '👕'
		},
		ITEM5678: {
			name: 'Classic Jeans',
			description: 'Comfortable denim jeans',
			price: 79.99,
			image: '👖'
		},
		GEAR9012: {
			name: 'Sports Shoes',
			description: 'Athletic running shoes',
			price: 129.99,
			image: '👟'
		}
	};

	// Generate example product IDs that match the regex pattern
	const exampleProducts = [
		{ id: 'PROD1234', name: 'Premium T-Shirt' },
		{ id: 'ITEM5678', name: 'Classic Jeans' },
		{ id: 'GEAR9012', name: 'Sports Shoes' },
		{ id: 'TECH3456', name: 'Smart Watch' },
		{ id: 'HOME7890', name: 'Coffee Mug' }
	];

	function updateColor(color: string) {
		updateParams({ searchParams: { color } });
	}

	function updateSize(size: string) {
		updateParams({ searchParams: { size } });
	}

	function toggleInStock() {
		updateParams({ searchParams: { inStock: !current.searchParams.inStock } });
	}

	function changePage(pageNum: number) {
		updateParams({ searchParams: { page: pageNum } });
	}

	// Test invalid product ID
	function testInvalidId() {
		const result = urlGenerator({
			address: '/products/[id]',
			paramsValue: { id: 'invalid-id' }, // This will fail regex validation
			searchParamsValue: current.searchParams
		});

		if (result.error) {
			alert(`Validation failed! Redirected to: ${result.url}`);
		}
	}

	const product = $derived(
		productData[current.params.id as keyof typeof productData] || {
			name: 'Unknown Product',
			description: 'Product not found',
			price: 0,
			image: '❓'
		}
	);

	const currentColor = $derived(current.searchParams.color);
	const currentSize = $derived(current.searchParams.size);
	const inStock = $derived(current.searchParams.inStock);
	const currentPage = $derived(current.searchParams.page);
</script>

<div class="product-page">
	<header class="product-header">
		<div class="product-info">
			<span class="product-image">{product.image}</span>
			<div>
				<h1>{product.name}</h1>
				<p class="product-id">Product ID: {current.params.id}</p>
				<p class="product-price">${product.price}</p>
			</div>
		</div>

		<div class="validation-info">
			<h3>🔍 Regex Validation</h3>
			<div class="validation-display">
				<code>^[A-Z0-9]{8}$</code>
				<small>8 uppercase alphanumeric characters</small>
			</div>
		</div>
	</header>

	<section class="demo-section">
		<h2>🎨 Product Filtering Demo</h2>
		<p>Use the filters below to see reactive URL updates with validation:</p>

		<div class="filters-grid">
			<div class="filter-group">
				<h3>Color</h3>
				<div class="color-options">
					<button onclick={() => updateColor('')} class="color-button" class:active={!currentColor}>
						All Colors
					</button>
					{#each colors as color}
						<button
							onclick={() => updateColor(color)}
							class="color-button {color}"
							class:active={currentColor === color}
						>
							{color.charAt(0).toUpperCase() + color.slice(1)}
						</button>
					{/each}
				</div>
			</div>

			<div class="filter-group">
				<h3>Size</h3>
				<div class="size-options">
					<button onclick={() => updateSize('')} class="size-button" class:active={!currentSize}>
						All Sizes
					</button>
					{#each sizes as size}
						<button
							onclick={() => updateSize(size)}
							class="size-button"
							class:active={currentSize === size}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>

			<div class="filter-group">
				<h3>Availability</h3>
				<label class="stock-toggle">
					<input type="checkbox" checked={!!inStock} onchange={toggleInStock} />
					In Stock Only
				</label>
			</div>

			<div class="filter-group">
				<h3>Page</h3>
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
		</div>
	</section>

	<section class="demo-section">
		<h2>📊 Current Filter State</h2>
		<div class="state-display">
			<div class="state-card">
				<h4>Applied Filters</h4>
				<div class="filter-tags">
					{#if currentColor}
						<span class="filter-tag color-tag {currentColor}">Color: {currentColor}</span>
					{/if}
					{#if currentSize}
						<span class="filter-tag">Size: {currentSize}</span>
					{/if}
					{#if inStock}
						<span class="filter-tag stock-tag">In Stock</span>
					{/if}
					<span class="filter-tag">Page: {currentPage}</span>
				</div>

				<div class="current-url">
					<strong>Current URL:</strong>
					<code>{page.url.pathname}{page.url.search}</code>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🔗 Product Navigation</h2>
		<p>Try different products with the same filter settings:</p>

		<div class="product-grid">
			{#each exampleProducts as exampleProduct}
				{@const productUrl = urlGenerator({
					address: '/products/[id]',
					paramsValue: { id: exampleProduct.id },
					searchParamsValue: {
						color: currentColor,
						size: currentSize,
						inStock,
						page: currentPage
					}
				})}
				<a
					href={productUrl.url}
					class="product-card"
					class:current={current.params.id === exampleProduct.id}
				>
					<div class="product-id-display">{exampleProduct.id}</div>
					<div class="product-name">{exampleProduct.name}</div>
					{#if current.params.id === exampleProduct.id}
						<div class="current-indicator">Current</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>

	<section class="demo-section">
		<h2>❌ Validation Testing</h2>
		<p>Test the regex validation by trying an invalid product ID:</p>

		<div class="validation-test">
			<button onclick={testInvalidId} class="test-button">
				Test Invalid ID (will show error)
			</button>

			<div class="validation-rules">
				<h4>Product ID Rules:</h4>
				<ul>
					<li>Must be exactly 8 characters</li>
					<li>Only uppercase letters (A-Z) and numbers (0-9)</li>
					<li>Examples: PROD1234, ITEM5678, GEAR9012</li>
					<li>Invalid: prod1234 (lowercase), PRODUCT1 (too long), ABC123 (too short)</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>🧪 Type Safety Information</h2>
		<div class="type-info">
			<div class="code-block">
				<pre><code
						>// Product route configuration
paramsValidation: z.object(&#123;
  id: z.string().regex(/^[A-Z0-9]&#123;8&#125;$/, 'Product ID must be 8 uppercase alphanumeric characters')
&#125;),
searchParamsValidation: z.object(&#123;
  color: z.string().optional(),
  size: z.enum(['S', 'M', 'L', 'XL']).optional(),
  inStock: z.coerce.boolean().default(true),
  page: z.coerce.number().positive().default(1)
&#125;)</code
					></pre>
			</div>

			<div class="type-details">
				<h4>TypeScript knows:</h4>
				<ul>
					<li>
						<code>current.params.id</code> is a <strong>string</strong> (validated with regex)
					</li>
					<li><code>current.searchParams.color</code> is <strong>string | undefined</strong></li>
					<li>
						<code>current.searchParams.size</code> is
						<strong>'S' | 'M' | 'L' | 'XL' | undefined</strong>
					</li>
					<li>
						<code>current.searchParams.inStock</code> is a <strong>boolean</strong> (defaults to true)
					</li>
					<li>
						<code>current.searchParams.page</code> is a <strong>number</strong> (positive, defaults to
						1)
					</li>
				</ul>
			</div>
		</div>
	</section>
</div>

<style>
	.product-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
		color: white;
		border-radius: 12px;
	}

	.product-info {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.product-image {
		font-size: 4rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 12px;
	}

	.product-info h1 {
		margin: 0;
		font-size: 2rem;
	}

	.product-id {
		margin: 0.5rem 0;
		opacity: 0.9;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
	}

	.product-price {
		margin: 0.5rem 0 0 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.validation-info {
		text-align: right;
	}

	.validation-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.validation-display {
		background: rgba(255, 255, 255, 0.2);
		padding: 1rem;
		border-radius: 6px;
	}

	.validation-display code {
		display: block;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.validation-display small {
		font-size: 0.8rem;
		opacity: 0.8;
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

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.filter-group {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.filter-group h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.color-options,
	.size-options {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.color-button,
	.size-button {
		padding: 0.5rem 1rem;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.color-button:hover,
	.size-button:hover {
		background: #e9ecef;
	}

	.color-button.active,
	.size-button.active {
		background: #007bff;
		color: white;
		border-color: #007bff;
	}

	.color-button.red.active {
		background: #dc3545;
		border-color: #dc3545;
	}
	.color-button.blue.active {
		background: #007bff;
		border-color: #007bff;
	}
	.color-button.green.active {
		background: #28a745;
		border-color: #28a745;
	}
	.color-button.black.active {
		background: #343a40;
		border-color: #343a40;
	}
	.color-button.white.active {
		background: #6c757d;
		border-color: #6c757d;
	}

	.stock-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.stock-toggle input {
		margin: 0;
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

	.state-display {
		margin-bottom: 2rem;
	}

	.state-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.state-card h4 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.filter-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.filter-tag {
		background: #007bff;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.filter-tag.color-tag.red {
		background: #dc3545;
	}
	.filter-tag.color-tag.blue {
		background: #007bff;
	}
	.filter-tag.color-tag.green {
		background: #28a745;
	}
	.filter-tag.color-tag.black {
		background: #343a40;
	}
	.filter-tag.color-tag.white {
		background: #6c757d;
	}
	.filter-tag.stock-tag {
		background: #28a745;
	}

	.current-url {
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
		border-left: 4px solid #007bff;
	}

	.current-url code {
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		margin-left: 0.5rem;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.product-card {
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
	}

	.product-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.product-card.current {
		border-color: #007bff;
		background: #f8f9ff;
	}

	.product-id-display {
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.product-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.current-indicator {
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

	.validation-test {
		background: white;
		border: 1px solid #e1e5e9;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.test-button {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 1.5rem;
		transition: background 0.2s;
	}

	.test-button:hover {
		background: #c82333;
	}

	.validation-rules h4 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.validation-rules ul {
		margin: 0;
		padding-left: 2rem;
	}

	.validation-rules li {
		margin-bottom: 0.5rem;
		color: #666;
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
		margin-bottom: 1.5rem;
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.type-details h4 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.type-details ul {
		margin: 0;
		padding-left: 2rem;
	}

	.type-details li {
		margin-bottom: 0.5rem;
		color: #666;
	}

	.type-details code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		.product-page {
			padding: 1rem;
		}

		.product-header {
			flex-direction: column;
			gap: 2rem;
		}

		.validation-info {
			text-align: left;
		}

		.filters-grid {
			grid-template-columns: 1fr;
		}

		.product-grid {
			grid-template-columns: 1fr;
		}

		.filter-tags {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
