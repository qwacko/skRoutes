import { getUrlParams } from './helpers.js';

// Simple server-side pageInfo function that doesn't require generated config
// This avoids circular dependencies while still providing basic functionality
export function serverPageInfo<T = Record<string, string>>(
  routeId: string,
  data: {
    params: Record<string, string>;
    url: { search: string };
    route: { id: string };
  }
): {
  current: {
    address: string;
    url: string;
    error: boolean;
    params: T;
    searchParams: Record<string, unknown>;
  };
  updateParams: (opts: {
    params?: Partial<T>;
    searchParams?: Partial<Record<string, unknown>>;
  }) => any;
} {
  const current = {
    address: routeId,
    url: data.url.search ? `${routeId}?${data.url.search}` : routeId,
    error: false,
    params: data.params as T,
    searchParams: getUrlParams(data.url.search)
  };

  const updateParams = (opts: {
    params?: Partial<T>;
    searchParams?: Partial<Record<string, unknown>>;
  }) => {
    // For server-side, we just return the current state with updates
    // Real URL generation would happen client-side
    return {
      address: routeId,
      url: routeId, // Simplified for server-side
      error: false,
      params: { ...current.params, ...opts.params },
      searchParams: { ...current.searchParams, ...opts.searchParams }
    };
  };

  return { current, updateParams };
}

// For backward compatibility, also export as default
export const serverUrlGenerator = () => {
  throw new Error('serverUrlGenerator requires the full server config. Use the generated server config instead.');
};