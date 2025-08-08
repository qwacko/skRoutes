import { skRoutes } from './skRoutes.svelte.js';
import { clientRouteConfig, pluginOptions } from './.generated/skroutes-client-config.js';

export const { pageInfo, urlGenerator } = skRoutes({
	config: clientRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});
