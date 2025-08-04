<script lang="ts">
	import { page } from '$app/stores';
	import { pageInfo, urlGenerator } from '$lib/auto-skroutes';
	export let data;

	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];

	$: urlData = pageInfo('/server/[id]', $page);
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
