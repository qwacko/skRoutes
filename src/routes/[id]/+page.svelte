<script lang="ts">
	import { pageStoreURLInfo, urlGenerator } from '../routeConfig.js';
	import { page } from '$app/stores';

	$: urlInfo = pageStoreURLInfo('/[id]', $page);

	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];
</script>

<div class="page">
	{JSON.stringify(urlInfo)}
	<div class="item-row">
		{#each options as currentOption}
			<a href={urlGenerator({ address: '/[id]', paramsValue: { id: currentOption } }).url}
				>{currentOption}</a
			>
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
