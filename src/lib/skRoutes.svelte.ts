import { goto } from '$app/navigation';
import { untrack } from 'svelte';
import {
	getUrlParams,
	createUrlGenerator,
	createUpdateParams,
	type RouteConfig,
	type UrlGeneratorInput,
	type UrlGeneratorResult,
	type ParamsType,
	type SearchParamsType,
	type ValidatedParamsType,
	type ValidatedSearchParamsType
} from './helpers.js';
import { isEqual } from 'lodash-es';

export type { RouteConfig, UrlGeneratorInput, UrlGeneratorResult };

/**
 * Defines how route updates should be handled when parameters change.
 * - 'goto': Navigate to the new URL using SvelteKit's goto function
 * - 'nil': Update state only without navigation
 */
type RouteUpdateAction = 'goto' | 'nil';

/**
 * Creates a typesafe URL generation and state management system for SvelteKit applications.
 *
 * This function provides utilities for generating URLs with validated parameters and managing
 * route state with automatic URL synchronization. It supports both route parameters and
 * search parameters with optional validation using Zod or other validation libraries.
 *
 * @template Config - The route configuration type extending RouteConfig
 * @param options - Configuration options for the skRoutes system
 * @param options.errorURL - URL to redirect to when validation fails (receives error as query param)
 * @param options.config - Route configuration object mapping addresses to validation functions
 * @param options.updateAction - Default action when route parameters change ('goto' | 'nil')
 *
 * @returns Object containing urlGenerator and pageInfo functions
 *
 * @example
 * ```typescript
 * const { urlGenerator, pageInfo } = skRoutes({
 *   errorURL: '/error',
 *   config: {
 *     '/users/[id]': {
 *       paramsValidation: z.object({ id: z.string() }).parse,
 *       searchParamsValidation: z.object({ tab: z.string().optional() }).parse
 *     }
 *   }
 * });
 *
 * // Generate a typesafe URL
 * const userUrl = urlGenerator({
 *   address: '/users/[id]',
 *   paramsValue: { id: '123' },
 *   searchParamsValue: { tab: 'profile' }
 * });
 * ```
 */
export function skRoutes<Config extends RouteConfig>({
	errorURL,
	config,
	updateAction = 'goto'
}: {
	errorURL: string;
	config: Config;
	updateAction?: RouteUpdateAction;
}) {
	/**
	 * Generates typesafe URLs for configured routes with parameter validation.
	 *
	 * @param input - URL generation parameters
	 * @param input.address - Route address pattern (e.g., '/users/[id]')
	 * @param input.paramsValue - Route parameters object
	 * @param input.searchParamsValue - Search parameters object
	 * @returns Object containing the generated URL and validated parameters
	 */
	const urlGenerator = createUrlGenerator(config, errorURL);

	/**
	 * Creates reactive route information and parameter update utilities for a specific route.
	 *
	 * This function provides client-side route state management with automatic URL synchronization.
	 * It returns utilities to access current route parameters and update them with validation.
	 *
	 * @template Address - The specific route address from the config
	 * @param routeId - The route address pattern (must match a key in config)
	 * @param pageInfo - Current page information from SvelteKit
	 * @param pageInfo.params - Current route parameters
	 * @param pageInfo.url - Current URL object with search string
	 * @param config - Optional configuration for updates
	 * @param config.updateDelay - Delay in seconds before URL update (default: 0)
	 * @param config.onUpdate - Callback function called when URL updates
	 * @param config.updateAction - Override default update action for this route
	 *
	 * @returns Object with current state and update functions
	 *
	 * @example
	 * ```typescript
	 * // In a +page.svelte file
	 * export let data;
	 *
	 * const route = pageInfo('/users/[id]', data, {
	 *   updateDelay: 0.5, // 500ms delay
	 *   onUpdate: (url) => console.log('URL updated:', url)
	 * });
	 *
	 * // Access current parameters
	 * console.log(route.current.params.id);
	 *
	 * // Update parameters (triggers URL update)
	 * route.updateParams({
	 *   searchParams: { tab: 'settings' }
	 * });
	 * ```
	 */
	const pageInfo = <Address extends keyof Config>(
		routeId: Address,
		pageInfo: { params: Record<string, string>; url: { search: string } },
		config: {
			updateDelay?: number;
			onUpdate?: (newUrl: string) => unknown;
			updateAction?: RouteUpdateAction;
		} = {}
	) => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const usedUpdateAction = config.updateAction || updateAction;

		// Initialize reactive state from current pageInfo
		const initialState = urlGenerator({
			address: routeId,
			paramsValue: pageInfo.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(pageInfo.url.search) as SearchParamsType<Config, Address>
		});

		// Fully reactive state that can be bound to
		let currentParams = $state<ValidatedParamsType<Config, Address>>(initialState.params);
		let currentSearchParams = $state<ValidatedSearchParamsType<Config, Address>>(initialState.searchParams);

		// Track previous values to detect changes
		let previousParams = $state<ValidatedParamsType<Config, Address>>(initialState.params);
		let previousSearchParams = $state<ValidatedSearchParamsType<Config, Address>>(initialState.searchParams);

		// Sync with external pageInfo changes
		$effect(() => {
			const currentFromPage = urlGenerator({
				address: routeId,
				paramsValue: pageInfo.params as ParamsType<Config, Address>,
				searchParamsValue: getUrlParams(pageInfo.url.search) as SearchParamsType<Config, Address>
			});
			
			// Update reactive state when pageInfo changes externally (but not from our own updates)
			if (!isEqual(currentParams, currentFromPage.params) && isEqual(currentParams, previousParams)) {
				currentParams = currentFromPage.params;
				previousParams = currentFromPage.params;
			}
			if (!isEqual(currentSearchParams, currentFromPage.searchParams) && isEqual(currentSearchParams, previousSearchParams)) {
				currentSearchParams = currentFromPage.searchParams;
				previousSearchParams = currentFromPage.searchParams;
			}
		});

		// Watch for changes in reactive state and trigger URL updates
		$effect(() => {
			// Check if params or searchParams have changed from user interaction/binding
			if (!isEqual(currentParams, previousParams) || !isEqual(currentSearchParams, previousSearchParams)) {
				untrack(() => {
					// Generate new URL with updated state
					const result = urlGenerator({
						address: routeId,
						paramsValue: currentParams as ParamsType<Config, Address>,
						searchParamsValue: currentSearchParams as SearchParamsType<Config, Address>
					});

					// Update previous values
					previousParams = currentParams;
					previousSearchParams = currentSearchParams;

					// Trigger URL update with delay
					if (timeoutId) {
						clearTimeout(timeoutId);
					}
					timeoutId = setTimeout(
						() => {
							if (config.onUpdate) {
								config.onUpdate(result.url);
							}
							if (usedUpdateAction === 'goto') {
								goto(result.url, { noScroll: true, keepFocus: true });
							}
						},
						config.updateDelay ? config.updateDelay * 1000 : 0
					);
				});
			}
		});

		const updateParamsHelper = createUpdateParams(
			routeId as string,
			pageInfo.params,
			pageInfo.url.search,
			urlGenerator
		);

		/**
		 * Updates route parameters and returns the new URL without triggering navigation.
		 *
		 * This function is useful when you need to generate URLs for links or other purposes
		 * without updating the current route state or triggering navigation.
		 *
		 * @param options - Parameter update options
		 * @param options.params - Partial route parameters to update
		 * @param options.searchParams - Partial search parameters to update
		 * @returns Object containing the new URL and validated parameters
		 */
		const updateParamsURLGenerator = ({
			params: newParams = {},
			searchParams: newSearchParams = {}
		}: {
			params?: Partial<ValidatedParamsType<Config, Address>>;
			searchParams?: Partial<ValidatedSearchParamsType<Config, Address>>;
		}) => {
			return updateParamsHelper({
				params: newParams as Partial<Record<string, string>>,
				searchParams: newSearchParams as Partial<Record<string, unknown>>
			});
		};

		/**
		 * Updates route parameters and triggers URL navigation/state update.
		 *
		 * This function updates the current route state and triggers the configured
		 * update action (navigation or state-only update) after the specified delay.
		 *
		 * @param options - Parameter update options
		 * @param options.params - Partial route parameters to update
		 * @param options.searchParams - Partial search parameters to update
		 * @returns Object containing the new URL and validated parameters
		 */
		const updateParams = ({
			params: newParams = {},
			searchParams: newSearchParams = {}
		}: {
			params?: Partial<ValidatedParamsType<Config, Address>>;
			searchParams?: Partial<ValidatedSearchParamsType<Config, Address>>;
		}) => {
			const result = updateParamsHelper({
				params: newParams as Partial<Record<string, string>>,
				searchParams: newSearchParams as Partial<Record<string, unknown>>
			});

			// Update reactive state - this will trigger the $effect above
			currentParams = result.params as ValidatedParamsType<Config, Address>;
			currentSearchParams = result.searchParams as ValidatedSearchParamsType<Config, Address>;

			return result;
		};

		return {
			/**
			 * Current route state containing validated parameters and search parameters.
			 * These are fully reactive $state that can be bound to in templates.
			 */
			current: {
				get params() {
					return currentParams;
				},
				set params(value: ValidatedParamsType<Config, Address>) {
					currentParams = value;
				},
				get searchParams() {
					return currentSearchParams;
				},
				set searchParams(value: ValidatedSearchParamsType<Config, Address>) {
					currentSearchParams = value;
				}
			},
			updateParams,
			updateParamsURLGenerator
		};
	};

	return { urlGenerator, pageInfo };
}
