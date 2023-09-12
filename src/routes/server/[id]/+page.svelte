<script lang="ts">
	import { urlGenerator } from '../../routeConfig.js';
	export let data;

	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];
</script>

<div class="page">
	{JSON.stringify(data)}
	<div class="item-row">
		{#each options as currentOption}
			<a href={urlGenerator({ address: '/server/[id]', paramsValue: { id: currentOption } }).url}
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
