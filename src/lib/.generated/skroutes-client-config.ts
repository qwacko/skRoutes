// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
import type { StandardSchemaV1 } from 'skroutes';

import type { RouteConfig } from 'skroutes';

// Import schema definitions from client-side page files only
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';
import { _routeConfig as routeConfig2 } from '../../../src/routes/test-partial/[id]/+page';
import { _routeConfig as routeConfig3 } from '../../../src/routes/test-search-only/+page';

// Type-only imports from server files for better type inference
import type { _routeConfig as serverRouteConfig1000 } from '../../../src/routes/api/users/[id]/+server';
import type { _routeConfig as serverRouteConfig1001 } from '../../../src/routes/products/[id]/+page.server';
import type { _routeConfig as serverRouteConfig1002 } from '../../../src/routes/server/[id]/+page.server';
import type { _routeConfig as serverRouteConfig1003 } from '../../../src/routes/type-test/[id]/+page.server';
import type { _routeConfig as serverRouteConfig1004 } from '../../../src/routes/users/[id]/+page.server';

// Export validation type mapping for each route
export type RouteValidationTypeMap = {
  '/[id]': { paramsValidation: typeof routeConfig0.paramsValidation; searchParamsValidation: typeof routeConfig0.searchParamsValidation };
  '/test-no-validation': { paramsValidation: StandardSchemaV1<any, {}>; searchParamsValidation: StandardSchemaV1<any, {}> };
  '/test-partial/[id]': { paramsValidation: typeof routeConfig2.paramsValidation; searchParamsValidation: StandardSchemaV1<any, {}> };
  '/test-search-only': { paramsValidation: StandardSchemaV1<any, {}>; searchParamsValidation: typeof routeConfig3.searchParamsValidation };
  '/api/users/[id]': { paramsValidation: typeof serverRouteConfig1000.paramsValidation; searchParamsValidation: typeof serverRouteConfig1000.searchParamsValidation };
  '/products/[id]': { paramsValidation: typeof serverRouteConfig1001.paramsValidation; searchParamsValidation: typeof serverRouteConfig1001.searchParamsValidation };
  '/server/[id]': { paramsValidation: typeof serverRouteConfig1002.paramsValidation; searchParamsValidation: typeof serverRouteConfig1002.searchParamsValidation };
  '/type-test/[id]': { paramsValidation: typeof serverRouteConfig1003.paramsValidation; searchParamsValidation: typeof serverRouteConfig1003.searchParamsValidation };
  '/users/[id]': { paramsValidation: typeof serverRouteConfig1004.paramsValidation; searchParamsValidation: typeof serverRouteConfig1004.searchParamsValidation };
  '/': { paramsValidation: StandardSchemaV1<any, {}>; searchParamsValidation: StandardSchemaV1<any, {}> };
  '/error': { paramsValidation: StandardSchemaV1<any, {}>; searchParamsValidation: StandardSchemaV1<any, {}> };
  '/optional/[[slug]]': { paramsValidation: StandardSchemaV1<any, { slug?: string }>; searchParamsValidation: StandardSchemaV1<any, {}> };
  '/store/[id]': { paramsValidation: StandardSchemaV1<any, { id: string }>; searchParamsValidation: StandardSchemaV1<any, {}> }
};

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
} satisfies RouteConfig as unknown as RouteValidationTypeMap;

// Export route keys for type checking
export type RouteKeys = '/[id]' | '/test-no-validation' | '/test-partial/[id]' | '/test-search-only' | '/' | '/api/users/[id]' | '/error' | '/optional/[[slug]]' | '/products/[id]' | '/server/[id]' | '/store/[id]' | '/type-test/[id]' | '/users/[id]';

// Export type mapping for schema inference
export type RouteTypeMap = {
  '/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation> };
  '/test-no-validation': { params: {}; searchParams: {} };
  '/test-partial/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig2.paramsValidation>; searchParams: {} };
  '/test-search-only': { params: {}; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig3.searchParamsValidation> };
  '/api/users/[id]': { params: StandardSchemaV1.InferOutput<typeof serverRouteConfig1000.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof serverRouteConfig1000.searchParamsValidation> };
  '/products/[id]': { params: StandardSchemaV1.InferOutput<typeof serverRouteConfig1001.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof serverRouteConfig1001.searchParamsValidation> };
  '/server/[id]': { params: StandardSchemaV1.InferOutput<typeof serverRouteConfig1002.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof serverRouteConfig1002.searchParamsValidation> };
  '/type-test/[id]': { params: StandardSchemaV1.InferOutput<typeof serverRouteConfig1003.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof serverRouteConfig1003.searchParamsValidation> };
  '/users/[id]': { params: StandardSchemaV1.InferOutput<typeof serverRouteConfig1004.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof serverRouteConfig1004.searchParamsValidation> };
  '/': { params: {}; searchParams: {} };
  '/error': { params: {}; searchParams: {} };
  '/optional/[[slug]]': { params: { slug?: string }; searchParams: {} };
  '/store/[id]': { params: { id: string }; searchParams: {} }
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];


// Export plugin options for reference
export const pluginOptions = {
  "errorURL": "/error"
};
