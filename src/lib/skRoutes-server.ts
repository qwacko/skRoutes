import { 
	getUrlParams,
	createUrlGenerator,
	createUpdateParams,
	type RouteConfig,
	type ParamsType,
	type SearchParamsType
} from './helpers.js';

export interface ServerRouteConfig extends RouteConfig {}

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

		const updateParams = createUpdateParams(
			routeId as string,
			data.params,
			data.url.search,
			urlGenerator
		);

		return { current, updateParams };
	};

	return { urlGenerator, serverPageInfo };
}