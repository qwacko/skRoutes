<script lang="ts">
	import { throttledSync } from '$lib/helpers.svelte';

	let states = $state({
		nested: {
			value: 'Initial Value'
		}
	});

	const derivedState = $derived(states);

	const downstreamState = throttledSync({
		getter: () => derivedState,
		setter: (val) => (states = val),
		throttleTime: 1000
	});
</script>

{states.nested.value}
Upstream
<input type="text" bind:value={states.nested.value} />
Downstream
<input type="text" bind:value={downstreamState.state.nested.value} />
<button onclick={() => downstreamState.immediateUpdate({ nested: { value: 'Immediate Update' } })}>
	Immediate Update
</button>
