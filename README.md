# skRoutes

skRoutes is a package with the intent of making the URL useable as a typesafe state store for sveltekit (a first class citizen). This intent means that this package makes sveltekit routes, route parameters, and url search parameters easy to manage with validation. Simplifies navigation by generating URLs for a chosen endpoint with necessary params and searchParams. Using this library will dramatically simplify url changing, as changes in teh URL will be reflected elsewhere as type errors.

## Installation

```bash
npm install skroutes

pnpm add skroutes
```

## Features

- Typesafe URL generation based on a route configuration, params, and search params.
- Easily generate new url with different parameters or searchParameters from current url.
- Validation of route parameters and search parameters.
- Fully typed params and search params for use throughout the application.
- Use of nested search pararms.
- Typescript validation of URL addresses (changing URLs will cause typescript errors).
- Ability to access params and searchParams as a store, with automatic navigation (with debouncing)

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

Display the generated URL in your Svelte component (note that this includes the ` current`` url, as well as  `updateParams` which generates a url based on updated parameters):

```svelte
<script lang="ts">
	import { pageInfo, urlGenerator } from '../routeConfig.js';
	import { page } from '$app/stores';

	$: urlInfo = pageInfo('/[id]', $page);
	const options = ['Horse', 'Donkey', 'Cat', 'Dog'];
</script>

<div class="page">
	{JSON.stringify(urlInfo.current)}
	<div class="item-row">
		{#each options as currentOption}
			<a href={urlInfo.updateParams({ params: { id: currentOption } }).url}>{currentOption}</a>
		{/each}
	</div>
</div>
```

## Error Handling and errorURL

skRoutes provides a mechanism to handle errors gracefully through the errorURL configuration. When an error occurs during URL generation, the library will redirect to the specified errorURL with an error message appended as a query parameter.

### How errorURL Works

When defining your route configuration, specify an errorURL:

```typescript
export const { pageInfo, urlGenerator, serverPageInfo } = skRoutes({
	config: {
		// ... your routes
	},
	errorURL: '/error'
});
```

If an error occurs during URL generation, the urlGenerator function will return an object with the error property set to true and the url property set to the errorURL with an appended error message.

You can then handle this error in your application by checking the error property and displaying the appropriate error message or redirecting to the error page.

### Safe Validation

It's crucial to ensure that your validation functions fail safely. If a validation error occurs, it should not crash your application but instead provide meaningful feedback or redirect to the errorURL.

If you're using zod for validation, it's recommended to use the [.catch](https://github.com/colinhacks/zod#catch) functionality to handle validation errors gracefully:

```typescript
const validation = z.object({ id: z.string() }).catch({id: "default"}});
```

By following these practices, you can ensure a smooth user experience even in the face of unexpected input or errors.

## Documentation

For more detailed documentation and advanced usage, please refer to the source code and examples provided in the [Github repository](https://github.com/qwacko/skroutes).
