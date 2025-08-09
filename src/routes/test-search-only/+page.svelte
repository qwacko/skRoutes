<script lang="ts">
	export let data;
</script>

<h1>Test Search Only Route</h1>
<p>Query: {data.query}</p>
<p>Limit: {data.limit}</p>
<p>This route only has searchParamsValidation, no paramsValidation.</p>
