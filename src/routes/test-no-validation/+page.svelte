<script lang="ts">
	import { page } from '$app/state';
	import { pageInfo } from '$lib/auto-skroutes.svelte.js';

	export let data;

	const urlInfo = pageInfo('/test-no-validation', () => page);
</script>

<h1>Test No Validation Route</h1>
<p>{data.message}</p>
<p>This route has an empty _routeConfig with no validation properties.</p>
<pre>{JSON.stringify(urlInfo.current, null, 2)}</pre>
