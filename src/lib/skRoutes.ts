import { customMerge, getUrlParams, objectToSearchParams } from './helpers.js';
import type { Readable } from 'svelte/store';
import { writable, get } from 'svelte/store';
import type { StandardSchemaV1 } from '@standard-schema/spec';

interface RouteDetails {
	paramsValidation?: StandardSchemaV1<unknown, unknown>;
	searchParamsValidation?: StandardSchemaV1<unknown, unknown>;
}

export interface RouteConfig {
	[address: string]: RouteDetails;
}

// Type helpers to extract param and search param types from config
type ParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['paramsValidation'] extends StandardSchemaV1<infer T, unknown> ? T : Record<string, string>;

type SearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends StandardSchemaV1<infer T, unknown> ? T : Record<string, unknown>;

type ValidatedParamsType<Config extends RouteConfig, Address extends keyof Config> = 
	Config[Address]['paramsValidation'] extends StandardSchemaV1<unknown, infer R> ? R : Record<string, string>;

type ValidatedSearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends StandardSchemaV1<unknown, infer R> ? R : Record<string, unknown>;

export interface UrlGeneratorInput<Config extends RouteConfig, Address extends keyof Config> {
	address: Address;
	paramsValue?: ParamsType<Config, Address>;
	searchParamsValue?: SearchParamsType<Config, Address>;
}

export interface UrlGeneratorResult<Config extends RouteConfig, Address extends keyof Config> {
	address: Address;
	url: string;
	error: boolean;
	params?: ValidatedParamsType<Config, Address>;
	searchParams?: ValidatedSearchParamsType<Config, Address>;
}

export function skRoutes<Config extends RouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	const urlGenerator = <Address extends keyof Config>(
		input: UrlGeneratorInput<Config, Address>
	): UrlGeneratorResult<Config, Address> => {
		try {
			const routeDetails = config[input.address];
			if (!routeDetails) {
				throw new Error(`Route not found: ${String(input.address)}`);
			}

			let validatedParams: ValidatedParamsType<Config, Address> = (input.paramsValue || {}) as ValidatedParamsType<Config, Address>;
			if (routeDetails.paramsValidation && input.paramsValue) {
				const result = routeDetails.paramsValidation['~standard'].validate(input.paramsValue);
				if (result instanceof Promise) {
					throw new Error('Async validation not supported in URL generator');
				}
				if ('issues' in result && result.issues) {
					throw new Error('Params validation failed');
				}
				validatedParams = result.value as ValidatedParamsType<Config, Address>;
			}

			let validatedSearchParams: ValidatedSearchParamsType<Config, Address> = (input.searchParamsValue || {}) as ValidatedSearchParamsType<Config, Address>;
			if (routeDetails.searchParamsValidation && input.searchParamsValue) {
				const result = routeDetails.searchParamsValidation['~standard'].validate(input.searchParamsValue);
				if (result instanceof Promise) {
					throw new Error('Async validation not supported in URL generator');
				}
				if ('issues' in result && result.issues) {
					throw new Error('Search params validation failed');
				}
				validatedSearchParams = result.value as ValidatedSearchParamsType<Config, Address>;
			}

			// Construct the URL
			let url = String(input.address);

			// Replace "/[x]" and "/[...x]" and "/[x=y]" with the corresponding value from validatedParams
			if (validatedParams && typeof validatedParams === 'object') {
				const paramsRecord = validatedParams as Record<string, unknown>;
				for (const key in paramsRecord) {
					const value = paramsRecord[key];
					if (value !== undefined) {
						const regexes = [
							new RegExp(`/\\[${key}\\]`, 'g'),
							new RegExp(`/\\[\\.\\.\\.${key}\\]`, 'g'),
							new RegExp(`/\\[${key}=[^\\]]+\\]`, 'g')
						];

						for (const regex of regexes) {
							url = url.replace(regex, `/${String(value)}`);
						}
					}
				}
			}

			// Handle optional URL portions "/[[x]]"
			const optionalPortionRegex = /\/\[\[([^\]]+)\]\]/g;
			let match;
			while ((match = optionalPortionRegex.exec(url)) !== null) {
				const key = match[1];
				const paramsRecord = validatedParams as Record<string, unknown>;
				if (validatedParams && key in paramsRecord && paramsRecord[key] !== undefined) {
					url = url.replace(`/[[${key}]]`, `/${String(paramsRecord[key])}`);
				} else {
					url = url.replace(`/[[${key}]]`, '');
				}
			}

			// Remove all instances of "/(...)"
			url = url.replace(/\/\([^)]+\)/g, '');

			// Append search params to the URL
			if (validatedSearchParams && Object.keys(validatedSearchParams as Record<string, unknown>).length > 0) {
				const searchParams = objectToSearchParams(validatedSearchParams as Record<string, unknown>);
				url += `?${searchParams.toString()}`;
			}

			return {
				address: input.address,
				params: validatedParams,
				searchParams: validatedSearchParams,
				url,
				error: false
			};
		} catch {
			const errorMessage = { message: 'Error generating URL' };
			return {
				address: input.address,
				url: `${errorURL}?${objectToSearchParams(errorMessage)}`,
				error: true
			} as UrlGeneratorResult<Config, Address>;
		}
	};

	const pageInfo = <Address extends keyof Config>(
		routeId: Address,
		pageInfo: { params: Record<string, string>; url: { search: string } }
	) => {
		const current = urlGenerator({
			address: routeId,
			paramsValue: pageInfo.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(pageInfo.url.search) as SearchParamsType<Config, Address>
		});

		const updateParams = ({
			params = {},
			searchParams = {}
		}: {
			params?: Partial<ValidatedParamsType<Config, Address>>;
			searchParams?: Partial<ValidatedSearchParamsType<Config, Address>>;
		}) => {
			const mergedParams = customMerge(pageInfo.params, params as Record<string, string>);
			const mergedSearch = customMerge(
				getUrlParams(pageInfo.url.search),
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

	const pageInfoStore = <Address extends keyof Config>({
		routeId,
		pageInfo,
		updateDelay = 1000,
		onUpdate
	}: {
		routeId: Address;
		pageInfo: Readable<{ params: Record<string, string>; url: { search: string } }>;
		updateDelay?: number;
		onUpdate: (newUrl: string) => unknown;
	}) => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		const initialData = get(pageInfo);
		const initialURLData = urlGenerator({
			address: routeId,
			paramsValue: initialData.params as ParamsType<Config, Address>,
			searchParamsValue: getUrlParams(initialData.url.search) as SearchParamsType<Config, Address>
		});

		const store = writable({
			params: initialURLData.params,
			searchParams: initialURLData.searchParams
		});

		const originalSubscribe = store.subscribe;

		store.subscribe = (run, invalidate) => {
			const unsubscribeFromPageInfo = pageInfo.subscribe((data) => {
				const current = urlGenerator({
					address: routeId,
					paramsValue: data.params as ParamsType<Config, Address>,
					searchParamsValue: getUrlParams(data.url.search) as SearchParamsType<Config, Address>
				});

				store.set({
					params: current.params,
					searchParams: current.searchParams
				});
			});

			const unsubscribeFromStore = originalSubscribe((updatedData) => {
				run(updatedData);

				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				timeoutId = setTimeout(() => {
					const generatedUrl = urlGenerator({
						address: routeId,
						paramsValue: updatedData.params as ParamsType<Config, Address>,
						searchParamsValue: updatedData.searchParams as SearchParamsType<Config, Address>
					});

					onUpdate(generatedUrl.url);
				}, updateDelay);
			}, invalidate);

			return () => {
				unsubscribeFromStore();
				unsubscribeFromPageInfo();
			};
		};

		return store;
	};

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

	return { urlGenerator, pageInfo, serverPageInfo, pageInfoStore };
}