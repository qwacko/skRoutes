import { skRoutes } from './skRoutes.js';
import { clientRouteConfig, pluginOptions } from './.generated/skroutes-client-config.js';

export const { urlGenerator, pageInfo, pageInfoStore, serverPageInfo } = skRoutes({
	config: clientRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});
