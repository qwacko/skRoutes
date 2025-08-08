import { skRoutesUniversal } from './skRoutes-universal';
import { clientRouteConfig } from './.generated/skroutes-client-config';

export const { universalPageInfo } = skRoutesUniversal({
	errorURL: '/',
	config: clientRouteConfig
});
