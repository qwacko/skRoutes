# skRoutes

skRoutes is a package developed to provide typesafe access to SvelteKit routes. It allows you to generate URLs based on a route configuration, ensuring that the generated URLs are valid and adhere to the defined types.

## Installation

```bash
npm install skroutes

pnpm add skroutes
```

## Features

- Typesafe URL generation based on a route configuration.
- Validation of route parameters and search parameters.

## Usage

Define your route configuration:

```typescript
import { skRoutes } from 'skRoutes';
import { z } from 'zod';

export const { pageInfo, urlGenerator, serverPageInfo } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		}
	},
	errorURL: '/error'
});
```

Use the urlGenerator function to generate URLs:

```typescript
const url = urlGenerator({ address: '/[id]', paramsValue: { id: 'Horse' } }).url;
```

Display the generated URL in your Svelte component:

```svelte
<script lang="ts">
	import { pageInfo, urlGenerator } from '../routeConfig.js';
	import { page } from '$app/stores';

	$: urlInfo = pageInfo('/[id]', $page);
	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];
</script>

<div class="page">
	{JSON.stringify(urlInfo)}
	<div class="item-row">
		{#each options as currentOption}
			<a href={urlGenerator({ address: '/[id]', paramsValue: { id: currentOption } }).url}>
				{currentOption}
			</a>
		{/each}
	</div>
</div>
```

## Documentation

For more detailed documentation and advanced usage, please refer to the source code and examples provided in the [Github repository](https://github.com/qwacko/skroutes).
