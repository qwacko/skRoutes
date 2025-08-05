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
- 🎨 **Reactive state management** with debounced URL updates and Svelte 5 runes support
- 🚦 **TypeScript validation** of route addresses with compile-time checking
- ⚡ **Generic Type System**: All functions are properly generic and infer types from your route configuration
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
  address: '/users/[id]',           // ✅ TypeScript validates this route exists
  paramsValue: { id: 'user123' },   // ✅ TypeScript knows id: string is required
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

```typescript
// src/routes/users/[id]/+page.server.ts
import { skRoutesServer } from 'skroutes/server';
import { z } from 'zod';

const { serverPageInfo } = skRoutesServer({
  config: {
    '/users/[id]': {
      paramsValidation: z.object({ id: z.string().uuid() }),
      searchParamsValidation: z.object({ 
        tab: z.enum(['profile', 'settings']).optional() 
      })
    }
  },
  errorURL: '/error'
});

export const load = (data) => {
  const { current } = serverPageInfo('/users/[id]', data);
  
  // current.params is typed as { id: string } with UUID validation
  // current.searchParams is typed with your schema
  
  return {
    user: getUserById(current.params.id),
    activeTab: current.searchParams?.tab || 'profile'
  };
};
```

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
  import { pageInfo } from '$lib/routes';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  const { current, updateParams } = pageInfo(
    '/users/[id]', 
    $page,
    500, // debounce delay
    (newUrl) => browser ? goto(newUrl) : undefined // auto-navigation
  );
  
  const tabs = ['profile', 'settings'] as const;
  
  function switchTab(tab: string) {
    updateParams({ searchParams: { tab } });
  }
</script>

<div class="page">
  <h1>User: {current.params.id}</h1>
  <p>Current Tab: {current.searchParams?.tab || 'profile'}</p>
  
  <div class="tabs">
    {#each tabs as tab}
      <button 
        on:click={() => switchTab(tab)}
        class:active={current.searchParams?.tab === tab}
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

### Manual Configuration

You can also manually configure routes without the plugin:

```typescript
// src/lib/routes.ts
import { skRoutes } from 'skroutes';
import { skRoutesServer } from 'skroutes/server';
import { z } from 'zod';

// Client-side routes
export const { urlGenerator, pageInfo } = skRoutes({
  config: {
    '/users/[id]': {
      paramsValidation: z.object({ id: z.string().uuid() }),
      searchParamsValidation: z.object({ 
        tab: z.enum(['profile', 'settings']).optional() 
      })
    }
  },
  errorURL: '/error'
});

// Server-side routes (separate import)
export const { serverPageInfo } = skRoutesServer({
  config: {
    '/users/[id]': {
      paramsValidation: z.object({ id: z.string().uuid() }),
      searchParamsValidation: z.object({ 
        tab: z.enum(['profile', 'settings']).optional() 
      })
    }
  },
  errorURL: '/error'
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
      paramsValidation: zodSchema, // or valibotSchema, or arkSchema
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
  params: Record<string, unknown>;     // Never undefined
  searchParams: Record<string, unknown>; // Never undefined
}
```

### Page Info

```typescript
pageInfo(
  routeId: '/users/[id]',           // Route pattern
  pageData: { params: {...}, url: {...} }, // SvelteKit page data
  updateDelay?: 1000,               // Optional debounce delay (ms)
  onUpdate?: (newUrl: string) => void // Optional callback for URL changes
)
```

**Returns:**
```typescript
{
  current: {
    params: Record<string, unknown>;     // Current validated params
    searchParams: Record<string, unknown>; // Current validated search params
  };
  updateParams: (updates: {
    params?: Partial<ParamsType>;
    searchParams?: Partial<SearchParamsType>;
  }) => UrlGeneratorResult;
}
```

## Migration Guide

### From v1 to v2

**Major Changes:**
1. **Standard Schema**: No more `.parse` - pass schemas directly
2. **Svelte 5 Support**: `pageInfo` now supports runes and optional debounced updates
3. **Simplified API**: Removed `pageInfoStore` - use `pageInfo` with callbacks instead
4. **Server Separation**: `serverPageInfo` moved to separate `skroutes/server` import

**v1 (Old):**
```typescript
// Old validation
{ paramsValidation: z.object({ id: z.string() }).parse }

// Old store usage
const store = pageInfoStore({ routeId, pageInfo: page, onUpdate: goto });
$store.searchParams = { tab: 'profile' };
```

**v2 (New):**
```typescript
// New validation
{ paramsValidation: z.object({ id: z.string() }) }

// New pageInfo usage
const { current, updateParams } = pageInfo(routeId, $page, 500, goto);
updateParams({ searchParams: { tab: 'profile' } });
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/qwacko/skroutes).

## License

MIT License - see LICENSE file for details.