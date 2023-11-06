import { customMerge, getUrlParams, objectToSearchParams } from './helpers.js';
import type { Readable } from 'svelte/store';
import { writable, get } from 'svelte/store';

// Define the types for the route configuration
type ValidationFunction<T> = (input: T) => T;

interface RouteDetails {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	paramsValidation?: ValidationFunction<any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	searchParamsValidation?: ValidationFunction<any>;
}

type ParamsType<Details extends RouteDetails> =
	Details['paramsValidation'] extends ValidationFunction<infer T> ? T : undefined;
type SearchParamsType<Details extends RouteDetails> =
	Details['searchParamsValidation'] extends ValidationFunction<infer T> ? T : undefined;

type ValidatedParamsType<Details extends RouteDetails> = Details['paramsValidation'] extends (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	...args: any[]
) => infer R
	? R
	: undefined;
type ValidatedSearchParamsType<Details extends RouteDetails> =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Details['searchParamsValidation'] extends (...args: any[]) => infer R ? R : undefined;

export interface RouteConfig {
	[address: string]: RouteDetails;
}

type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
	  }
	: T;

// Define the generateURL function
type Input<Config, Address extends keyof Config> = {
	address: Address;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} & (Config[Address] extends { paramsValidation: ValidationFunction<any> }
	? { paramsValue: ParamsType<Config[Address]> }
	: // eslint-disable-next-line @typescript-eslint/ban-types
	  {}) &
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(Config[Address] extends { searchParamsValidation: ValidationFunction<any> }
		? { searchParamsValue: SearchParamsType<Config[Address]> }
		: // eslint-disable-next-line @typescript-eslint/ban-types
		  {});

// Higher-order function
export function skRoutes<Config extends RouteConfig>({
	errorURL,
	config
}: {
	errorURL: string;
	config: Config;
}) {
	const urlGenerator = <Address extends keyof Config>(
		input: Input<Config, Address>
	): {
		address: Address;
		url: string;
		error: boolean;
		params?: ValidatedParamsType<Config[Address]>;
		searchParams?: ValidatedSearchParamsType<Config[Address]>;
	} => {
		try {
			const routeDetails = config[input.address];

			let validatedParams;
			if (
				'paramsValidation' in routeDetails &&
				'paramsValue' in input &&
				routeDetails.paramsValidation
			) {
				validatedParams = routeDetails.paramsValidation(input.paramsValue);
			}

			let validatedSearchParams;
			if (
				'searchParamsValidation' in routeDetails &&
				'searchParamsValue' in input &&
				routeDetails.searchParamsValidation
			) {
				validatedSearchParams = routeDetails.searchParamsValidation(input.searchParamsValue);
			}

			// Construct the URL
			let url = input.address as string;

			// Replace "/[x]" and "/[...x]" and "/[x=y]" with the corresponding value from validatedParams
			if (validatedParams) {
				for (const key in validatedParams) {
					// Handle "/[x]", "/[...x]", and "/[x=y]"
					const regexes = [
						new RegExp(`/\\[${key}\\]`, 'g'),
						new RegExp(`/\\[\\.\\.\\.${key}\\]`, 'g'),
						new RegExp(`/\\[${key}=[^\\]]+\\]`, 'g')
					];

					for (const regex of regexes) {
						url = url.replace(regex, `/${validatedParams[key]}`);
					}
				}
			}

			// Handle optional URL portions "/[[x]]"
			const optionalPortionRegex = /\/\[\[([^\]]+)\]\]/g;
			let match;
			while ((match = optionalPortionRegex.exec(url)) !== null) {
				const key = match[1];
				if (validatedParams && key in validatedParams) {
					url = url.replace(`/[[${key}]]`, `/${validatedParams[key]}`);
				} else {
					url = url.replace(`/[[${key}]]`, '');
				}
			}

			// Remove all instances of "/(...)"
			url = url.replace(/\/\([^)]+\)/g, '');

			// Append search params to the URL
			if (validatedSearchParams) {
				const searchParams = objectToSearchParams(validatedSearchParams);
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
			};
		}
	};
	const pageInfo = <
		Address extends keyof Config,
		PageInfo extends { params: Record<string, string>; url: { search: string } }
	>(
		routeId: Address,
		pageInfo: PageInfo
	) => {
		//@ts-expect-error This has uncertainty about what should be available
		const current = urlGenerator({
			address: routeId,
			paramsValue: pageInfo.params,
			searchParamsValue: getUrlParams(pageInfo.url.search)
		});

		const updateParams = ({
			//@ts-expect-error This has uncertainty about what should be available
			params = {},
			//@ts-expect-error This has uncertainty about what should be available
			searchParams = {}
		}: {
			params?: DeepPartial<ValidatedParamsType<Config[Address]>>;
			searchParams?: DeepPartial<ValidatedSearchParamsType<Config[Address]>>;
		}) => {
			const mergedParams = customMerge(pageInfo.params, params as Record<string, string>);

			const mergedSearch = customMerge(
				getUrlParams(pageInfo.url.search),
				searchParams as Record<string, string>
			);

			//@ts-expect-error This has uncertainty about what should be available
			return urlGenerator({
				address: routeId,
				paramsValue: mergedParams,
				searchParamsValue: mergedSearch
			});
		};

		return { current, updateParams };
	};

	const pageInfoStore = <
		Address extends keyof Config,
		PageInfo extends { params: Record<string, string>; url: { search: string } }
	>({
		routeId,
		pageInfo,
		updateDelay = 1000, // Default to 1 second if not provided
		onUpdate
	}: {
		routeId: Address;
		pageInfo: Readable<PageInfo>;
		updateDelay?: number;
		onUpdate: (newUrl: string) => unknown;
	}) => {
		let timeoutId: NodeJS.Timeout | null = null;
		const initialData = get(pageInfo);
		//@ts-expect-error This has uncertainty about what should be available
		const initialURLData = urlGenerator({
			address: routeId,
			paramsValue: initialData.params,
			searchParamsValue: getUrlParams(initialData.url.search)
		});

		const store = writable({
			params: initialURLData.params,
			searchParams: initialURLData.searchParams
		});

		const originalSubscribe = store.subscribe;

		store.subscribe = (run, invalidate) => {
			const unsubscribeFromPageInfo = pageInfo.subscribe((data) => {
				//@ts-expect-error This has uncertainty about what should be available
				const current = urlGenerator({
					address: routeId,
					paramsValue: data.params,
					searchParamsValue: getUrlParams(data.url.search)
				});

				store.set({
					params: current.params,
					searchParams: current.searchParams
				});
			});

			const unsubscribeFromStore = originalSubscribe((updatedData) => {
				run(updatedData); // Call the original subscriber

				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				timeoutId = setTimeout(() => {
					//@ts-expect-error This has uncertainty about what should be available
					const generatedUrl = urlGenerator({
						address: routeId,
						paramsValue: updatedData.params,
						searchParamsValue: updatedData.searchParams
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

	const serverPageInfo = <
		Address extends keyof Config,
		PageInfo extends {
			params: Record<string, string>;
			url: { search: string };
			route: { id: Address };
		}
	>(
		routeId: Address,
		data: PageInfo
	) => {
		//@ts-expect-error This has uncertainty about what should be available
		const current = urlGenerator({
			address: routeId,
			paramsValue: data.params,
			searchParamsValue: getUrlParams(data.url.search)
		});

		const updateParams = ({
			//@ts-expect-error This has uncertainty about what should be available
			params = {},
			//@ts-expect-error This has uncertainty about what should be available
			searchParams = {}
		}: {
			params?: DeepPartial<ValidatedParamsType<Config[Address]>>;
			searchParams?: DeepPartial<ValidatedSearchParamsType<Config[Address]>>;
		}) => {
			const mergedParams = customMerge(data.params, params as Record<string, string>);
			const mergedSearch = customMerge(
				getUrlParams(data.url.search),
				searchParams as Record<string, string>
			);

			//@ts-expect-error This has uncertainty about what should be available
			return urlGenerator({
				address: routeId,
				paramsValue: mergedParams,
				searchParamsValue: mergedSearch
			});
		};

		return { current, updateParams };
	};

	return { urlGenerator, pageInfo, serverPageInfo, pageInfoStore };
}
