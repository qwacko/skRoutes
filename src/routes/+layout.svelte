<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const { children } = $props();

	function goHome() {
		goto('/');
	}

	const isHomePage = $derived(page.route.id === '/');
</script>

<div class="app-layout">
	{#if !isHomePage}
		<nav class="top-nav">
			<button onclick={goHome} class="home-button"> 🏠 Home </button>
			<div class="breadcrumb">
				<span class="current-route">{page.route.id || '/'}</span>
			</div>
		</nav>
	{/if}

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.top-nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: white;
		border-bottom: 1px solid #e1e5e9;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.home-button {
		background: #007bff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.home-button:hover {
		background: #0056b3;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.current-route {
		background: #f8f9fa;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		color: #495057;
		border: 1px solid #e9ecef;
	}

	.main-content {
		flex: 1;
	}

	@media (max-width: 768px) {
		.top-nav {
			padding: 1rem;
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.breadcrumb {
			justify-content: center;
		}
	}
</style>
