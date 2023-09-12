import { z } from 'zod';

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

interface RouteConfig {
	[address: string]: RouteDetails;
}

// Define the generateURL function
function generateURL<Config extends RouteConfig, Address extends keyof Config>(
	config: Config,
	address: Address,
	paramsValue: ParamsType<Config[Address]>,
	searchParamsValue: SearchParamsType<Config[Address]>
): {
	address: Address;
	params: ValidatedParamsType<Config[Address]>;
	searchParams: ValidatedSearchParamsType<Config[Address]>;
} {
	const routeDetails = config[address];

	const validatedParams = routeDetails.paramsValidation
		? routeDetails.paramsValidation(paramsValue)
		: undefined;

	const validatedSearchParams = routeDetails.searchParamsValidation
		? routeDetails.searchParamsValidation(searchParamsValue)
		: undefined;

	return {
		address,
		params: validatedParams,
		searchParams: validatedSearchParams
	};
}

// Example usage:
const exampleConfig = {
	'/example': {
		paramsValidation: (urlParamsObject) => {
			// Example validation logic
			return z.object({ id: z.string() }).parse(urlParamsObject);
		}
	},
	'/another': {
		searchParamsValidation: (searchParams) => {
			// Example validation logic

			return z.object({ title: z.string() }).parse(searchParams);
		}
	}
} satisfies RouteConfig;

const result1 = generateURL(exampleConfig, '/example', { id: 'this' }, undefined);
console.log(result1);

const result2 = generateURL(
	exampleConfig,
	'/another', // Autocomplete will suggest "/example" and "/another"
	undefined,
	{ title: 'Hello' }
);
console.log(result2);
