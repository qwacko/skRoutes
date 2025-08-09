import {
	getUrlParams,
	createUrlGenerator,
	createUpdateParams,
	type RouteConfig,
	type SingleRouteConfig,
	type ParamsType,
	type SearchParamsType
} from './helpers.js';

/**
 * Server-side route configuration interface.
 * Extends the base RouteConfig for use in server-side contexts.
 */
export interface ServerRouteConfig extends RouteConfig {}

/**
 * Single server-side route configuration interface.
 * Represents the configuration for a single route in server-side contexts.
 */
export interface SingleServerRouteConfig extends SingleRouteConfig {}

/**
 * Creates a server-side URL generation and route information system for SvelteKit applications.
 *
 * This function provides server-side utilities for generating URLs with validated parameters
 * and accessing route information in server contexts like +page.server.ts files. Unlike the
 * client-side version, this doesn't include reactive state management or navigation features.
 *
 * @template Config - The route configuration type extending ServerRouteConfig
 * @param options - Configuration options for the server-side skRoutes system
 * @param options.errorURL - URL to redirect to when validation fails (receives error as query param)
 * @param options.config - Route configuration object mapping addresses to validation functions
 *
 * @returns Object containing urlGeneratorServer and serverPageInfo functions
 *
 * @example
 * ```typescript
 * // In a +page.server.ts file
 * const { urlGeneratorServer, serverPageInfo } = skRoutesServer({
 *   errorURL: '/error',
 *   config: {
 *     '/users/[id]': {
 *       paramsValidation: z.object({ id: z.string() }).parse,
 *       searchParamsValidation: z.object({ tab: z.string().optional() }).parse
 *     }
 *   }
 * });
 *
 * export async function load({ params, url, route }) {
 *   const route = serverPageInfo('/users/[id]', { params, url, route });
 *
 *   // Access current parameters
 *   console.log(route.current.params.id);
 *
 *   // Generate URLs for redirects or links
 *   const profileUrl = route.updateParams({
 *     searchParams: { tab: 'profile' }
 *   });
 *
 *   return { route };
 * }
 * ```
 */
export function skRoutesServer<Config extends ServerRouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	/**
	 * Server-side URL generator for configured routes with parameter validation.
	 *
	 * @param input - URL generation parameters
	 * @param input.address - Route address pattern (e.g., '/users/[id]')
	 * @param input.paramsValue - Route parameters object
	 * @param input.searchParamsValue - Search parameters object
	 * @returns Object containing the generated URL and validated parameters
	 */
	const urlGeneratorServer = createUrlGenerator(config, errorURL);

	/**
	 * Creates server-side route information and parameter update utilities for a specific route.
	 *
	 * This function provides server-side route state access and URL generation utilities.
	 * Unlike the client-side version, this doesn't include reactive state or navigation features,
	 * making it suitable for use in server contexts like load functions.
	 *
	 * @template Address - The specific route address from the config
	 * @param routeId - The route address pattern (must match a key in config)
	 * @param data - Server-side page data from SvelteKit
	 * @param data.params - Current route parameters
	 * @param data.url - Current URL object with search string
	 * @param data.route - Current route information
	 *
	 * @returns Object with current state and update function
	 *
	 * @example
	 * ```typescript
	 * // In a +page.server.ts file
	 * export async function load({ params, url, route }) {
	 *   const routeInfo = serverPageInfo('/users/[id]', { params, url, route });
	 *
	 *   // Access current parameters
	 *   const userId = routeInfo.current.params.id;
	 *
	 *   // Generate new URLs for redirects
	 *   const redirectUrl = routeInfo.updateParams({
	 *     searchParams: { error: 'not-found' }
	 *   });
	 *
	 *   return { userId, redirectUrl: redirectUrl.url };
	 * }
	 * ```
	 */
	const serverPageInfo = <Address extends keyof Config>(
		routeId: Address,
		data: {
			params: Record<string, string>;
			url: { search: string };
			route: { id: string };
		}
	) => {
		const current = urlGeneratorServer({
			address: routeId,
			paramsValue: data.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(data.url.search) as SearchParamsType<Config, Address>
		});

		/**
		 * Updates route parameters and returns the new URL without side effects.
		 *
		 * This function generates new URLs with updated parameters, suitable for
		 * server-side redirects or link generation.
		 *
		 * @param options - Parameter update options
		 * @param options.params - Partial route parameters to update
		 * @param options.searchParams - Partial search parameters to update
		 * @returns Object containing the new URL and validated parameters
		 */
		const updateParams = createUpdateParams(
			routeId as string,
			data.params,
			data.url.search,
			urlGeneratorServer
		);

		return {
			/**
			 * Current route state containing validated parameters and search parameters.
			 */
			current,
			updateParams
		};
	};

	return { urlGeneratorServer, serverPageInfo };
}
