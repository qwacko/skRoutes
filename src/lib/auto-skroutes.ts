import { skRoutes } from './skRoutes';
import {
	clientRouteConfig,
	type RouteKeys,
	type RouteTypeMap,
	type RouteParams,
	type RouteSearchParams,
	pluginOptions
} from './.generated/skroutes-client-config';

export type { RouteKeys, RouteTypeMap, RouteParams, RouteSearchParams };

export const { urlGenerator, pageInfo } = skRoutes({
	config: clientRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});
