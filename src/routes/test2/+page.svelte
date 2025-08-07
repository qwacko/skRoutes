<script lang="ts">
	import { Debounced, Previous, StateHistory, watch } from 'runed';
	import { createWatchedState } from './deepTrack.svelte';

	let value = $state({
		data: {
			nested: 'this is the initial value'
		}
	});

	const debounced = new Debounced(() => $state.snapshot(value));

	watch(
		() => $state.snapshot(value),
		(curr, prev) => {
			console.log(
				`Value changed:${JSON.stringify(curr, null, 2)} ${JSON.stringify(prev, null, 2)}`
			);
		}
	);
</script>

<div class="container">
	<input type="text" bind:value={value.data.nested} />

	<pre>{JSON.stringify(value, null, 2)}</pre>
	<pre>{JSON.stringify(debounced, null, 2)}</pre>

	<hr />
</div>

<style>
	.container {
		font-family: sans-serif;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		max-width: 600px;
	}
	input {
		padding: 8px;
		font-size: 1rem;
		border: 1px solid #aaa;
		border-radius: 4px;
	}
	code {
		background-color: #f0f0f0;
		padding: 2px 6px;
		border-radius: 4px;
	}
	hr {
		width: 100%;
		border: none;
		border-top: 1px solid #eee;
	}
</style>
