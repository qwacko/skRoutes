import { skRoutes, type RouteConfig } from './skRoutes.svelte.js';
import {
	clientRouteConfig,
	type RouteKeys,
	type RouteTypeMap,
	type RouteParams,
	type RouteSearchParams,
	pluginOptions
} from './.generated/skroutes-client-config.js';

export type { RouteKeys, RouteTypeMap, RouteParams, RouteSearchParams };

const { pageInfo: _pageInfo, urlGenerator } = skRoutes({
	config: clientRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});

// Type-safe wrapper that uses the explicit RouteTypeMap instead of inferring from runtime config
export const pageInfo = <Address extends RouteKeys>(
	routeId: Address,
	pageInfo: () => { params: Record<string, string>; url: { search: string } },
	config?: {
		updateDelay?: number;
		onUpdate?: (newUrl: string) => unknown;
		updateAction?: 'goto' | 'nil';
		debug?: boolean;
	}
) => {
	// Get the original pageInfo result
	const original = _pageInfo(routeId, pageInfo, config);

	// Return the same object but with corrected types based on RouteTypeMap
	return {
		...original,
		current: {
			get params() {
				return original.current.params as RouteTypeMap[Address]['params'];
			},
			set params(value: RouteTypeMap[Address]['params']) {
				original.current.params = value as any;
			},
			get searchParams() {
				return original.current.searchParams as RouteTypeMap[Address]['searchParams'];
			},
			set searchParams(value: RouteTypeMap[Address]['searchParams']) {
				original.current.searchParams = value as any;
			}
		},
		updateParams: (updates: {
			params?: Partial<RouteTypeMap[Address]['params']>;
			searchParams?: Partial<RouteTypeMap[Address]['searchParams']>;
		}) => original.updateParams(updates as any)
	} as const;
};

export { urlGenerator };
