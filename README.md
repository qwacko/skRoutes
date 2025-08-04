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
- 🎨 **Reactive stores** with debounced URL updates and type inference
- 🚦 **TypeScript validation** of route addresses with compile-time checking
- ⚡ **Generic Type System**: All functions are properly generic and infer types from your route configuration

## Quick Start

### 1. Define Your Route Configuration

```typescript
// src/lib/routes.ts
import { skRoutes } from 'skroutes';
import { z } from 'zod';

export const { urlGenerator, pageInfo, serverPageInfo, pageInfoStore } = skRoutes({
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
console.log(userUrl.params); // ✅ Typed as { id: string }
console.log(userUrl.searchParams); // ✅ Typed as { tab: 'profile' | 'settings' | undefined, page: number | undefined }

// ❌ TypeScript will catch these errors at compile time:
// urlGenerator({ address: '/nonexistent' }); // Error: route doesn't exist
// urlGenerator({ address: '/users/[id]', paramsValue: { id: 123 } }); // Error: id must be string
// urlGenerator({ address: '/users/[id]', searchParamsValue: { tab: 'invalid' } }); // Error: invalid tab value
```

### 3. Use in SvelteKit Pages

```typescript
// src/routes/users/[id]/+page.server.ts
import { serverPageInfo } from '$lib/routes';

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

  $: urlInfo = pageInfo('/users/[id]', $page);
  const tabs = ['profile', 'settings'] as const;
</script>

<div class="page">
  <h1>User: {urlInfo.current.params.id}</h1>
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

### 4. Reactive Store with Auto-Navigation

```svelte
<script lang="ts">
  import { pageInfoStore } from '$lib/routes';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const urlStore = pageInfoStore({
    routeId: '/users/[id]',
    pageInfo: page,
    updateDelay: 500, // Debounce URL updates
    onUpdate: (newUrl) => goto(newUrl) // Auto-navigate on changes
  });

  // Reactive updates to URL parameters
  function updateTab(tab: string) {
    $urlStore.searchParams = { ...$urlStore.searchParams, tab };
  }
</script>

<button on:click={() => updateTab('profile')}>Profile</button>
<button on:click={() => updateTab('settings')}>Settings</button>
```

## Advanced Usage

### Auto-Generated Configuration with Vite Plugin

For larger projects, use the Vite plugin to automatically generate route configurations:

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

Then define schemas directly in your page files:

```typescript
// src/routes/users/[id]/+page.server.ts
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

export const _paramsSchema = z.object({ id: z.string().uuid() });
export const _searchParamsSchema = z.object({ 
  tab: z.enum(['profile', 'settings']).optional() 
});

export const load = (data) => {
  const { current } = serverPageInfo('/users/[id]', data);
  // Fully typed with automatic validation
  return { user: getUserById(current.params.id) };
};
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
- `pageInfo`: Client-side route information utility
- `serverPageInfo`: Server-side route information utility  
- `pageInfoStore`: Reactive store with debounced updates

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
  params?: Record<string, unknown>;
  searchParams?: Record<string, unknown>;
}
```

## Migration Guide

### From v1 to v2

The main change is the switch from custom validation functions to Standard Schema:

**v1 (Old):**
```typescript
{
  paramsValidation: z.object({ id: z.string() }).parse
}
```

**v2 (New):**
```typescript
{
  paramsValidation: z.object({ id: z.string() })
}
```

All other APIs remain the same.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/qwacko/skroutes).

## License

MIT License - see LICENSE file for details.