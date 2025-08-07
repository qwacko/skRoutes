# skRoutes

A TypeScript-first SvelteKit library for type-safe URL generation and route parameter validation using Standard Schema.

## Installation

```bash
npm install skroutes
# or
pnpm add skroutes
```

## Features

- 🔒 **Full Type Safety**: Route parameters and search parameters are fully typed based on your schema configuration
- 🏷️ **Standard Schema Support**: Works with Zod, Valibot, ArkType, and any Standard Schema-compliant library  
- 📝 **Type-safe URL generation** with automatic validation and proper return types
- 🛠️ **Easy URL manipulation** with strongly typed parameter updates
- 🎨 **Reactive state management** with throttled URL updates and Svelte 5 runes support
- 🔄 **Bi-directional synchronization**: Changes flow seamlessly between URL state and component state
- ⚡ **Throttled updates**: Built-in throttling prevents excessive URL changes during rapid state updates
- 🎯 **Direct binding**: Bind form inputs directly to URL parameters with automatic synchronization
- 🚦 **TypeScript validation** of route addresses with compile-time checking
- 💾 **Unsaved changes detection**: Track when internal state differs from URL state
- 🔄 **Reset functionality**: Easily revert changes back to the current URL state
- 📊 **Debug mode**: Comprehensive logging to understand state synchronization flow
- 🎯 **Non-Optional Results**: `params` and `searchParams` are never undefined - no optional chaining needed!

## Quick Start

### 1. Define Your Route Configuration

```typescript
// src/lib/routes.ts
import { skRoutes } from 'skroutes';
import { z } from 'zod';

export const { urlGenerator, pageInfo } = skRoutes({
	config: {
		'/users/[id]': {
			paramsValidation: z.object({
				id: z.string().uuid()
			}),
			searchParamsValidation: z.object({
				tab: z.enum(['profile', 'settings']).optional(),
				page: z.coerce.number().positive().optional()
			})
		},
		'/products/[slug]': {
			paramsValidation: z.object({
				slug: z.string().min(1)
			})
		}
	},
	errorURL: '/error'
});
```

### 2. Generate Type-Safe URLs

```typescript
import { urlGenerator } from '$lib/routes';

// Generate a URL with validation - all parameters are strongly typed!
const userUrl = urlGenerator({
	address: '/users/[id]', // ✅ TypeScript validates this route exists
	paramsValue: { id: 'user123' }, // ✅ TypeScript knows id: string is required
	searchParamsValue: { tab: 'profile', page: 1 } // ✅ TypeScript validates tab and page types
});

console.log(userUrl.url); // '/users/user123?tab=profile&page=1'
console.log(userUrl.error); // false
console.log(userUrl.params); // ✅ Typed as { id: string } (never undefined!)
console.log(userUrl.searchParams); // ✅ Typed as { tab: 'profile' | 'settings' | undefined, page: number | undefined } (never undefined!)

// No need for optional chaining - params and searchParams are guaranteed to exist
const userId = userUrl.params.id; // ✅ Direct access, no userUrl.params?.id needed
const userTab = userUrl.searchParams.tab; // ✅ Direct access, no userUrl.searchParams?.tab needed

// ❌ TypeScript will catch these errors at compile time:
// urlGenerator({ address: '/nonexistent' }); // Error: route doesn't exist
// urlGenerator({ address: '/users/[id]', paramsValue: { id: 123 } }); // Error: id must be string
// urlGenerator({ address: '/users/[id]', searchParamsValue: { tab: 'invalid' } }); // Error: invalid tab value
```

### 3. Use in SvelteKit Pages

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
	import { pageInfo } from '$lib/routes';
	import { page } from '$app/state';

	export let data; // From your +page.server.ts

	// Create reactive route info with throttled URL updates
	const route = pageInfo('/users/[id]', () => $page, {
		updateDelay: 500, // 500ms throttling
		onUpdate: (url) => console.log('URL updated:', url),
		debug: false // Enable for debugging
	});

	const tabs = ['profile', 'settings'] as const;

	// Function to switch tabs
	function switchTab(tab: string) {
		route.updateParams({ searchParams: { tab } });
	}

	// You can also bind directly to form inputs
	let searchQuery = $state('');
	
	// Bind to route parameters for reactive URL updates
	$effect(() => {
		if (searchQuery) {
			route.current.searchParams = { 
				...route.current.searchParams, 
				query: searchQuery 
			};
		}
	});
</script>

<div class="page">
	<h1>User: {route.current.params.id}</h1>
	<p>Current Tab: {route.current.searchParams.tab || 'profile'}</p>

	<!-- Show unsaved changes indicator -->
	{#if route.hasChanges}
		<div class="unsaved-changes">
			<p>You have unsaved changes</p>
			<button onclick={route.resetParams}>Reset</button>
		</div>
	{/if}

	<!-- Direct binding to search parameters -->
	<input 
		type="text" 
		bind:value={route.current.searchParams.query}
		placeholder="Search..."
	/>

	<div class="tabs">
		{#each tabs as tab}
			<button 
				onclick={() => switchTab(tab)} 
				class:active={route.current.searchParams.tab === tab}
			>
				{tab}
			</button>
		{/each}
	</div>
</div>
```

### 4. Auto-Generated Routes with Vite Plugin

For the best developer experience, use the Vite plugin to automatically generate typed routes:

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { skRoutesPlugin } from 'skroutes/plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		skRoutesPlugin({
			imports: ["import { z } from 'zod';"],
			errorURL: '/error'
		})
	]
});
```

Then use the auto-generated routes:

```typescript
// Import from the auto-generated file
import { urlGenerator, pageInfo } from '$lib/auto-skroutes';

// All your routes are automatically typed and available!
const userUrl = urlGenerator({
	address: '/users/[id]', // ✅ Auto-completed and type-checked
	paramsValue: { id: 'user123' }
});
```

## Advanced Usage

### Throttled Synchronization

skRoutes uses a sophisticated bi-directional synchronization system that keeps URL state and component state in perfect sync:

```typescript
const route = pageInfo('/search', () => $page, {
	updateDelay: 300, // Throttle URL updates to 300ms
	debug: true // See synchronization in action
});

// Changes to internal state are throttled before updating the URL
route.current.searchParams.query = 'hello';
route.current.searchParams.filter = 'active';
// ↑ Both changes are batched and applied after 300ms

// External URL changes (like browser navigation) immediately sync to internal state
// No throttling on incoming changes - only outgoing URL updates are throttled
```

**Key Benefits:**

- **Smooth UX**: Rapid typing in search boxes doesn't create browser history spam
- **Batched Updates**: Multiple parameter changes are combined into single URL updates  
- **Instant Sync**: External navigation immediately updates component state
- **Change Detection**: Only real content changes trigger updates (not just object reference changes)

### Direct Binding Patterns

```svelte
<script>
	const route = pageInfo('/products', () => $page, {
		updateDelay: 500,
		debug: false
	});
	
	// Complex form state that syncs to URL
	let formData = $state({
		search: route.current.searchParams.search || '',
		category: route.current.searchParams.category || 'all',
		priceRange: [
			Number(route.current.searchParams.minPrice) || 0,
			Number(route.current.searchParams.maxPrice) || 1000
		]
	});
	
	// Sync form changes back to URL (throttled)
	$effect(() => {
		route.current.searchParams = {
			search: formData.search || undefined,
			category: formData.category !== 'all' ? formData.category : undefined,
			minPrice: formData.priceRange[0] !== 0 ? formData.priceRange[0].toString() : undefined,
			maxPrice: formData.priceRange[1] !== 1000 ? formData.priceRange[1].toString() : undefined
		};
	});
</script>

<!-- Form inputs automatically stay in sync with URL -->
<input bind:value={formData.search} placeholder="Search products..." />
<select bind:value={formData.category}>
	<option value="all">All Categories</option>
	<option value="electronics">Electronics</option>
	<option value="clothing">Clothing</option>
</select>

<!-- Show unsaved changes -->
{#if route.hasChanges}
	<div class="changes-indicator">
		<span>Unsaved filters</span>
		<button onclick={route.resetParams}>Reset</button>
	</div>
{/if}
```

### Manual Configuration

You can also manually configure routes without the plugin:

```typescript
// src/lib/routes.ts
import { skRoutes } from 'skroutes';
import { z } from 'zod';

export const { urlGenerator, pageInfo } = skRoutes({
	config: {
		'/users/[id]': {
			paramsValidation: z.object({ id: z.string().uuid() }),
			searchParamsValidation: z.object({
				tab: z.enum(['profile', 'settings']).optional(),
				search: z.string().optional(),
				page: z.coerce.number().positive().optional()
			})
		},
		'/products/[category]': {
			paramsValidation: z.object({ 
				category: z.enum(['electronics', 'clothing', 'books'])
			}),
			searchParamsValidation: z.object({
				sort: z.enum(['price', 'name', 'rating']).optional(),
				minPrice: z.coerce.number().min(0).optional(),
				maxPrice: z.coerce.number().min(0).optional()
			})
		}
	},
	errorURL: '/error',
	updateAction: 'goto' // Default behavior for all pageInfo instances
});
```

### Error Handling

When validation fails, skRoutes redirects to your configured `errorURL`:

```typescript
const result = urlGenerator({
	address: '/users/[id]',
	paramsValue: { id: 'invalid-uuid' }
});

if (result.error) {
	console.log(result.url); // '/error?message=Error+generating+URL'
}
```

### Standard Schema Support

Works with any Standard Schema-compliant validation library:

```typescript
// Zod
import { z } from 'zod';
const zodSchema = z.object({ id: z.string() });

// Valibot
import * as v from 'valibot';
const valibotSchema = v.object({ id: v.string() });

// ArkType
import { type } from 'arktype';
const arkSchema = type({ id: 'string' });

// Use any of these in your route config
export const routes = skRoutes({
	config: {
		'/users/[id]': {
			paramsValidation: zodSchema // or valibotSchema, or arkSchema
		}
	},
	errorURL: '/error'
});
```

## API Reference

### `skRoutes(options)`

Creates a route configuration with type-safe utilities.

**Options:**

- `config`: Object mapping route patterns to validation schemas
- `errorURL`: URL to redirect to on validation errors

**Returns:**

- `urlGenerator`: Function to generate validated URLs
- `pageInfo`: Client-side route information utility with optional debounced updates

### Route Configuration

```typescript
interface RouteConfig {
	[routePattern: string]: {
		paramsValidation?: StandardSchemaV1<unknown, unknown>;
		searchParamsValidation?: StandardSchemaV1<unknown, unknown>;
	};
}
```

### URL Generator

```typescript
urlGenerator({
  address: '/users/[id]',           // Route pattern
  paramsValue?: { id: 'user123' },  // Route parameters
  searchParamsValue?: { tab: 'profile' } // Search parameters
})
```

**Returns:**

```typescript
{
	address: string;
	url: string;
	error: boolean;
	params: Record<string, unknown>; // Never undefined
	searchParams: Record<string, unknown>; // Never undefined
}
```

### Page Info

```typescript
pageInfo(
  routeId: '/users/[id]',           // Route pattern
  pageData: () => ({ params: {...}, url: {...} }), // Function returning SvelteKit page data
  config?: {                        // Optional configuration
    updateDelay?: 500,              // Throttle delay in milliseconds (default: 0)
    onUpdate?: (newUrl: string) => void, // Callback for URL changes
    updateAction?: 'goto' | 'nil',  // Whether to navigate or just update state
    debug?: boolean                 // Enable debug logging
  }
)
```

**Returns:**

```typescript
{
	current: {
		params: Record<string, unknown>; // Current validated params (reactive)
		searchParams: Record<string, unknown>; // Current validated search params (reactive)
	},
	updateParams: (updates: {
		params?: Partial<ParamsType>;
		searchParams?: Partial<SearchParamsType>;
	}) => UrlGeneratorResult,
	updateParamsURLGenerator: (updates) => UrlGeneratorResult, // Generate URL without navigation
	resetParams: () => void,          // Reset to current URL state
	hasChanges: boolean              // True if internal state differs from URL
}
```

## Migration Guide

### From Previous Versions

**Major Changes:**

1. **Function-based pageInfo**: `pageInfo` now takes a function that returns page data for better reactivity
2. **Configuration Object**: Parameters are now passed as a configuration object instead of positional arguments  
3. **Bi-directional Sync**: Direct binding to `current.params` and `current.searchParams` with automatic throttling
4. **New Utilities**: Added `resetParams()`, `hasChanges`, and `updateParamsURLGenerator()`
5. **Enhanced Debugging**: Comprehensive debug logging with the `debug` option

**Old Usage:**

```typescript
// Old way with positional arguments
const { current, updateParams } = pageInfo(
	routeId, 
	$page, 
	500, // delay
	goto // onUpdate callback
);
```

**New Usage:**

```typescript
// New way with function and configuration object
const route = pageInfo(routeId, () => $page, {
	updateDelay: 500,
	onUpdate: goto,
	updateAction: 'goto', // or 'nil' for state-only updates
	debug: true // Enable debugging
});

// New features available
console.log(route.hasChanges); // Check for unsaved changes
route.resetParams(); // Reset to URL state

// Direct binding now works with throttling
route.current.searchParams = { newValue: 'test' }; // Automatically throttled
```

**Enhanced Reactive Patterns:**

```typescript
// You can now bind directly to route parameters
<input bind:value={route.current.searchParams.query} />

// Or use reactive effects
$effect(() => {
	if (someCondition) {
		route.current.searchParams.filter = 'active';
	}
});

// Check for unsaved changes
{#if route.hasChanges}
	<button onclick={route.resetParams}>Reset Changes</button>
{/if}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/qwacko/skroutes).

## License

MIT License - see LICENSE file for details.
