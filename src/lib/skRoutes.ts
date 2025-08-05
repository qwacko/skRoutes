import { goto } from '$app/navigation';
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

export type { RouteConfig, UrlGeneratorInput, UrlGeneratorResult };

type RouteUpdateAction = 'goto' | 'nil';

export function skRoutes<Config extends RouteConfig>({
	errorURL,
	config,
	updateAction = 'goto'
}: {
	errorURL: string;
	config: Config;
	updateAction?: RouteUpdateAction;
}) {
	const urlGenerator = createUrlGenerator(config, errorURL);

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

		const state = urlGenerator({
			address: routeId,
			paramsValue: pageInfo.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(pageInfo.url.search) as SearchParamsType<Config, Address>
		});

		// Use a simple object that can be reactive in Svelte 5 context

		const updateParamsHelper = createUpdateParams(
			routeId as string,
			pageInfo.params,
			pageInfo.url.search,
			urlGenerator
		);

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

			state.params = result.params as ValidatedParamsType<Config, Address>;
			state.searchParams = result.searchParams as ValidatedSearchParamsType<Config, Address>;

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
					} else if (usedUpdateAction === 'nil') {
						// Do nothing, just update state
					}
				},
				config.updateDelay ? config.updateDelay * 1000 : 0
			);

			return result;
		};

		return {
			get current() {
				return { params: state.params, searchParams: state.searchParams };
			},
			updateParams,
			updateParamsURLGenerator
		};
	};

	return { urlGenerator, pageInfo };
}
