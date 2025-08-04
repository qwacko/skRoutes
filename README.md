# skRoutes

skRoutes is a package with the intent of making the URL useable as a typesafe state store for SvelteKit (a first class citizen). This intent means that this package makes SvelteKit routes, route parameters, and URL search parameters easy to manage with validation. Simplifies navigation by generating URLs for a chosen endpoint with necessary params and searchParams. Using this library will dramatically simplify URL changing, as changes in the URL will be reflected elsewhere as type errors.

## Installation

```bash
npm install skroutes
# or
pnpm add skroutes
```

## Features

- 🎯 **Local Schema Definition**: Define validation schemas directly in your page and server files
- 🔧 **Flexible Vite Plugin**: Automatic route configuration with extensive customization options
- 🏷️ **Standard Schema Support**: Works with Zod, Valibot, ArkType, and any Standard Schema-compliant library
- 🔒 **Full Type Safety**: Route IDs and schema types are validated at compile time - no more optional types!
- 🚀 **Multiple Configuration Modes**: Plugin-only, manual-only, or hybrid approaches
- 🔄 **Hot Reload**: Automatic regeneration during development when schemas change
- 🌐 **Server File Support**: Works with both `+page.*` and `+server.*` files
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
		skRoutesPlugin({
			// Optional configuration
			imports: ["import { z } from 'zod';"],
			errorURL: '/error',
			includeServerFiles: true // Enable +server.ts support
		})
	]
});
```

### 2. Define Schemas in Your Page and Server Files

Define schemas locally in your `+page.server.ts`, `+page.ts`, or `+server.ts` files using underscore-prefixed exports:

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
	// urlData.searchParams is typed as { tab: 'profile' | 'settings' | undefined, page: number | undefined }

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

### ✅ **Enhanced Type Safety**
- Route IDs are validated at compile time
- Schema types flow through automatically - **no more optional types**!
- TypeScript errors when using wrong route paths
- Proper type inference from schema definitions

### ✅ **Flexible Configuration**
- Plugin-only: Use auto-generated config exclusively
- Manual-only: Traditional central configuration (still supported)
- Hybrid: Combine both approaches with `baseConfig` option
- Extensive plugin customization options

### ✅ **Multi-File Support**
- Works with `+page.server.ts`, `+page.ts`, and `+server.ts` files
- Automatic detection of schema exports
- Hot reload for all supported file types

### ✅ **SvelteKit Compliant**
Uses underscore-prefixed exports (`_paramsSchema`, `_searchParamsSchema`) which are allowed in SvelteKit page and server files.

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

## Server Files Support

The plugin also works with `+server.ts` files for API endpoints:

```typescript
// src/routes/api/users/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const _paramsSchema = z.object({
  id: z.string().uuid()
});

export const _searchParamsSchema = z.object({
  include: z.array(z.enum(['profile', 'settings'])).optional(),
  format: z.enum(['json', 'xml']).default('json')
});

export async function GET({ params, url }) {
  // Params and search params are automatically validated
  return json({
    userId: params.id,
    query: Object.fromEntries(url.searchParams)
  });
}
```

## Plugin Configuration Options

The `skRoutesPlugin` accepts comprehensive configuration options:

```typescript
skRoutesPlugin({
  // Output path for generated configuration
  outputPath: 'src/lib/.generated/skroutes-config.ts',
  
  // Custom schema export names
  schemaExportName: '_paramsSchema',
  searchParamsExportName: '_searchParamsSchema',
  
  // Custom imports to include in generated file
  imports: [
    "import { z } from 'zod';",
    "import * as v from 'valibot';"
  ],
  
  // Include +server.ts files (default: true)
  includeServerFiles: true,
  
  // Base configuration to merge with auto-generated config
  baseConfig: {
    '/legacy/route': {
      paramsValidation: z.object({ id: z.string() }),
      searchParamsValidation: z.object({ tab: z.string().optional() })
    }
  },
  
  // Error URL for validation failures
  errorURL: '/error'
})
```

## Hybrid Configuration

You can combine auto-generated config with manual configuration:

```typescript
// Use both plugin and manual config
import { createAutoSkRoutes } from 'skroutes';
import { z } from 'zod';

const { pageInfo, serverPageInfo, urlGenerator } = createAutoSkRoutes({
  // Additional manual routes (merged with auto-generated)
  config: {
    '/special/route': {
      paramsValidation: z.object({ special: z.string() }),
      searchParamsValidation: z.object({ mode: z.enum(['dev', 'prod']) })
    }
  },
  errorURL: '/custom-error'
});
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
3. **File Location**: Schemas must be in `+page.server.ts`, `+page.ts`, or `+server.ts` files
4. **Build Process**: The plugin runs during `buildStart()` and hot updates
5. **Server Files**: Set `includeServerFiles: true` in plugin options to scan `+server.*` files

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

### Plugin Options

- `outputPath` - Path for generated configuration file
- `schemaExportName` - Custom name for params schema export (default: `_paramsSchema`)
- `searchParamsExportName` - Custom name for search params schema export (default: `_searchParamsSchema`)
- `imports` - Additional imports to include in generated file
- `includeServerFiles` - Whether to scan `+server.*` files (default: `true`)
- `baseConfig` - Manual configuration to merge with auto-generated config
- `errorURL` - URL for validation error redirects

## Documentation

For more detailed documentation and advanced usage, please refer to the source code and examples provided in the [Github repository](https://github.com/qwacko/skroutes).
