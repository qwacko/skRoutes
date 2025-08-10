import { skRoutesUniversal } from './skRoutes-universal';

export const { universalPageInfo, loadConfig: universalLoadConfig } = skRoutesUniversal({
	errorURL: '/',
	config: async () => (await import('./.generated/skroutes-client-config.js')).clientRouteConfig
});
