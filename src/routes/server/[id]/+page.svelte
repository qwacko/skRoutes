<script lang="ts">
	import { page } from '$app/state';
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes';

	const { data } = $props();

	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];

	const urlData = $derived(pageInfo('/server/[id]', page));
</script>

<div class="page">
	{JSON.stringify(data)}
	<div class="item-row">
		{#each options as currentOption}
			<a href={urlData.updateParams({ params: { id: currentOption } }).url}>{currentOption}</a>
		{/each}
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem;
		width: 100%;
		align-items: center;
	}
	.item-row {
		display: flex;
		flex-direction: row;
		gap: 5rem;
	}
	a {
		display: flex;
	}
</style>
