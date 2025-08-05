<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { pageInfo } from '$lib/auto-skroutes';

	const { current, updateParams } = pageInfo('/store/[id]', $page);

	const handleInput = (
		newValue: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (newValue.target && 'value' in newValue.target) {
			const newString = newValue.target.value as string;
			updateParams({
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
			updateParams({
				params: { id: newId }
			});
		}
	};
</script>

{#if current.params}
	<label for="idInput">ID</label>
	<input 
		id="idInput" 
		type="string" 
		value={current.params.id}
		on:input={(newValue) => handleIdChange(newValue)}
	/>
{/if}

{#if current.searchParams}
	<label for="item1Input">item1</label>
	<input
		id="item1Input"
		type="string"
		value={(current.searchParams as any)?.nested?.item1 || ''}
		on:input={(newValue) => handleInput(newValue)}
	/>
{/if}

<pre>{JSON.stringify(current, null, 2)}</pre>
