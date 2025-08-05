function isObject(item: any): boolean {
	return item && typeof item === 'object' && !Array.isArray(item);
}

function pruneUndefined(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	Object.keys(obj).forEach((key) => {
		const value = obj[key];
		if (Array.isArray(value)) {
			// Directly map arrays without modification
			result[key] = value;
		} else if (typeof value === 'object' && value !== null) {
			// Recursively prune sub-objects
			result[key] = pruneUndefined(value as Record<string, unknown>);
		} else if (value !== undefined) {
			// Copy value if it's not undefined
			result[key] = value;
		}
	});

	return result;
}

export const objectToSearchParams = (objIn: Record<string, unknown>): URLSearchParams => {
	const urlSearchParams = new URLSearchParams();

	const obj = pruneUndefined(objIn);

	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			urlSearchParams.append(key, value.toString());
			return;
		}

		urlSearchParams.append(key, JSON.stringify(value));
	});

	return urlSearchParams;
};

export const getUrlParams = (query: string): Record<string, unknown> =>
	Array.from(new URLSearchParams(query)).reduce(
		(p, [k, v]) => {
			try {
				const newValue: unknown = JSON.parse(v);
				return { ...p, [k]: newValue };
			} catch {
				return { ...p, [k]: v };
			}
		},
		{} as Record<string, unknown>
	);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function customMerge<T extends Record<string, any>, U extends Record<string, any>>(
	obj1: T,
	obj2: U
): T {
	const result: Partial<T> = {};

	Object.keys(obj1).forEach((key) => {
		const typedKey = key as keyof typeof obj1;
		if (
			isObject(obj1[typedKey]) &&
			Object.prototype.hasOwnProperty.call(obj2, key) &&
			isObject(obj2[key as keyof typeof obj2])
		) {
			// Ensure that the type is correctly handled
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKey] = customMerge(obj1[typedKey], obj2[key as keyof typeof obj2] as any) as any;
		} else {
			result[typedKey] = obj1[typedKey];
		}
	});

	Object.keys(obj2).forEach((key) => {
		const typedKey = key as keyof typeof obj2;
		const typedKeyReturn = key as keyof typeof result;
		if (Array.isArray(obj2[typedKey])) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKeyReturn] = obj2[typedKey] as any;
		} else if (obj2[typedKey] === undefined) {
			delete result[typedKeyReturn];
		} else if (!(key in obj1) || obj1[key as keyof typeof obj1] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKeyReturn] = obj2[key as keyof typeof obj2] as any;
		}
	});

	return result as T;
}

import type { StandardSchemaV1 } from '@standard-schema/spec';

interface RouteDetails {
	paramsValidation?: StandardSchemaV1<unknown, unknown>;
	searchParamsValidation?: StandardSchemaV1<unknown, unknown>;
}

export interface RouteConfig {
	[address: string]: RouteDetails;
}

export type ParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['paramsValidation'] extends StandardSchemaV1<infer T, unknown>
		? T
		: Record<string, string>;

export type SearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends StandardSchemaV1<infer T, unknown>
		? T
		: Record<string, unknown>;

export type ValidatedParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['paramsValidation'] extends StandardSchemaV1<unknown, infer R>
		? R
		: Record<string, string>;

export type ValidatedSearchParamsType<Config extends RouteConfig, Address extends keyof Config> =
	Config[Address]['searchParamsValidation'] extends StandardSchemaV1<unknown, infer R>
		? R
		: Record<string, unknown>;

export interface UrlGeneratorInput<Config extends RouteConfig, Address extends keyof Config> {
	address: Address;
	paramsValue?: ParamsType<Config, Address>;
	searchParamsValue?: SearchParamsType<Config, Address>;
}

export interface UrlGeneratorResult<Config extends RouteConfig, Address extends keyof Config> {
	address: Address;
	url: string;
	error: boolean;
	params: ValidatedParamsType<Config, Address>;
	searchParams: ValidatedSearchParamsType<Config, Address>;
}

export function createUpdateParams<Config extends RouteConfig, Address extends keyof Config>(
	routeId: Address,
	currentParams: Record<string, string>,
	currentSearch: string,
	urlGenerator: (input: UrlGeneratorInput<Config, Address>) => UrlGeneratorResult<Config, Address>
) {
	return ({
		params: newParams = {},
		searchParams: newSearchParams = {}
	}: {
		params?: Partial<Record<string, string>>;
		searchParams?: Partial<Record<string, unknown>>;
	}) => {
		const mergedParams = customMerge(currentParams, newParams);
		const mergedSearch = customMerge(
			getUrlParams(currentSearch),
			newSearchParams
		);

		return urlGenerator({
			address: routeId,
			paramsValue: mergedParams as ParamsType<Config, Address>,
			searchParamsValue: mergedSearch as SearchParamsType<Config, Address>
		});
	};
}

export function createUrlGenerator<Config extends RouteConfig>(config: Config, errorURL: string) {
	return <Address extends keyof Config>(
		input: UrlGeneratorInput<Config, Address>
	): UrlGeneratorResult<Config, Address> => {
		try {
			const routeDetails = config[input.address];
			if (!routeDetails) {
				throw new Error(`Route not found: ${String(input.address)}`);
			}

			let validatedParams: ValidatedParamsType<Config, Address> = (input.paramsValue ||
				{}) as ValidatedParamsType<Config, Address>;
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

			let validatedSearchParams: ValidatedSearchParamsType<Config, Address> =
				(input.searchParamsValue || {}) as ValidatedSearchParamsType<Config, Address>;
			if (routeDetails.searchParamsValidation && input.searchParamsValue) {
				const result = routeDetails.searchParamsValidation['~standard'].validate(
					input.searchParamsValue
				);
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
			if (
				validatedSearchParams &&
				Object.keys(validatedSearchParams as Record<string, unknown>).length > 0
			) {
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
				error: true,
				params: {} as ValidatedParamsType<Config, Address>,
				searchParams: {} as ValidatedSearchParamsType<Config, Address>
			};
		}
	};
}
