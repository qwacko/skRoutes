import { skRoutesServer } from './skRoutes-server.js';

export const {
	urlGeneratorServer,
	serverPageInfo,
	loadConfig: serverLoadRouteConfig
} = skRoutesServer({
	config: async () => (await import('./.generated/skroutes-server-config.js')).serverRouteConfig,
	errorURL: '/error'
});
