// Auto-generated server-side config by skroutes-plugin
// WARNING: This file imports from server files and should only be used server-side
import type { StandardSchemaV1 } from 'skroutes';


// Import schema definitions from both client and server files
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';
import { _routeConfig as routeConfig1 } from '../../../src/routes/api/users/[id]/+server';
import { _routeConfig as routeConfig2 } from '../../../src/routes/products/[id]/+page.server';
import { _routeConfig as routeConfig3 } from '../../../src/routes/server/[id]/+page.server';
import { _routeConfig as routeConfig4 } from '../../../src/routes/test-no-validation/+page';
import { _routeConfig as routeConfig5 } from '../../../src/routes/test-partial/[id]/+page';
import { _routeConfig as routeConfig6 } from '../../../src/routes/test-search-only/+page';
import { _routeConfig as routeConfig7 } from '../../../src/routes/type-test/[id]/+page.server';
import { _routeConfig as routeConfig8 } from '../../../src/routes/users/[id]/+page.server';

export const serverRouteConfig = {
  '/[id]': {
          paramsValidation: routeConfig0.paramsValidation,
          searchParamsValidation: routeConfig0.searchParamsValidation,
        },
  '/api/users/[id]': {
          paramsValidation: routeConfig1.paramsValidation,
          searchParamsValidation: routeConfig1.searchParamsValidation,
        },
  '/products/[id]': {
          paramsValidation: routeConfig2.paramsValidation,
          searchParamsValidation: routeConfig2.searchParamsValidation,
        },
  '/server/[id]': {
          paramsValidation: routeConfig3.paramsValidation,
          searchParamsValidation: routeConfig3.searchParamsValidation,
        },
  '/test-no-validation': {
          paramsValidation: undefined,
          searchParamsValidation: undefined,
        },
  '/test-partial/[id]': {
          paramsValidation: routeConfig5.paramsValidation,
          searchParamsValidation: undefined,
        },
  '/test-search-only': {
          paramsValidation: undefined,
          searchParamsValidation: routeConfig6.searchParamsValidation,
        },
  '/type-test/[id]': {
          paramsValidation: routeConfig7.paramsValidation,
          searchParamsValidation: routeConfig7.searchParamsValidation,
        },
  '/users/[id]': {
          paramsValidation: routeConfig8.paramsValidation,
          searchParamsValidation: routeConfig8.searchParamsValidation,
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
        }
} as const;

// Export complete route keys for type checking (server has full visibility)
export type ServerRouteKeys = '/[id]' | '/api/users/[id]' | '/products/[id]' | '/server/[id]' | '/test-no-validation' | '/test-partial/[id]' | '/test-search-only' | '/type-test/[id]' | '/users/[id]' | '/' | '/error' | '/optional/[[slug]]' | '/store/[id]';

// Export complete type mapping for schema inference (server has full visibility)
export type ServerRouteTypeMap = {
  '/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation> };
  '/api/users/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig1.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig1.searchParamsValidation> };
  '/products/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig2.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig2.searchParamsValidation> };
  '/server/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig3.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig3.searchParamsValidation> };
  '/test-no-validation': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/test-partial/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig5.paramsValidation>; searchParams: Record<string, unknown> };
  '/test-search-only': { params: Record<string, string>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig6.searchParamsValidation> };
  '/type-test/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig7.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig7.searchParamsValidation> };
  '/users/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig8.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig8.searchParamsValidation> };
  '/': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/error': { params: Record<string, string>; searchParams: Record<string, unknown> };
  '/optional/[[slug]]': { params: { slug?: string }; searchParams: Record<string, unknown> };
  '/store/[id]': { params: { id: string }; searchParams: Record<string, unknown> }
};

// Convenience type aliases for accessing route param/search param types
export type ServerRouteParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['params'];
export type ServerRouteSearchParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['searchParams'];

// Export plugin options for reference
export const pluginOptions = {
  "errorURL": "/error"
};
