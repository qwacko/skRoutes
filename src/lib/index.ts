// Reexport your entry components here
export { skRoutes } from './skRoutes.js';
export type { RouteConfig } from './skRoutes.js';

// New v2 implementation with Standard Schema support
export { skRoutes as skRoutesV2 } from './skRoutes-v2.js';
export { createAutoSkRoutes, urlGenerator, pageInfo, serverPageInfo, pageInfoStore } from './auto-skroutes.js';
export { skRoutesPlugin } from './vite-plugin-skroutes.js';
