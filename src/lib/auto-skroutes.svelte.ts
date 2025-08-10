import { skRoutes } from './skRoutes.svelte.js';

export const {
	pageInfo,
	urlGenerator,
	loadConfig: clientLoadRouteConfig
} = skRoutes({
	config: async () => (await import('./.generated/skroutes-client-config.js')).clientRouteConfig,
	errorURL: '/error'
});
