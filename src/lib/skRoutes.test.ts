import { describe, it, expect } from 'vitest';
import { skRoutes, type RouteConfig } from './skRoutes.js'; // Adjust the import path accordingly
import { z } from 'zod';

describe('createURLGenerator - URL Generation Functionality', () => {
	const exampleConfig = {
		'/example/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/another/(optional)/[title]': {
			paramsValidation: z.object({ title: z.string() }).parse,
			searchParamsValidation: z.object({ filter: z.string() }).parse
		},
		'/fallthrough/[title]': {
			paramsValidation: z.object({ title: z.string() }).catch({ title: 'default' }).parse
		},
		'/optional/[[optional]]/[item]/detail': {
			paramsValidation: z.object({ optional: z.string().optional(), item: z.string() }).parse
		},
		'/restParams/[...rest]/data': {
			paramsValidation: z.object({ rest: z.string() }).parse
		},
		'/typedParams/[typed=number]/data': {
			paramsValidation: z.object({ typed: z.number() }).parse
		},
		'/complexParams': {
			searchParamsValidation: z.object({
				filter: z.string(),
				otherConfig: z.object({ item1: z.string(), item2: z.number() })
			}).parse
		}
	} satisfies RouteConfig;

	const { urlGenerator: generate } = skRoutes({
		config: exampleConfig,
		errorURL: '/error'
	});

	it('should replace "/[x]" in the address with the corresponding value from validatedParams', () => {
		const result = generate({ address: '/example/[id]', paramsValue: { id: '123' } });
		expect(result.url).toBe('/example/123');
	});

	it('Errors should be handle gracefully (id is required but not included)', () => {
		// @ts-expect-error This Test Includes Unexpeted Properties of paramsValue
		const result = generate({ address: '/example/[id]', paramsValue: { id2: 'this' } });
		expect(result.url).toBe('/error?message=Error+generating+URL');
		expect(result.error).toBe(true);
	});

	it('Rest Params [...x] should be handled correctly', () => {
		const result = generate({
			address: '/restParams/[...rest]/data',
			paramsValue: { rest: 'urlPortion1/urlPortion2' }
		});
		expect(result.url).toBe('/restParams/urlPortion1/urlPortion2/data');
	});

	it('Typed Params [x=type] must be handled correctly', () => {
		const result = generate({
			address: '/typedParams/[typed=number]/data',
			paramsValue: { typed: 23 }
		});
		expect(result.url).toBe('/typedParams/23/data');
	});

	it('should remove all instances of "/(...)" from the address', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'true' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url.startsWith('/another/')).toBe(true);
	});

	it("If there is an optional portion and it isn't in the parameters this should work", () => {
		const result = generate({
			address: '/optional/[[optional]]/[item]/detail',
			paramsValue: { item: 'item' }
		});
		expect(result.url).toBe('/optional/item/detail');
	});

	it('If there is an optional portion and it is in the parameters this should work', () => {
		const result = generate({
			address: '/optional/[[optional]]/[item]/detail',
			paramsValue: { optional: 'test', item: 'notItem' }
		});
		expect(result.url).toBe('/optional/test/notItem/detail');
	});

	it('If fallthrough is provided, this should work (note that this is dependent on the user)', () => {
		// @ts-expect-error This Test Includes Unexpeted Properties of paramsValue
		const result = generate({ address: '/fallthrough/[title]', paramsValue: { title2: 'this' } });
		expect(result.url).toBe('/fallthrough/default');
		expect(result.error).toBe(false);
	});

	it('should append search params to the URL', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'this' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url).toContain('?filter=active');
	});

	it('should append complex search params to the URL', () => {
		const result = generate({
			address: '/complexParams',
			searchParamsValue: { filter: 'active', otherConfig: { item1: 'this', item2: 24 } }
		});
		expect(result.url).toBe(
			'/complexParams?filter=active&otherConfig=%7B%22item1%22%3A%22this%22%2C%22item2%22%3A24%7D'
		);
	});

	it('should handle a combination of params and search params', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'Hello' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url).toBe('/another/Hello?filter=active');
	});

	it('should return the correct address, params, and searchParams properties', () => {
		const result = generate({ address: '/example/[id]', paramsValue: { id: '123' } });
		expect(result).toEqual({
			address: '/example/[id]',
			params: { id: '123' },
			searchParams: undefined,
			url: '/example/123',
			error: false
		});
	});
});
