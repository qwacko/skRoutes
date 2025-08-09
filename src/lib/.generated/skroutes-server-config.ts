// Auto-generated server-side config by skroutes-plugin
// WARNING: This file imports from server files and should only be used server-side
import type { StandardSchemaV1 } from '../index.js';


// Import schema definitions from both client and server files
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';
import { _routeConfig as routeConfig1 } from '../../../src/routes/api/users/[id]/+server';
import { _routeConfig as routeConfig2 } from '../../../src/routes/products/[id]/+page.server';
import { _routeConfig as routeConfig3 } from '../../../src/routes/server/[id]/+page.server';
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
          paramsValidation: routeConfig5.paramsValidation,
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
          searchParamsValidation: routeConfig6.searchParamsValidation,
        },
  '/type-test/[id]': {
          paramsValidation: routeConfig7.paramsValidation,
          searchParamsValidation: routeConfig7.searchParamsValidation,
        },
  '/users/[id]': {
          paramsValidation: routeConfig8.paramsValidation,
          searchParamsValidation: routeConfig8.searchParamsValidation,
        }
} as const;

// Export complete route keys for type checking (server has full visibility)
export type ServerRouteKeys = '/[id]' | '/api/users/[id]' | '/products/[id]' | '/server/[id]' | '/test-no-validation' | '/test-partial/[id]' | '/test-search-only' | '/type-test/[id]' | '/users/[id]';

// Export complete type mapping for schema inference (server has full visibility)
export type ServerRouteTypeMap = {
  '/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation> };
  '/api/users/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig1.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig1.searchParamsValidation> };
  '/products/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig2.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig2.searchParamsValidation> };
  '/server/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig3.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig3.searchParamsValidation> };
  '/test-no-validation': { params: {}; searchParams: {} };
  '/test-partial/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig5.paramsValidation>; searchParams: {} };
  '/test-search-only': { params: {}; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig6.searchParamsValidation> };
  '/type-test/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig7.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig7.searchParamsValidation> };
  '/users/[id]': { params: StandardSchemaV1.InferOutput<typeof routeConfig8.paramsValidation>; searchParams: StandardSchemaV1.InferOutput<typeof routeConfig8.searchParamsValidation> }
};

// Convenience type aliases for accessing route param/search param types
export type ServerRouteParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['params'];
export type ServerRouteSearchParams<T extends ServerRouteKeys> = ServerRouteTypeMap[T]['searchParams'];

// Export plugin options for reference
export const pluginOptions = {
  "errorURL": "/error"
};
