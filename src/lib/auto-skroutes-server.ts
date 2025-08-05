import { skRoutesServer } from './skRoutes-server.js';
import { serverRouteConfig, pluginOptions } from './.generated/skroutes-server-config.js';

const { urlGenerator, serverPageInfo } = skRoutesServer({
	config: serverRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});

export { urlGenerator as serverUrlGenerator, serverPageInfo };