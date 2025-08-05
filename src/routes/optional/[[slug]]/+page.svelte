<script lang="ts">
	import { page } from '$app/stores';
	import { pageInfo } from '$lib/auto-skroutes';

	// Test optional parameter handling
	const { current } = pageInfo('/optional/[[slug]]', $page);
	
	$: console.log('Optional slug param:', current.params.slug);
</script>

<h1>Optional Parameter Test</h1>
<p>Current slug: {current.params.slug || 'undefined'}</p>
<p>Slug: {current.params.slug || 'none'}</p>