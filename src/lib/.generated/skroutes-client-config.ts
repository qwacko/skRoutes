// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
import type { StandardSchemaV1 } from 'skroutes';


// Import schema definitions from client-side page files only
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';
import { _routeConfig as routeConfig1 } from '../../../src/routes/test-no-validation/+page';
import { _routeConfig as routeConfig2 } from '../../../src/routes/test-partial/[id]/+page';
import { _routeConfig as routeConfig3 } from '../../../src/routes/test-search-only/+page';

export const clientRouteConfig = {
  '/[id]': {
          paramsValidation: routeConfig0.paramsValidation,
          searchParamsValidation: routeConfig0.searchParamsValidation,
        },
  '/test-no-validation': {
          paramsValidation: undefined,
          searchParamsValidation: undefined,
        },
  '/test-partial/[id]': {
          paramsValidation: routeConfig2.paramsValidation,
          searchParamsValidation: undefined,
        },
  '/test-search-only': {
          paramsValidation: undefined,
          searchParamsValidation: routeConfig3.searchParamsValidation,
        },
  '/': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/api/users/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/error': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/optional/[[slug]]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            
            result.slug = v.slug ? String(v.slug) : undefined;
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/products/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/server/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/store/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/type-test/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        },
  '/users/[id]': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => {
            if (!v || typeof v !== 'object') return { value: {} };
            const result: Record<string, string | undefined> = {};
            result.id = String(v.id || '');
            
            return { value: result };
          }
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: v || {} })
        }
      },
        }
} as const;

// Export route keys for type checking
export type RouteKeys = '/[id]' | '/test-no-validation' | '/test-partial/[id]' | '/test-search-only' | '/' | '/api/users/[id]' | '/error' | '/optional/[[slug]]' | '/products/[id]' | '/server/[id]' | '/store/[id]' | '/type-test/[id]' | '/users/[id]';

// Export type mapping for schema inference
export type RouteTypeMap = {
  '/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation> };
  '/test-no-validation': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/test-partial/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig2.paramsValidation>; searchParams: Record<string, unknown> };
  '/test-search-only': { params: Record<string, string>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig3.searchParamsValidation> };
  '/': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/api/users/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
  '/error': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/optional/[[slug]]': { params: { slug?: string }; searchParams: Record<string, unknown> };
  '/products/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
  '/server/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
  '/store/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
  '/type-test/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
  '/users/[id]': { params: { id: string }; searchParams: Record<string, unknown> }
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];


// Export plugin options for reference
export const pluginOptions = {
  "errorURL": "/error"
};
