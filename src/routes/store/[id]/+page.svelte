<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { pageInfoStore } from '$lib/auto-skroutes';

	const pageStore = pageInfoStore({
		routeId: '/store/[id]',
		pageInfo: page,
		updateDelay: 500,
		onUpdate: (newURL) => (browser ? goto(newURL) : undefined)
	});

	const handleInput = (
		newValue: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (newValue.target && 'value' in newValue.target) {
			const newString = newValue.target.value as string;
			if ($pageStore.searchParams && $pageStore.searchParams.nested) {
				$pageStore.searchParams.nested.item1 = newString;
			} else {
				// Handle the case where `nested` doesn't exist yet
				$pageStore.searchParams = {
					...$pageStore.searchParams,
					nested: { item1: newString }
				};
			}
		}
	};
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
		on:input={(newValue) => handleInput(newValue)}
	/>
{/if}

<pre>{JSON.stringify($pageStore, null, 2)}</pre>
