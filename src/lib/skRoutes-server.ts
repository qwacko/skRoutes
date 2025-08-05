import { 
	customMerge, 
	getUrlParams, 
	createUrlGenerator,
	type RouteConfig
} from './helpers.js';

export interface ServerRouteConfig extends RouteConfig {}

// Type helpers to extract param and search param types from config
type ParamsType<Config extends ServerRouteConfig, Address extends keyof Config> =
	Config[Address]['paramsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<infer T, unknown> ? T : Record<string, string>;

type SearchParamsType<Config extends ServerRouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<infer T, unknown> ? T : Record<string, unknown>;

type ValidatedParamsType<Config extends ServerRouteConfig, Address extends keyof Config> = 
	Config[Address]['paramsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<unknown, infer R> ? R : Record<string, string>;

type ValidatedSearchParamsType<Config extends ServerRouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends import('@standard-schema/spec').StandardSchemaV1<unknown, infer R> ? R : Record<string, unknown>;

export function skRoutesServer<Config extends ServerRouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	const urlGenerator = createUrlGenerator(config, errorURL);

	const serverPageInfo = <Address extends keyof Config>(
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

		const updateParams = ({
			params = {},
			searchParams = {}
		}: {
			params?: Partial<ValidatedParamsType<Config, Address>>;
			searchParams?: Partial<ValidatedSearchParamsType<Config, Address>>;
		}) => {
			const mergedParams = customMerge(data.params, params as Record<string, string>);
			const mergedSearch = customMerge(
				getUrlParams(data.url.search),
				searchParams as Record<string, unknown>
			);

			return urlGenerator({
				address: routeId,
				paramsValue: mergedParams as ParamsType<Config, Address>,
				searchParamsValue: mergedSearch as SearchParamsType<Config, Address>
			});
		};

		return { current, updateParams };
	};

	return { urlGenerator, serverPageInfo };
}