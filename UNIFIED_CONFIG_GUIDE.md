# Unified Route Configuration Guide

## Overview

The new unified route configuration approach consolidates all route-related settings into a single `_routeConfig` export, providing better organization and enabling per-route error handling.

## Migration from Separate Exports

### Before (Legacy Format)
```typescript
// +page.server.ts
import { z } from 'zod';

export const _paramsSchema = z.object({
  id: z.string().uuid()
});

export const _searchParamsSchema = z.object({
  tab: z.enum(['profile', 'settings']).optional()
});
```

### After (Unified Format)
```typescript
// +page.server.ts
import { z } from 'zod';
import type { RouteConfig } from 'skroutes/route-config-types';

export const _routeConfig = {
  params: z.object({
    id: z.string().uuid()
  }),
  
  searchParams: z.object({
    tab: z.enum(['profile', 'settings']).optional()
  }),
  
  // NEW: Per-route error handling
  onParamsError: (error, rawParams) => {
    console.error('Invalid params:', error);
    return { redirect: '/users' };
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    console.warn('Invalid search params, using defaults');
    return { searchParams: { tab: undefined } };
  },
  
  // NEW: Optional metadata
  meta: {
    title: 'User Profile',
    description: 'User profile management page'
  }
} satisfies RouteConfig;
```

## Error Handling Options

### 1. Redirect on Error
```typescript
onParamsError: (error, rawParams) => {
  return { redirect: '/error-page' };
}
```

### 2. Provide Default Values
```typescript
onParamsError: (error, rawParams) => {
  return { params: { id: 'default-id' } };
}
```

### 3. Return HTTP Response (Server-side)
```typescript
onParamsError: (error, rawParams) => {
  return new Response('Bad Request', { status: 400 });
}
```

### 4. Log and Continue with Default Behavior
```typescript
onParamsError: (error, rawParams) => {
  console.error('Validation failed:', error);
  // Return void to use default error handling
}
```

## Real-World Example

```typescript
// src/routes/products/[category]/[id]/+page.server.ts
import { serverPageInfo } from 'skroutes';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { RouteConfig } from 'skroutes/route-config-types';

export const _routeConfig = {
  params: z.object({
    category: z.enum(['electronics', 'clothing', 'books'], {
      errorMap: () => ({ message: 'Invalid product category' })
    }),
    id: z.string().regex(/^[A-Z0-9]{8}$/, 'Product ID must be 8 uppercase alphanumeric characters')
  }),
  
  searchParams: z.object({
    color: z.string().optional(),
    size: z.enum(['S', 'M', 'L', 'XL']).optional(),
    inStock: z.coerce.boolean().default(true),
    page: z.coerce.number().positive().default(1)
  }),
  
  onParamsError: (error, rawParams) => {
    // Log for analytics
    console.error('Product page params error:', {
      error: error.issues,
      params: rawParams,
      timestamp: new Date().toISOString()
    });
    
    // Redirect to category page if category is invalid
    if (rawParams.category && !['electronics', 'clothing', 'books'].includes(rawParams.category)) {
      return { redirect: '/products' };
    }
    
    // Redirect to category page if product ID is invalid
    return { redirect: `/products/${rawParams.category || 'electronics'}` };
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    console.warn('Invalid search params, sanitizing:', error.issues);
    
    // Clean up search params instead of failing
    return {
      searchParams: {
        color: undefined,
        size: undefined,
        inStock: true,
        page: 1
      }
    };
  },
  
  meta: {
    title: 'Product Details',
    description: 'View detailed product information',
    tags: ['ecommerce', 'product', 'catalog'],
    requiresAuth: false,
    cacheStrategy: 'stale-while-revalidate'
  }
} satisfies RouteConfig;

export const load = async (data) => {
  const { current: urlData } = serverPageInfo('/products/[category]/[id]', data);
  
  // Types are fully inferred with error handling built-in
  const product = await getProduct(
    urlData.params.category, // typed as 'electronics' | 'clothing' | 'books'
    urlData.params.id        // typed as string with regex validation
  );
  
  const filters = {
    color: urlData.searchParams.color,     // string | undefined
    size: urlData.searchParams.size,       // 'S' | 'M' | 'L' | 'XL' | undefined
    inStock: urlData.searchParams.inStock, // boolean (default: true)
    page: urlData.searchParams.page        // number (default: 1)
  };
  
  return {
    product,
    filters,
    category: urlData.params.category
  };
};
```

## API Endpoint Example

```typescript
// src/routes/api/users/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RouteConfig } from 'skroutes/route-config-types';

export const _routeConfig = {
  params: z.object({
    id: z.string().uuid('Invalid user ID format')
  }),
  
  onParamsError: (error, rawParams) => {
    // Return HTTP error response for API endpoints
    return new Response(
      JSON.stringify({ 
        error: 'Invalid user ID',
        details: error.issues,
        received: rawParams 
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  
  meta: {
    title: 'User API',
    description: 'User management API endpoint',
    tags: ['api', 'user'],
    rateLimit: { requests: 100, window: 60000 }
  }
} satisfies RouteConfig;

export async function GET({ params }) {
  // params.id is validated and typed
  const user = await getUserById(params.id);
  
  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  
  return json({ user });
}
```

## Benefits of Unified Configuration

### ✅ **Single Source of Truth**
- All route configuration in one place
- Easier to understand and maintain
- Consistent structure across routes

### ✅ **Enhanced Error Handling**
- Custom error logic per route
- Graceful degradation options
- Better user experience

### ✅ **Rich Metadata Support**
- Route documentation
- Caching strategies
- Authentication requirements
- Rate limiting configuration

### ✅ **Type Safety**
- Full TypeScript support
- `satisfies RouteConfig` ensures correct structure
- Inferred types flow through the application

### ✅ **Extensibility**
- Easy to add new configuration options
- Backward compatible with legacy format
- Future-proof architecture

## Backward Compatibility

The system supports both formats simultaneously:

```typescript
// This still works (legacy)
export const _paramsSchema = z.object({ id: z.string() });
export const _searchParamsSchema = z.object({ tab: z.string() });

// And this is the new format
export const _routeConfig = {
  params: z.object({ id: z.string() }),
  searchParams: z.object({ tab: z.string() }),
  onParamsError: (error) => ({ redirect: '/error' })
};
```

## Implementation Status

### ✅ Completed
- Route configuration type definitions
- Plugin detection of unified config
- Error handling in URL generation
- Type system integration

### 🚧 In Progress
- Complex object parsing in plugin
- Enhanced metadata handling
- Migration tooling

### 📋 Future Enhancements
- IDE autocomplete support
- Runtime validation helpers
- Performance optimizations
- Advanced error recovery strategies

## Getting Started

1. **Install the updated package** with unified configuration support
2. **Choose your approach**:
   - Migrate existing routes to unified format
   - Use unified format for new routes
   - Mix both formats during transition
3. **Add error handling** where needed for better UX
4. **Leverage metadata** for documentation and tooling

The unified configuration approach provides a more powerful and organized way to manage route validation while maintaining full backward compatibility with existing code.