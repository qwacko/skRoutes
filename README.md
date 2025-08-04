# skRoutes

skRoutes is a package with the intent of making the URL useable as a typesafe state store for SvelteKit (a first class citizen). This intent means that this package makes SvelteKit routes, route parameters, and URL search parameters easy to manage with validation. Simplifies navigation by generating URLs for a chosen endpoint with necessary params and searchParams. Using this library will dramatically simplify URL changing, as changes in the URL will be reflected elsewhere as type errors.

## Installation

```bash
npm install skroutes
# or
pnpm add skroutes
```

## Features

- 🎯 **Local Schema Definition**: Define validation schemas directly in your page files (NEW!)
- 🔧 **Vite Plugin**: Automatic route configuration generation during development and build
- 🏷️ **Standard Schema Support**: Works with Zod, Valibot, ArkType, and any Standard Schema-compliant library
- 🔒 **Full Type Safety**: Route IDs and schema types are validated at compile time
- 🚀 **Zero Config**: No central configuration file needed - schemas are co-located with page logic
- 🔄 **Hot Reload**: Automatic regeneration during development when schemas change
- 📝 **Typesafe URL generation** based on route configuration, params, and search params
- 🛠️ **Easy URL manipulation** with different parameters or searchParameters from current URL
- ✅ **Validation** of route parameters and search parameters
- 🎨 **Fully typed** params and search params for use throughout the application
- 🌳 **Nested search parameters** support
- 🚦 **TypeScript validation** of URL addresses (changing URLs will cause TypeScript errors)
- 📦 **Store integration** with automatic navigation and debouncing

## Quick Start (New Vite Plugin Approach)

### 1. Setup the Vite Plugin

Add the skRoutes plugin to your `vite.config.js`:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { skRoutesPlugin } from 'skroutes/plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		skRoutesPlugin()
	]
});
```

### 2. Define Schemas in Your Page Files

In your `+page.server.ts` or `+page.ts` files, define schemas locally using underscore-prefixed exports:

```typescript
// src/routes/users/[id]/+page.server.ts
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

// Define schemas locally in the page file (SvelteKit compliant)
export const _paramsSchema = z.object({ 
  id: z.string().uuid() 
});

export const _searchParamsSchema = z.object({ 
  tab: z.enum(['profile', 'settings']).optional(),
  page: z.coerce.number().positive().optional()
});

export const load = (data) => {
	// The plugin automatically registers these schemas and provides full type safety
	const { current: urlData } = serverPageInfo('/users/[id]', data);

	// urlData.params is now typed as { id: string } with UUID validation
	// urlData.searchParams is typed as { tab?: 'profile' | 'settings', page?: number }

	return {
		user: getUserById(urlData.params.id),
		activeTab: urlData.searchParams?.tab || 'profile',
		currentPage: urlData.searchParams?.page || 1
	};
};
```

### 3. Use in Svelte Components

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
	import { pageInfo } from 'skroutes';
	import { page } from '$app/stores';

	// Fully typed with automatic route validation
	$: urlInfo = pageInfo('/users/[id]', $page);
	const tabs = ['profile', 'settings'] as const;
</script>

<div class="page">
	<h1>User: {urlInfo.current.params?.id}</h1>
	<p>Current Tab: {urlInfo.current.searchParams?.tab || 'profile'}</p>
	
	<div class="tabs">
		{#each tabs as tab}
			<a 
				href={urlInfo.updateParams({ searchParams: { tab } }).url}
				class:active={urlInfo.current.searchParams?.tab === tab}
			>
				{tab}
			</a>
		{/each}
	</div>
</div>
```

### 4. Schema Updates

When you change schemas in your page files, the types are automatically updated:

```bash
# Manual regeneration (if needed)
pnpm regenerate

# Or just restart dev server
pnpm dev
```

## Legacy Usage (Central Configuration)

You can still use the traditional central configuration approach:

```typescript
import { skRoutes } from 'skroutes';
import { z } from 'zod';

export const { pageInfo, urlGenerator, serverPageInfo } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() })
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() })
		}
	},
	errorURL: '/error'
});
```

## Plugin Features & Benefits

### ✅ **Co-location**
Schemas are defined right next to the page logic that uses them, improving maintainability and reducing context switching.

### ✅ **Standard Schema Support**
Works with any [Standard Schema](https://github.com/standard-schema/standard-schema) compliant library:
- **Zod**: `z.object({ id: z.string() })`
- **Valibot**: `v.object({ id: v.string() })`
- **ArkType**: `type({ id: 'string' })`

### ✅ **Type Safety**
- Route IDs are validated at compile time
- Schema types flow through automatically
- TypeScript errors when using wrong route paths

### ✅ **Zero Configuration**
- No central configuration file to maintain
- Automatic discovery of page schemas
- Hot reload during development

### ✅ **SvelteKit Compliant**
Uses underscore-prefixed exports (`_paramsSchema`, `_searchParamsSchema`) which are allowed in SvelteKit page files.

## Migration from v1

**Old centralized approach:**
```typescript
// routeConfig.ts
export const { pageInfo, urlGenerator, serverPageInfo } = skRoutes({
  config: {
    '/users/[id]': {
      paramsValidation: z.object({ id: z.string() }).parse
    }
  },
  errorURL: '/error'
});
```

**New local approach:**
```typescript
// In your +page.server.ts file
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

export const _paramsSchema = z.object({ id: z.string() });

export const load = (data) => {
  const { current: urlData } = serverPageInfo('/users/[id]', data);
  // ... rest of your load function
};
```

The plugin handles the rest automatically!

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

## Development & Troubleshooting

### Schema Not Updating?

If your schema changes aren't reflected in the generated types:

```bash
# Manual regeneration
pnpm regenerate

# Or restart the dev server
pnpm dev
```

### Plugin Not Working?

1. **Check Vite Config**: Ensure `skRoutesPlugin()` is added to your `vite.config.js`
2. **Schema Exports**: Use underscore-prefixed exports (`_paramsSchema`, `_searchParamsSchema`)
3. **File Location**: Schemas must be in `+page.server.ts` or `+page.ts` files
4. **Build Process**: The plugin runs during `buildStart()` and hot updates

### TypeScript Errors?

- Ensure you're importing from `'skroutes'` (not `'skroutes/plugin'`)
- Check that route IDs match your actual file structure
- Verify schema syntax is valid Standard Schema

### Generated Config Location

The plugin generates configuration at:
- `src/lib/.generated/skroutes-config.ts`

This file is auto-generated and should not be edited manually. Add it to your `.gitignore` if desired.

## API Reference

### Plugin Functions

- `serverPageInfo<T>(routeId: T, data)` - Server-side route info with validation
- `pageInfo<T>(routeId: T, pageData)` - Client-side route info with validation  
- `pageInfoStore<T>(config)` - Reactive store with debounced URL updates
- `urlGenerator(input)` - Generate URLs with validation

### Schema Exports

- `_paramsSchema` - Validates route parameters (e.g., `[id]`, `[slug]`)
- `_searchParamsSchema` - Validates URL search parameters (query string)

## Documentation

For more detailed documentation and advanced usage, please refer to the source code and examples provided in the [Github repository](https://github.com/qwacko/skroutes).
