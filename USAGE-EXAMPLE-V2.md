# skRoutes v2 Plugin Usage Examples

This document showcases the enhanced Vite plugin functionality with all the new features.

## Plugin Configuration Options

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { skRoutesPlugin } from 'skroutes/plugin';

export default defineConfig({
  plugins: [
    sveltekit(),
    skRoutesPlugin({
      // Output path for generated config
      outputPath: 'src/lib/.generated/skroutes-config.ts',
      
      // Custom schema export names (default: _paramsSchema, _searchParamsSchema)
      schemaExportName: '_paramsSchema',
      searchParamsExportName: '_searchParamsSchema',
      
      // Custom imports to include in generated file
      imports: [
        "import { z } from 'zod';",
        "import { v } from 'valibot';"
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
  ]
});
```

## Page File Schemas (+page.server.ts)

```typescript
// src/routes/users/[id]/+page.server.ts
import { serverPageInfo } from 'skroutes';
import { z } from 'zod';

// Define schemas locally using underscore prefix (SvelteKit compliant)
export const _paramsSchema = z.object({
  id: z.string().uuid('Invalid user ID')
});

export const _searchParamsSchema = z.object({
  tab: z.enum(['profile', 'settings', 'billing']).optional(),
  page: z.coerce.number().positive().optional(),
  sort: z.enum(['name', 'date', 'activity']).default('name')
});

export const load = (data) => {
  // ✅ Fully typed with schema validation
  const { current: urlData } = serverPageInfo('/users/[id]', data);
  
  // urlData.params is typed as { id: string } with UUID validation
  // urlData.searchParams is typed as { tab?: 'profile' | 'settings' | 'billing', page?: number, sort: 'name' | 'date' | 'activity' }
  
  return {
    user: getUserById(urlData.params.id),
    activeTab: urlData.searchParams.tab || 'profile',
    currentPage: urlData.searchParams.page || 1,
    sortBy: urlData.searchParams.sort
  };
};
```

## Server API Endpoints (+server.ts)

```typescript
// src/routes/api/products/[category]/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export const _paramsSchema = z.object({
  category: z.enum(['electronics', 'clothing', 'books']),
  id: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid product ID format')
});

export const _searchParamsSchema = z.object({
  include: z.array(z.enum(['reviews', 'specs', 'related'])).optional(),
  format: z.enum(['json', 'xml']).default('json'),
  version: z.coerce.number().min(1).max(3).default(1)
});

export async function GET({ params, url }) {
  // If using serverPageInfo here, params and searchParams would be fully typed
  const product = await getProduct(params.category, params.id);
  
  return json({
    product,
    requestedIncludes: Object.fromEntries(url.searchParams),
    timestamp: new Date().toISOString()
  });
}
```

## Client-Side Usage

```svelte
<!-- src/routes/users/[id]/+page.svelte -->
<script lang="ts">
  import { pageInfo, urlGenerator } from 'skroutes';
  import { page } from '$app/stores';

  // ✅ Fully typed with automatic route validation
  $: urlInfo = pageInfo('/users/[id]', $page);
  
  // ✅ Type-safe URL generation
  $: profileUrl = urlGenerator({
    address: '/users/[id]',
    paramsValue: { id: $page.params.id },
    searchParamsValue: { tab: 'profile' }
  });

  const tabs = ['profile', 'settings', 'billing'] as const;

  function switchTab(tab: typeof tabs[number]) {
    // ✅ Type-safe parameter updates
    const newUrl = urlInfo.updateParams({
      searchParams: { tab, page: 1 }
    });
    
    goto(newUrl.url);
  }
</script>

<div class="user-page">
  <h1>User: {urlInfo.current.params.id}</h1>
  <p>Current Tab: {urlInfo.current.searchParams.tab || 'profile'}</p>
  <p>Page: {urlInfo.current.searchParams.page || 1}</p>
  <p>Sort: {urlInfo.current.searchParams.sort}</p>
  
  <nav class="tabs">
    {#each tabs as tab}
      <button 
        on:click={() => switchTab(tab)}
        class:active={urlInfo.current.searchParams.tab === tab}
      >
        {tab}
      </button>
    {/each}
  </nav>
</div>
```

## Hybrid Configuration (Plugin + Manual)

```typescript
// You can combine auto-generated config with manual configuration
import { createAutoSkRoutes } from 'skroutes';
import { z } from 'zod';

// This merges with the auto-generated config
const { pageInfo, serverPageInfo, urlGenerator } = createAutoSkRoutes({
  config: {
    // Manual route definitions (merged with auto-generated ones)
    '/special/route': {
      paramsValidation: z.object({ special: z.string() }),
      searchParamsValidation: z.object({ mode: z.enum(['dev', 'prod']) })
    }
  },
  errorURL: '/custom-error'
});
```

## Multiple Schema Libraries

```typescript
// src/routes/mixed/[id]/+page.server.ts
import { z } from 'zod';
import * as v from 'valibot';

// Mix different schema libraries in the same project
export const _paramsSchema = z.object({
  id: z.string().uuid()
});

// You can also use other Standard Schema compliant libraries
// export const _paramsSchema = v.object({
//   id: v.pipe(v.string(), v.uuid())
// });
```

## Generated Configuration Output

The plugin automatically generates:

```typescript
// src/lib/.generated/skroutes-config.ts (auto-generated)
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { z } from 'zod';

// Inline schema definitions (extracted from page files)
const autoSchema0_params = z.object({
  id: z.string().uuid()
});
const autoSchema0_searchParams = z.object({
  tab: z.enum(['profile', 'settings', 'billing']).optional(),
  page: z.coerce.number().positive().optional(),
  sort: z.enum(['name', 'date', 'activity']).default('name')
});

export const routeConfig = {
  '/users/[id]': {
    paramsValidation: autoSchema0_params,
    searchParamsValidation: autoSchema0_searchParams,
  },
  '/api/products/[category]/[id]': {
    paramsValidation: autoSchema1_params,
    searchParamsValidation: autoSchema1_searchParams,
  }
} as const;

// Export route keys for type checking
export type RouteKeys = '/users/[id]' | '/api/products/[category]/[id]';

// Export type mapping for schema inference
export type RouteTypeMap = {
  '/users/[id]': { 
    params: StandardSchemaV1.InferOutput<typeof autoSchema0_params>; 
    searchParams: StandardSchemaV1.InferOutput<typeof autoSchema0_searchParams> 
  };
  '/api/products/[category]/[id]': { 
    params: StandardSchemaV1.InferOutput<typeof autoSchema1_params>; 
    searchParams: StandardSchemaV1.InferOutput<typeof autoSchema1_searchParams> 
  }
};

export const pluginOptions = {
  "errorURL": "/error"
};
```

## Key Benefits

### ✅ **Co-location**
- Schemas defined right next to page logic
- No central configuration file to maintain
- Better developer experience

### ✅ **Full Type Safety**
- Route IDs validated at compilation
- Schema types flow through automatically  
- TypeScript errors for wrong routes

### ✅ **Flexible Configuration**
- Use plugin-only, manual-only, or hybrid approach
- Customize export names, imports, output paths
- Support for both +page and +server files

### ✅ **Standard Schema Support**
- Works with Zod, Valibot, ArkType, etc.
- Future-proof with Standard Schema spec
- Mix different validation libraries

### ✅ **Hot Reload Development**
- Automatic regeneration during development
- Instant type updates when schemas change
- Seamless developer workflow