<script lang="ts">
	import { page } from '$app/state';
	import { pageInfo } from '$lib/auto-skroutes';

	// Test optional parameter handling
	const urlInfo = $derived(pageInfo('/optional/[[slug]]', page));

	$inspect(`Optional slug param: ${urlInfo.current.params.slug}`);
</script>

<h1>Optional Parameter Test</h1>
<p>Current slug: {urlInfo.current.params.slug || 'undefined'}</p>
<p>Slug: {urlInfo.current.params.slug || 'none'}</p>
