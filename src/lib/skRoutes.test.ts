import { describe, it, expect } from 'vitest';
import { skRoutes, type RouteConfig } from './skRoutes.js'; // Adjust the import path accordingly
import { z } from 'zod';
import { objectToSearchParams } from './helpers.js';

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
	'/arrayParams': {
		searchParamsValidation: z
			.object({ order: z.array(z.enum(['one', 'two', 'three'])).optional() })
			.catch({}).parse
	},
	'/complexArrayParams/[id]': {
		paramsValidation: z.object({ id: z.string() }).catch({ id: 'nothing' }).parse,
		searchParamsValidation: z
			.object({
				order: z
					.array(z.object({ key: z.enum(['one', 'two', 'three']), dir: z.enum(['asc', 'desc']) }))
					.optional(),
				page: z.number().optional().default(0),
				perPage: z.number().optional().default(10),
				notRequired: z.string().nullable().optional()
			})
			.catch({ page: 0, perPage: 10 }).parse
	},
	'/complexParams': {
		searchParamsValidation: z.object({
			filter: z.string(),
			otherConfig: z.object({ item1: z.string(), item2: z.number() })
		}).parse
	}
} satisfies RouteConfig;

describe('createURLGenerator - URL Generation Functionality', () => {
	const { urlGenerator: generate } = skRoutes({
		config: exampleConfig,
		errorURL: '/error'
	});

	it('Test 100 : should replace "/[x]" in the address with the corresponding value from validatedParams', () => {
		const result = generate({ address: '/example/[id]', paramsValue: { id: '123' } });
		expect(result.url).toBe('/example/123');
	});

	it('Test 101 : Errors should be handle gracefully (id is required but not included)', () => {
		// @ts-expect-error This Test Includes Unexpeted Properties of paramsValue
		const result = generate({ address: '/example/[id]', paramsValue: { id2: 'this' } });
		expect(result.url).toBe('/error?message=Error+generating+URL');
		expect(result.error).toBe(true);
	});

	it('Test 102 : Rest Params [...x] should be handled correctly', () => {
		const result = generate({
			address: '/restParams/[...rest]/data',
			paramsValue: { rest: 'urlPortion1/urlPortion2' }
		});
		expect(result.url).toBe('/restParams/urlPortion1/urlPortion2/data');
	});

	it('Test 103 : Typed Params [x=type] must be handled correctly', () => {
		const result = generate({
			address: '/typedParams/[typed=number]/data',
			paramsValue: { typed: 23 }
		});
		expect(result.url).toBe('/typedParams/23/data');
	});

	it('Test 104 : should remove all instances of "/(...)" from the address', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'true' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url.startsWith('/another/')).toBe(true);
	});

	it("Test 105 : If there is an optional portion and it isn't in the parameters this should work", () => {
		const result = generate({
			address: '/optional/[[optional]]/[item]/detail',
			paramsValue: { item: 'item' }
		});
		expect(result.url).toBe('/optional/item/detail');
	});

	it('Test 106 : If there is an optional portion and it is in the parameters this should work', () => {
		const result = generate({
			address: '/optional/[[optional]]/[item]/detail',
			paramsValue: { optional: 'test', item: 'notItem' }
		});
		expect(result.url).toBe('/optional/test/notItem/detail');
	});

	it('Test 107 : If fallthrough is provided, this should work (note that this is dependent on the user)', () => {
		// @ts-expect-error This Test Includes Unexpeted Properties of paramsValue
		const result = generate({ address: '/fallthrough/[title]', paramsValue: { title2: 'this' } });
		expect(result.url).toBe('/fallthrough/default');
		expect(result.error).toBe(false);
	});

	it('Test 108 : should append search params to the URL', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'this' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url).toContain('?filter=active');
	});

	it('Test 109 : should append complex search params to the URL', () => {
		const result = generate({
			address: '/complexParams',
			searchParamsValue: { filter: 'active', otherConfig: { item1: 'this', item2: 24 } }
		});
		expect(result.url).toBe(
			'/complexParams?filter=active&otherConfig=%7B%22item1%22%3A%22this%22%2C%22item2%22%3A24%7D'
		);
	});

	it('Test 110 : should handle a combination of params and search params', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'Hello' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url).toBe('/another/Hello?filter=active');
	});

	it('Test 111 : should return the correct address, params, and searchParams properties', () => {
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

describe('Check Page Info Functionality', () => {
	const { pageInfo } = skRoutes({
		config: exampleConfig,
		errorURL: '/error'
	});

	const data = pageInfo('/another/(optional)/[title]', {
		params: { title: 'this' },
		url: { search: '?filter=that' }
	});

	const arrayData = pageInfo('/arrayParams', {
		params: {},
		url: { search: objectToSearchParams({ order: ['one'] }).toString() }
	});

	it('Test 200 : Check That Printout Of Current URLWorks Correctly', () => {
		const pageData = data.current.url;

		expect(pageData).not.toContain('Error+generating+URL');
		expect(pageData).toBe('/another/this?filter=that');
	});

	it('Test 201 : Check That Derived URL Generation Work Correctly', () => {
		const newPage = data.updateParams({ searchParams: { filter: 'filter2' } });

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toBe('/another/this?filter=filter2');
	});

	it('Test 202 : Check That Derived URL Generation Works for arrays correctly', () => {
		const newPage = arrayData.updateParams({ searchParams: { order: ['two', 'three'] } });

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toBe('/arrayParams?order=%5B%22two%22%2C%22three%22%5D');
	});

	it('Test 203 : Check That Derived URL Generation Works for complex arrays and params correctly', () => {
		const searchData = objectToSearchParams({
			order: [
				{ key: 'one', dir: 'asc' },
				{ key: 'two', dir: 'asc' }
			],
			page: 1,
			perPage: 10
		});

		const targetSearchData = objectToSearchParams({
			order: [
				{ key: 'one', dir: 'asc' },
				{ key: 'two', dir: 'asc' },
				{ key: 'three', dir: 'desc' }
			],
			page: 1,
			perPage: 10
		});

		const complexArrayData = pageInfo('/complexArrayParams/[id]', {
			params: { id: 'this' },
			url: {
				search: searchData.toString()
			}
		});

		const newPage = complexArrayData.updateParams({
			searchParams: {
				order: [
					...(complexArrayData.current.searchParams?.order || []),
					{ dir: 'desc', key: 'three' }
				]
			}
		});

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toContain(targetSearchData.toString());
	});

	it('Test 204 : Check URL Works Correctly if Search is empty string', () => {
		const complexArrayData = pageInfo('/complexArrayParams/[id]', {
			params: { id: 'this' },
			url: {
				search: ''
			}
		});

		const newOrder: { dir: 'asc' | 'desc'; key: 'one' | 'two' | 'three' }[] = [
			...(complexArrayData.current.searchParams?.order || []),
			{ key: 'three', dir: 'desc' }
		];

		const targetConfig = {
			order: newOrder,
			page: 0,
			perPage: 10
		};

		const newPage = complexArrayData.updateParams({
			searchParams: {
				order: newOrder
			}
		});

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toContain(objectToSearchParams(targetConfig).toString());
	});

	it('Test 205 : Test that merging a blank array works correctly', () => {
		// mergeWith({}, oldValues, updatedValues, (a, b) => (_.isArray(b) ? b : undefined));
		const searchData = objectToSearchParams({
			order: [
				{ key: 'one', dir: 'asc' },
				{ key: 'two', dir: 'asc' }
			],
			page: 1,
			perPage: 10
		});

		const targetSearchData = objectToSearchParams({
			order: [],
			page: 1,
			perPage: 10
		});

		const complexArrayData = pageInfo('/complexArrayParams/[id]', {
			params: { id: 'this' },
			url: {
				search: searchData.toString()
			}
		});

		const newPage = complexArrayData.updateParams({
			searchParams: {
				order: []
			}
		});

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toContain(targetSearchData.toString());
	});

	it('Test 206 : Removing Keys Is Possible', () => {
		const searchData = objectToSearchParams({
			order: [
				{ key: 'one', dir: 'asc' },
				{ key: 'two', dir: 'asc' }
			],
			page: 1,
			perPage: 10,
			notRequired: 'Active'
		});

		const targetSearchData = objectToSearchParams({
			order: [
				{ key: 'one', dir: 'asc' },
				{ key: 'two', dir: 'asc' }
			],
			page: 1,
			perPage: 10
		});

		const complexArrayData = pageInfo('/complexArrayParams/[id]', {
			params: { id: 'this' },
			url: {
				search: searchData.toString()
			}
		});

		const newPage = complexArrayData.updateParams({
			searchParams: {
				notRequired: undefined
			}
		});

		expect(newPage.url).not.toContain('Error+generating+URL');
		expect(newPage.url).toContain(targetSearchData.toString());
		expect(newPage.url).not.toContain('notRequired');
	});
});
