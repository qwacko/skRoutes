// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
import type { StandardSchemaV1 } from 'skroutes';


// Import schema definitions from client-side page files only
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';
import { _routeConfig as routeConfig2 } from '../../../src/routes/test-partial/[id]/+page';
import { _routeConfig as routeConfig3 } from '../../../src/routes/test-search-only/+page';

export const clientRouteConfig = {
  '/[id]': {
          paramsValidation: routeConfig0.paramsValidation,
          searchParamsValidation: routeConfig0.searchParamsValidation,
        },
  '/test-no-validation': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
        },
  '/test-partial/[id]': {
          paramsValidation: routeConfig2.paramsValidation,
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
        },
  '/test-search-only': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
          searchParamsValidation: routeConfig3.searchParamsValidation,
        },
  '/': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
        }
      },
        },
  '/error': {
          paramsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
        }
      },
          searchParamsValidation: {
        '~standard': {
          version: 1,
          vendor: 'skroutes',
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
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
          validate: (v: any) => ({ value: {} })
        }
      },
        }
} as const;

// Export route keys for type checking
export type RouteKeys = '/[id]' | '/test-no-validation' | '/test-partial/[id]' | '/test-search-only' | '/' | '/api/users/[id]' | '/error' | '/optional/[[slug]]' | '/products/[id]' | '/server/[id]' | '/store/[id]' | '/type-test/[id]' | '/users/[id]';

// Export type mapping for schema inference
export type RouteTypeMap = {
  '/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation> };
  '/test-no-validation': { params: {}; searchParams: {} };
  '/test-partial/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig2.paramsValidation>; searchParams: {} };
  '/test-search-only': { params: {}; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig3.searchParamsValidation> };
  '/': { params: {}; searchParams: {} };
  '/api/users/[id]': { params: { id: string }; searchParams: {} };
  '/error': { params: {}; searchParams: {} };
  '/optional/[[slug]]': { params: { slug?: string }; searchParams: {} };
  '/products/[id]': { params: { id: string }; searchParams: {} };
  '/server/[id]': { params: { id: string }; searchParams: {} };
  '/store/[id]': { params: { id: string }; searchParams: {} };
  '/type-test/[id]': { params: { id: string }; searchParams: {} };
  '/users/[id]': { params: { id: string }; searchParams: {} }
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];


// Export plugin options for reference
export const pluginOptions = {
  "errorURL": "/error"
};
