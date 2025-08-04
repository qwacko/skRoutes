import { skRoutes } from './skRoutes-v2.js';
import { routeConfig, type RouteKeys, type RouteTypeMap, pluginOptions } from './.generated/skroutes-config.js';

export type { RouteKeys, RouteTypeMap };

export function createAutoSkRoutes(
  options?: {
    config?: Record<string, any>;
    errorURL?: string;
  }
) {
  const finalConfig = {
    ...routeConfig,
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

export function serverPageInfo<Address extends RouteKeys>(
  routeId: Address,
  data: {
    params: Record<string, string>;
    url: { search: string };
    route: { id: Address };
  }
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
  return defaultInstance.serverPageInfo(routeId, data) as any;
}

export function pageInfoStore<Address extends RouteKeys>(config: {
  routeId: Address;
  pageInfo: import('svelte/store').Readable<{
    params: Record<string, string>;
    url: { search: string };
  }>;
  updateDelay?: number;
  onUpdate: (newUrl: string) => unknown;
}) {
  return defaultInstance.pageInfoStore(config);
}
