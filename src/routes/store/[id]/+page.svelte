<script lang="ts">
	import { page } from '$app/state';
	import { pageInfo } from '$lib/auto-skroutes.svelte';

	const urlInfo = pageInfo('/store/[id]', () => page);

	const handleInput = (
		newValue: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (newValue.target && 'value' in newValue.target) {
			const newString = newValue.target.value as string;
			urlInfo.updateParams({
				searchParams: {
					nested: { item1: newString }
				}
			});
		}
	};

	const handleIdChange = (
		newValue: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (newValue.target && 'value' in newValue.target) {
			const newId = newValue.target.value as string;
			urlInfo.updateParams({
				params: { id: newId }
			});
		}
	};
</script>

{#if urlInfo.current.params}
	<label for="idInput">ID</label>
	<input
		id="idInput"
		type="string"
		value={urlInfo.current.params.id}
		oninput={(newValue) => handleIdChange(newValue)}
	/>
{/if}

{#if urlInfo.current.searchParams}
	<label for="item1Input">item1</label>
	<input
		id="item1Input"
		type="string"
		value={(urlInfo.current.searchParams as any)?.nested?.item1 || ''}
		oninput={(newValue) => handleInput(newValue)}
	/>
{/if}

<pre>{JSON.stringify(urlInfo.current, null, 2)}</pre>
