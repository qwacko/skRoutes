<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { objectToSearchParams } from '$lib/helpers.js';
	import { set, update } from 'lodash-es';
	import { pageInfoStore } from '../../routeConfig.js';

	const pageStore = pageInfoStore({
		routeId: '/store/[id]/',
		pageInfo: page,
		updateDelay: 500,
		onUpdate: (newURL) => (browser ? goto(newURL) : undefined)
	});
</script>

{#if $pageStore.params}
	<label for="topLevel">ID</label>
	<input id="topLevel" type="string" bind:value={$pageStore.params.id} />
{/if}

{#if $pageStore.searchParams}
	<label for="topLevel">item1</label>
	<input
		id="topLevel"
		type="string"
		value={$pageStore.searchParams?.nested?.item1}
		on:input={(newValue) => {
			if (newValue.target) {
				const newString = newValue.target.value;
				console.log({ newString });
				const newObject = set($pageStore, 'searchParams.nested.item1', newString);
				$pageStore = newObject;
			}
		}}
	/>
{/if}

<pre>{JSON.stringify($pageStore, null, 2)}</pre>
