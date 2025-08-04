import { z } from 'zod';
import type { RouteConfig } from '$lib/route-config-types.js';

// Define schemas explicitly
const paramsSchema = z.object({
  id: z.string().uuid()
});

const searchParamsSchema = z.object({
  tab: z.enum(['profile', 'settings', 'billing']).optional(),
  page: z.coerce.number().positive().default(1),
  sort: z.enum(['name', 'date', 'activity']).default('name')
});

// Test the type inference
export const _routeConfig = {
  params: paramsSchema,
  searchParams: searchParamsSchema,
  
  onParamsError: (error, rawParams) => {
    // This should now be properly typed
    return {
      params: {
        id: '00000000-0000-0000-0000-000000000000'  // ✅ Should be valid
        // id: 123  // ❌ Should be type error - uncomment to test
        // invalidField: 'test'  // ❌ Should be type error - uncomment to test
      }
    };
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    // This should now be properly typed  
    return {
      searchParams: {
        tab: 'profile' as const,  // ✅ Should be valid
        page: 1,                  // ✅ Should be valid
        sort: 'name' as const     // ✅ Should be valid
        // tab: 'invalid'         // ❌ Should be type error - uncomment to test
        // invalidField: 'test'   // ❌ Should be type error - uncomment to test
      }
    };
  }
} satisfies RouteConfig<typeof paramsSchema, typeof searchParamsSchema>;

// Test that the types are properly inferred
type ParamsType = typeof _routeConfig extends RouteConfig<infer P, any> 
  ? P extends z.ZodType<infer Output> ? Output : never 
  : never;

type SearchParamsType = typeof _routeConfig extends RouteConfig<any, infer S>
  ? S extends z.ZodType<infer Output> ? Output : never
  : never;

// Verify the types are correct
const _typeCheck: ParamsType = { id: 'test-uuid' };
const _typeCheck2: SearchParamsType = { tab: 'profile', page: 1, sort: 'name' };

export const load = (data: any) => {
  return {
    message: 'Type test route - check TypeScript errors in this file'
  };
};