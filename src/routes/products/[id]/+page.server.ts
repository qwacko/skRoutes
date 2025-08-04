import { serverPageInfo } from '$lib/auto-skroutes.js';
import { z } from 'zod';
import type { RouteConfig, RouteConfigDefinition } from '$lib/route-config-types.js';

// Define schemas with full type inference
const paramsSchema = z.object({
  id: z.string().regex(/^[A-Z0-9]{8}$/, 'Product ID must be 8 uppercase alphanumeric characters')
});

const searchParamsSchema = z.object({
  color: z.string().optional(),
  size: z.enum(['S', 'M', 'L', 'XL']).optional(),
  inStock: z.coerce.boolean().default(true),
  page: z.coerce.number().positive().default(1)
});

// New unified route configuration with proper type safety
export const _routeConfig = {
  params: paramsSchema,
  searchParams: searchParamsSchema,
  
  // TypeScript now knows the exact types for error handler returns!
  onParamsError: (error, rawParams) => {
    console.error('Product params error:', {
      error: error.issues, // StandardSchemaV1.Failure is properly typed
      params: rawParams,
      timestamp: new Date().toISOString()
    });
    
    // TypeScript ensures this matches the schema output type: { id: string }
    // return { params: { id: 'DEFAULT123' } }; // This would be type-safe
    
    // Or redirect instead
    return { redirect: '/products' };
  },
  
  onSearchParamsError: (error, rawSearchParams) => {
    console.warn('Invalid search params, sanitizing:', error.issues);
    
    // TypeScript ensures this matches the schema output type:
    // { color?: string, size?: 'S'|'M'|'L'|'XL', inStock: boolean, page: number }
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
    tags: ['ecommerce', 'product']
  }
} satisfies RouteConfigDefinition;

export const load = async (data) => {
  const { current: urlData } = serverPageInfo('/server/[id]', data);
  
  // Now fully typed with proper inference from the schemas above
  const productId = urlData.params.id;     // string (with regex validation)
  const color = urlData.searchParams.color; // string | undefined
  const size = urlData.searchParams.size;   // 'S' | 'M' | 'L' | 'XL' | undefined
  const inStock = urlData.searchParams.inStock; // boolean
  const page = urlData.searchParams.page;   // number
  
  return {
    productId,
    filters: { color, size, inStock, page }
  };
};