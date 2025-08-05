import { skRoutes } from './skRoutes.svelte.js';
import {
	clientRouteConfig,
	type RouteKeys,
	type RouteTypeMap,
	type RouteParams,
	type RouteSearchParams,
	pluginOptions
} from './.generated/skroutes-client-config.js';

export type { RouteKeys, RouteTypeMap, RouteParams, RouteSearchParams };

export const { pageInfo, urlGenerator } = skRoutes({
	config: clientRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});
