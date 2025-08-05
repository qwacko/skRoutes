import { skRoutes } from './skRoutes.js';
import { 
  clientRouteConfig, 
  type RouteKeys, 
  type RouteTypeMap, 
  type RouteParams,
  type RouteSearchParams,
  pluginOptions 
} from './.generated/skroutes-client-config.js';

export type { RouteKeys, RouteTypeMap, RouteParams, RouteSearchParams };

export function createAutoSkRoutes(
  options?: {
    config?: Record<string, any>;
    errorURL?: string;
  }
) {
  const finalConfig = {
    ...clientRouteConfig,
    ...(options?.config || {})
  };
  
  return skRoutes({
    config: finalConfig,
    errorURL: options?.errorURL || pluginOptions.errorURL || '/error'
  });
}

// Create typed versions of the functions with route key validation and type inference
const defaultInstance = createAutoSkRoutes();

// Wrap the functions to provide type-safe route ID checking and schema type inference
export const urlGenerator = defaultInstance.urlGenerator;

export function pageInfo<Address extends RouteKeys>(
  routeId: Address,
  pageInfo: { params: Record<string, string>; url: { search: string } }
): {
  current: {
    address: Address;
    url: string;
    error: boolean;
    params: RouteTypeMap[Address]['params'];
    searchParams: RouteTypeMap[Address]['searchParams'];
  };
  updateParams: (opts: {
    params?: Partial<RouteTypeMap[Address]['params']>;
    searchParams?: Partial<RouteTypeMap[Address]['searchParams']>;
  }) => any;
} {
  return defaultInstance.pageInfo(routeId, pageInfo) as any;
}

// pageInfoStore has been removed in v2 - use pageInfo with callbacks instead
