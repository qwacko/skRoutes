import { skRoutesServer } from './skRoutes-server.js';
import { serverRouteConfig, pluginOptions } from './.generated/skroutes-server-config.js';

export const { urlGeneratorServer, serverPageInfo } = skRoutesServer({
	config: serverRouteConfig,
	errorURL: pluginOptions.errorURL || '/error'
});
