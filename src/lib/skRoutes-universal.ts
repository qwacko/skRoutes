import {
	getUrlParams,
	createUrlGenerator,
	createUpdateParams,
	type RouteConfig,
	type SingleRouteConfig,
	type ParamsType,
	type SearchParamsType,
	type ValidatedParamsType,
	type ValidatedSearchParamsType
} from './helpers.js';

/**
 * Universal route configuration interface.
 * Can be used in both server and client contexts.
 */
export interface UniversalRouteConfig extends RouteConfig {}

/**
 * Single universal route configuration interface.
 * Represents the configuration for a single route in universal contexts.
 */
export interface SingleUniversalRouteConfig extends SingleRouteConfig {}

/**
 * Creates a universal URL generation and route information system for SvelteKit applications.
 *
 * This function provides utilities that work in both server-side (SSR) and client-side contexts,
 * making it suitable for universal load functions (+page.ts) that run on both server and client.
 * Unlike the server-only or client-only versions, this doesn't include reactive state management
 * or navigation features, focusing on pure URL generation and parameter handling.
 *
 * @template Config - The route configuration type extending UniversalRouteConfig
 * @param options - Configuration options for the universal skRoutes system
 * @param options.errorURL - URL to redirect to when validation fails (receives error as query param)
 * @param options.config - Route configuration object mapping addresses to validation functions
 *
 * @returns Object containing urlGenerator and universalPageInfo functions
 *
 * @example
 * ```typescript
 * // In a +page.ts file (universal load function)
 * import { skRoutesUniversal } from '$lib/skRoutes-universal';
 *
 * const { urlGenerator, universalPageInfo } = skRoutesUniversal({
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
 *   const pageInfo = universalPageInfo('/users/[id]', { params, url, route });
 *
 *   // Access current parameters
 *   console.log(pageInfo.current.params.id);
 *
 *   // Generate URLs for redirects or links
 *   const profileUrl = pageInfo.updateParams({
 *     searchParams: { tab: 'profile' }
 *   });
 *
 *   return {
 *     pageInfo: {
 *       current: pageInfo.current,
 *       updateParams: pageInfo.updateParams
 *     }
 *   };
 * }
 * ```
 */
export function skRoutesUniversal<Config extends UniversalRouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	/**
	 * Universal URL generator for configured routes with parameter validation.
	 * Works in both server and client contexts.
	 *
	 * @param input - URL generation parameters
	 * @param input.address - Route address pattern (e.g., '/users/[id]')
	 * @param input.paramsValue - Route parameters object
	 * @param input.searchParamsValue - Search parameters object
	 * @returns Object containing the generated URL and validated parameters
	 */
	const urlGenerator = createUrlGenerator(config, errorURL);

	/**
	 * Creates universal route information and parameter update utilities for a specific route.
	 *
	 * This function provides route state access and URL generation utilities that work
	 * in both server-side and client-side contexts. It's designed for universal load
	 * functions (+page.ts) that need to run on both server and client without reactive
	 * state management or navigation features.
	 *
	 * @template Address - The specific route address from the config
	 * @param routeId - The route address pattern (must match a key in config)
	 * @param data - Universal page data from SvelteKit
	 * @param data.params - Current route parameters
	 * @param data.url - Current URL object with search string
	 * @param data.route - Current route information
	 *
	 * @returns Object with current state and update function
	 *
	 * @example
	 * ```typescript
	 * // In a +page.ts file (universal load function)
	 * export async function load({ params, url, route }) {
	 *   const pageInfo = universalPageInfo('/users/[id]', { params, url, route });
	 *
	 *   // Access current parameters
	 *   const userId = pageInfo.current.params.id;
	 *   const currentTab = pageInfo.current.searchParams.tab;
	 *
	 *   // Generate new URLs for redirects or links
	 *   const redirectUrl = pageInfo.updateParams({
	 *     searchParams: { error: 'not-found' }
	 *   });
	 *
	 *   // Can be passed to client-side components
	 *   return {
	 *     userId,
	 *     currentTab,
	 *     redirectUrl: redirectUrl.url,
	 *     pageInfo: {
	 *       current: pageInfo.current,
	 *       updateParams: pageInfo.updateParams
	 *     }
	 *   };
	 * }
	 * ```
	 */
	const universalPageInfo = <Address extends keyof Config>(
		routeId: Address,
		data: {
			params: Record<string, string>;
			url: { search: string };
			route: { id: string };
		}
	) => {
		const current = urlGenerator({
			address: routeId,
			paramsValue: data.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(data.url.search) as SearchParamsType<Config, Address>
		});

		/**
		 * Updates route parameters and returns the new URL without side effects.
		 *
		 * This function generates new URLs with updated parameters. It's suitable for
		 * both server-side redirects and client-side link generation, but doesn't
		 * perform any navigation or state updates automatically.
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
			urlGenerator
		);

		return {
			/**
			 * Current route state containing validated parameters and search parameters.
			 * These are plain objects (not reactive) suitable for both server and client use.
			 */
			current: {
				params: current.params,
				searchParams: current.searchParams,
				url: current.url,
				error: current.error
			},
			updateParams
		};
	};

	return { urlGenerator, universalPageInfo };
}
