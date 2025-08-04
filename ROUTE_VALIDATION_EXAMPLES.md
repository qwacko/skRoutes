# Route Validation Access Examples

This document demonstrates how to use the new route validation access functionality to get both types and validators for reuse throughout your application.

## Basic Usage

### 1. Type-Only Access

```typescript
import { type RouteParams, type RouteSearchParams } from 'skroutes';

// Get types for specific routes
type UserParams = RouteParams<'/users/[id]'>;          // { id: string }
type UserSearchParams = RouteSearchParams<'/users/[id]'>; // { tab?: string, page?: number }

// Use in your functions
function processUserData(params: UserParams, searchParams: UserSearchParams) {
  console.log(`Processing user ${params.id}`);
  if (searchParams.tab) {
    console.log(`Active tab: ${searchParams.tab}`);
  }
}
```

### 2. Validator Access

```typescript
import { routeInfo } from 'skroutes';

// Get validators for a specific route
const userRouteInfo = routeInfo('/users/[id]');

// Access the actual validation schemas
const paramsValidator = userRouteInfo.paramsValidator;
const searchParamsValidator = userRouteInfo.searchParamsValidator;

// Use validators directly
function validateUserInput(rawParams: unknown, rawSearchParams: unknown) {
  try {
    const validParams = paramsValidator!['~standard'].validate(rawParams);
    const validSearchParams = searchParamsValidator!['~standard'].validate(rawSearchParams);
    
    if ('issues' in validParams && validParams.issues) {
      throw new Error('Invalid params');
    }
    if ('issues' in validSearchParams && validSearchParams.issues) {
      throw new Error('Invalid search params');
    }
    
    return {
      params: validParams.value,
      searchParams: validSearchParams.value
    };
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}
```

## Advanced Use Cases

### 1. Form Validation Outside Page Components

```typescript
// src/lib/forms/user-form.ts
import { routeInfo, type RouteParams } from 'skroutes';

const userRoute = routeInfo('/users/[id]');

export class UserFormValidator {
  validateParams(data: unknown): RouteParams<'/users/[id]'> {
    const result = userRoute.paramsValidator!['~standard'].validate(data);
    
    if (result instanceof Promise) {
      throw new Error('Async validation not supported');
    }
    
    if ('issues' in result && result.issues) {
      throw new Error(`Validation failed: ${result.issues.map(i => i.message).join(', ')}`);
    }
    
    return result.value;
  }
  
  validateSearchParams(data: unknown) {
    // Similar validation for search params
    const result = userRoute.searchParamsValidator!['~standard'].validate(data);
    // ... validation logic
    return result.value;
  }
}
```

### 2. API Route Body Validation (Manual)

```typescript
// src/routes/api/users/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { routeInfo } from 'skroutes';
import { z } from 'zod';

// Define route params schema as usual
export const _paramsSchema = z.object({
  id: z.string().uuid()
});

// Manual body schema (not auto-detected by plugin)
const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export async function PUT({ params, request }) {
  // Use route validator for params
  const routeValidation = routeInfo('/api/users/[id]');
  const validatedParams = routeValidation.paramsValidator!['~standard'].validate(params);
  
  if ('issues' in validatedParams && validatedParams.issues) {
    return json({ error: 'Invalid user ID' }, { status: 400 });
  }
  
  // Manual validation for body
  const body = await request.json();
  const validatedBody = bodySchema['~standard'].validate(body);
  
  if ('issues' in validatedBody && validatedBody.issues) {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  // Both params and body are now validated and typed
  return json({
    userId: validatedParams.value.id,
    updatedData: validatedBody.value
  });
}
```

### 3. Middleware/Hook Integration

```typescript
// src/hooks.server.ts
import { routeInfo, type RouteKeys } from 'skroutes';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const routeId = event.route.id as RouteKeys;
  
  // Only validate routes that have schemas
  if (routeId && routeId !== '/' && routeId !== '/[...catchall]') {
    try {
      const validation = routeInfo(routeId);
      
      // Validate params if validator exists
      if (validation.paramsValidator) {
        const result = validation.paramsValidator['~standard'].validate(event.params);
        if ('issues' in result && result.issues) {
          // Redirect to error page or return error response
          return new Response('Invalid route parameters', { status: 400 });
        }
      }
      
      // Validate search params if validator exists
      if (validation.searchParamsValidator) {
        const searchParams = Object.fromEntries(event.url.searchParams);
        const result = validation.searchParamsValidator['~standard'].validate(searchParams);
        if ('issues' in result && result.issues) {
          console.warn('Invalid search parameters:', result.issues);
          // Could clean up search params or redirect
        }
      }
    } catch (error) {
      console.error('Route validation error:', error);
    }
  }
  
  return resolve(event);
};
```

### 4. Testing Utilities

```typescript
// src/lib/test-utils.ts
import { routeInfo, type RouteKeys } from 'skroutes';

export function createRouteValidator<T extends RouteKeys>(routeId: T) {
  const validation = routeInfo(routeId);
  
  return {
    validateParams: (params: unknown) => {
      if (!validation.paramsValidator) {
        throw new Error(`No params validator for route: ${routeId}`);
      }
      
      const result = validation.paramsValidator['~standard'].validate(params);
      if ('issues' in result && result.issues) {
        throw new Error(`Params validation failed: ${result.issues.map(i => i.message).join(', ')}`);
      }
      return result.value;
    },
    
    validateSearchParams: (searchParams: unknown) => {
      if (!validation.searchParamsValidator) {
        throw new Error(`No search params validator for route: ${routeId}`);
      }
      
      const result = validation.searchParamsValidator['~standard'].validate(searchParams);
      if ('issues' in result && result.issues) {
        throw new Error(`Search params validation failed: ${result.issues.map(i => i.message).join(', ')}`);
      }
      return result.value;
    },
    
    // Type-safe test data generators
    createValidParams: (): typeof validation.paramsType => {
      // Return type-safe mock data
      return {} as typeof validation.paramsType;
    },
    
    createValidSearchParams: (): typeof validation.searchParamsType => {
      return {} as typeof validation.searchParamsType;
    }
  };
}

// Usage in tests:
// const validator = createRouteValidator('/users/[id]');
// expect(() => validator.validateParams({ id: 'invalid-uuid' })).toThrow();
```

### 5. Dynamic Route Validation

```typescript
// src/lib/dynamic-validator.ts
import { routeInfo, type RouteKeys } from 'skroutes';

export function validateRouteData(
  routeId: RouteKeys, 
  params: Record<string, string>, 
  searchParams: Record<string, string | string[]>
) {
  const validation = routeInfo(routeId);
  
  const results = {
    params: { valid: true, data: params, errors: [] as string[] },
    searchParams: { valid: true, data: searchParams, errors: [] as string[] }
  };
  
  // Validate params
  if (validation.paramsValidator) {
    const result = validation.paramsValidator['~standard'].validate(params);
    if ('issues' in result && result.issues) {
      results.params.valid = false;
      results.params.errors = result.issues.map(i => i.message);
    } else {
      results.params.data = result.value;
    }
  }
  
  // Validate search params
  if (validation.searchParamsValidator) {
    const result = validation.searchParamsValidator['~standard'].validate(searchParams);
    if ('issues' in result && result.issues) {
      results.searchParams.valid = false;
      results.searchParams.errors = result.issues.map(i => i.message);
    } else {
      results.searchParams.data = result.value;
    }
  }
  
  return results;
}
```

## Benefits of This Approach

### ✅ **Single Source of Truth**
- Page files define schemas once
- Reuse throughout the application
- No duplication of validation logic

### ✅ **Type Safety Everywhere**
- Types flow from schema definitions
- Compile-time checking in all usage locations
- No type drift between route definitions and usage

### ✅ **Flexible Integration**
- Use in middleware, hooks, API routes
- Integration with testing frameworks
- Custom validation workflows

### ✅ **Standards Compliant**
- Works with any Standard Schema library
- Consistent validation patterns
- Future-proof architecture

## Common Patterns

### Pattern 1: Service Layer Validation
```typescript
// src/lib/services/user-service.ts
import { routeInfo, type RouteParams } from 'skroutes';

export class UserService {
  private userValidator = routeInfo('/users/[id]');
  
  async getUser(rawParams: unknown) {
    const params = this.validateUserParams(rawParams);
    return await db.user.findUnique({ where: { id: params.id } });
  }
  
  private validateUserParams(data: unknown): RouteParams<'/users/[id]'> {
    const result = this.userValidator.paramsValidator!['~standard'].validate(data);
    if ('issues' in result && result.issues) {
      throw new ValidationError('Invalid user parameters', result.issues);
    }
    return result.value;
  }
}
```

### Pattern 2: Form Component Validation
```typescript
// src/lib/components/UserForm.svelte
<script lang="ts">
  import { routeInfo, type RouteParams } from 'skroutes';
  
  const userValidator = routeInfo('/users/[id]');
  
  let formData = {};
  let errors: string[] = [];
  
  function validateForm() {
    const result = userValidator.paramsValidator!['~standard'].validate(formData);
    if ('issues' in result && result.issues) {
      errors = result.issues.map(i => i.message);
      return false;
    }
    errors = [];
    return true;
  }
</script>
```

This approach makes your route schemas truly reusable as the single source of truth for validation throughout your entire application.