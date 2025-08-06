<script lang="ts">
	import { testRune } from './testRune.svelte';

	const { state } = testRune();
</script>

{state.nested.value}

<input type="text" bind:value={state.nested.value} />
