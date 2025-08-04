# skRoutes v2 - Local Schema Definition Usage

This example shows how to use the new version of skRoutes with local schema definitions using Standard Schema.

## Setup

1. Install the updated skRoutes package
2. Add the Vite plugin to your `vite.config.js`:

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

## Define Schemas in Your Page Files

### `src/routes/users/[id]/+page.server.ts`

```typescript
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

// Define schemas locally in the page file (underscore prefix required by SvelteKit)
export const _paramsSchema = z.object({ 
  id: z.string().uuid() 
});

export const _searchParamsSchema = z.object({ 
  tab: z.enum(['profile', 'settings']).optional(),
  page: z.coerce.number().positive().optional()
});

export const load = (data) => {
	// The plugin automatically registers these schemas
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

### `src/routes/products/[category]/[slug]/+page.server.ts`

```typescript
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

export const _paramsSchema = z.object({ 
  category: z.string().min(1),
  slug: z.string().min(1)
});

export const _searchParamsSchema = z.object({ 
  variant: z.string().optional(),
  color: z.string().optional(),
  size: z.enum(['S', 'M', 'L', 'XL']).optional()
});

export const load = (data) => {
	const { current: urlData } = serverPageInfo('/products/[category]/[slug]', data);

	return {
		product: getProduct(urlData.params.category, urlData.params.slug),
		selectedVariant: urlData.searchParams?.variant,
		selectedColor: urlData.searchParams?.color,
		selectedSize: urlData.searchParams?.size
	};
};
```

## How It Works

1. **Vite Plugin Scanning**: The `skRoutesPlugin` scans all `+page.server.ts` and `+page.ts` files in your `src/routes` directory
2. **Schema Detection**: It looks for exported `paramsSchema` and `searchParamsSchema` constants
3. **Virtual Module Generation**: Creates a virtual module with your route configuration that maps file paths to their schemas
4. **Automatic Type Safety**: Your schemas are automatically integrated with the skRoutes system

## Benefits

- ✅ **Co-location**: Schemas are defined right next to the page logic that uses them
- ✅ **Standard Schema**: Works with any Standard Schema-compliant library (Zod, Valibot, ArkType, etc.)
- ✅ **Type Safety**: Full TypeScript support with inferred types from your schemas
- ✅ **Hot Reload**: Schema changes trigger automatic rebuilds during development
- ✅ **No Central Configuration**: No need to maintain a separate route configuration file

## Migration from v1

Old centralized approach:
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

New local approach:
```typescript
// In your +page.server.ts file
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string() });

export const load = (data) => {
  const { current: urlData } = serverPageInfo('/users/[id]', data);
  // ... rest of your load function
};
```

The plugin handles the rest automatically!