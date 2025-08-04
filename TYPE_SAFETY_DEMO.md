# Enhanced Type Safety with Unified Route Configuration

## The Problem Before

With the previous approach, error handlers weren't properly typed:

```typescript
// Old approach - no type safety in error handlers
export const _paramsSchema = z.object({ id: z.string().uuid() });
export const _searchParamsSchema = z.object({ tab: z.enum(['profile', 'settings']) });

// Error handling was generic and not type-safe
// No way to ensure error handler returns match the schema types
```

## The Solution Now

With the new unified configuration, error handlers are fully typed:

```typescript
import { z } from 'zod';
import type { RouteConfig } from 'skroutes/route-config-types';

const paramsSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

const searchParamsSchema = z.object({
  tab: z.enum(['profile', 'settings', 'billing']).optional(),
  page: z.coerce.number().positive().default(1)
});

export const _routeConfig = {
  params: paramsSchema,
  searchParams: searchParamsSchema,
  
  // ✅ FULLY TYPED error handlers
  onParamsError: (error, rawParams) => {
    // error is typed as StandardSchemaV1.FailureResult
    console.error('Validation failed:', error.issues);
    
    // TypeScript ensures return type matches schema output: { id: string }
    // return { params: { id: 'default-uuid-value' } }; // ✅ Type-safe
    // return { params: { id: 123 } }; // ❌ Type error - id must be string
    
    return { redirect: '/users' }; // ✅ Also valid
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    // TypeScript ensures return type matches schema output: 
    // { tab?: 'profile' | 'settings' | 'billing', page: number }
    return {
      searchParams: {
        tab: undefined,  // ✅ Correct type
        page: 1         // ✅ Correct type
        // tab: 'invalid' // ❌ Type error - not in enum
      }
    };
  }
} satisfies RouteConfig<typeof paramsSchema, typeof searchParamsSchema>;
```

## Type Inference in Action

```typescript
export const load = (data) => {
  const { current: urlData } = serverPageInfo('/users/[id]', data);
  
  // All these are now perfectly typed based on the schemas above:
  const userId = urlData.params.id;        // string (with UUID validation)
  const activeTab = urlData.searchParams.tab; // 'profile' | 'settings' | 'billing' | undefined
  const currentPage = urlData.searchParams.page; // number (with positive validation)
  
  return { userId, activeTab, currentPage };
};
```

## Error Handler Type Safety Examples

### ✅ Valid Error Handler Returns

```typescript
onParamsError: (error, rawParams) => {
  // Option 1: Redirect
  return { redirect: '/fallback' };
  
  // Option 2: Provide valid default values (fully typed)
  return { params: { id: '00000000-0000-0000-0000-000000000000' } };
  
  // Option 3: HTTP Response (for server-side)
  return new Response('Invalid ID', { status: 400 });
  
  // Option 4: Let default error handling take over
  return; // void
}
```

### ❌ Type Errors Caught at Compile Time

```typescript
onParamsError: (error, rawParams) => {
  // ❌ TypeScript error - id must be string, not number
  return { params: { id: 123 } };
  
  // ❌ TypeScript error - missing required field
  return { params: {} };
  
  // ❌ TypeScript error - extra fields not allowed
  return { params: { id: 'valid-uuid', extra: 'field' } };
}

onSearchParamsError: (error, rawSearchParams) => {
  return {
    searchParams: {
      // ❌ TypeScript error - 'invalid' not in enum
      tab: 'invalid',
      
      // ❌ TypeScript error - page must be number
      page: 'not-a-number'
    }
  };
}
```

## Benefits of Enhanced Type Safety

### 🎯 **Compile-Time Validation**
- Error handlers must return types that match the schema
- No runtime surprises from type mismatches
- IDE autocomplete for all possible return values

### 🔒 **Schema Consistency**
- Error handler defaults must conform to the same validation rules
- Impossible to accidentally return invalid fallback data
- Single source of truth for data structure

### 🚀 **Developer Experience**  
- IntelliSense shows exact types and available options
- Refactoring schemas automatically updates error handler types
- Clear error messages when types don't match

### 🛡️ **Runtime Safety**
- Type-safe error handlers prevent invalid state
- Graceful degradation with guaranteed valid data
- Better error recovery strategies

## Real-World Example

```typescript
// E-commerce product page with full type safety
const productParamsSchema = z.object({
  category: z.enum(['electronics', 'clothing', 'books']),
  id: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid product ID')
});

const productSearchParamsSchema = z.object({
  color: z.string().optional(),
  size: z.enum(['S', 'M', 'L', 'XL']).optional(),
  inStock: z.coerce.boolean().default(true),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional()
});

export const _routeConfig = {
  params: productParamsSchema,
  searchParams: productSearchParamsSchema,
  
  onParamsError: (error, rawParams) => {
    // Fully typed error handling with business logic
    if (rawParams.category && 
        !['electronics', 'clothing', 'books'].includes(rawParams.category)) {
      return { redirect: '/products' };
    }
    
    // Type-safe fallback with guaranteed valid data
    return {
      params: {
        category: 'electronics' as const, // ✅ Must match enum
        id: 'DEFAULT1'                   // ✅ Must match regex pattern  
      }
    };
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    // Clean up invalid search params with type safety
    return {
      searchParams: {
        color: undefined,      // ✅ string | undefined
        size: undefined,       // ✅ 'S' | 'M' | 'L' | 'XL' | undefined  
        inStock: true,        // ✅ boolean
        minPrice: undefined,  // ✅ number | undefined
        maxPrice: undefined   // ✅ number | undefined
      }
    };
  }
} satisfies RouteConfig<typeof productParamsSchema, typeof productSearchParamsSchema>;
```

This approach ensures that your error handling is not only functional but also maintains the same level of type safety and validation as your main application logic, creating a robust and predictable system.