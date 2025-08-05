import { 
	customMerge, 
	getUrlParams, 
	createUrlGenerator,
	type RouteConfig,
	type UrlGeneratorInput,
	type UrlGeneratorResult
} from './helpers.js';

export type { RouteConfig, UrlGeneratorInput, UrlGeneratorResult };

// Type helpers to extract param and search param types from config
type ParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['paramsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<infer T, unknown> ? T : Record<string, string>;

type SearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<infer T, unknown> ? T : Record<string, unknown>;

type ValidatedParamsType<Config extends RouteConfig, Address extends keyof Config> = 
	Config[Address]['paramsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<unknown, infer R> ? R : Record<string, string>;

type ValidatedSearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<unknown, infer R> ? R : Record<string, unknown>;

export function skRoutes<Config extends RouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	const urlGenerator = createUrlGenerator(config, errorURL);

	const pageInfo = <Address extends keyof Config>(
		routeId: Address,
		pageInfo: { params: Record<string, string>; url: { search: string } },
		updateDelay = 1000,
		onUpdate?: (newUrl: string) => unknown
	) => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		
		const current = urlGenerator({
			address: routeId,
			paramsValue: pageInfo.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(pageInfo.url.search) as SearchParamsType<Config, Address>
		});

		// Use a simple object that can be reactive in Svelte 5 context
		const state = {
			params: current.params,
			searchParams: current.searchParams
		};

		const updateParams = ({
			params: newParams = {},
			searchParams: newSearchParams = {}
		}: {
			params?: Partial<ValidatedParamsType<Config, Address>>;
			searchParams?: Partial<ValidatedSearchParamsType<Config, Address>>;
		}) => {
			const mergedParams = customMerge(pageInfo.params, newParams as Record<string, string>);
			const mergedSearch = customMerge(
				getUrlParams(pageInfo.url.search),
				newSearchParams as Record<string, unknown>
			);

			const result = urlGenerator({
				address: routeId,
				paramsValue: mergedParams as ParamsType<Config, Address>,
				searchParamsValue: mergedSearch as SearchParamsType<Config, Address>
			});

			state.params = result.params;
			state.searchParams = result.searchParams;

			if (onUpdate) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(() => {
					onUpdate(result.url);
				}, updateDelay);
			}

			return result;
		};

		return { 
			get current() {
				return { params: state.params, searchParams: state.searchParams };
			},
			updateParams 
		};
	};

	return { urlGenerator, pageInfo };
}