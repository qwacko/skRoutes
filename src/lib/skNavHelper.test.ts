import { describe, it, expect } from 'vitest';
import { createURLGenerator } from './skNavHelper.js'; // Adjust the import path accordingly

describe('createURLGenerator', () => {
	const exampleConfig = {
		'/example/[id]': {
			paramsValidation: (params: { id: string }) => params
		},
		'/another/(optional)/[title]': {
			paramsValidation: (params: { title: string }) => params,
			searchParamsValidation: (searchParams: { filter: string }) => searchParams
		},
		'/complexParams': {
			searchParamsValidation: (searchParams: {
				filter: string;
				otherConfig: { item1: string; item2: number };
			}) => searchParams
		}
	};

	const { urlGenerator: generate } = createURLGenerator(exampleConfig);

	it('should replace "/[x]" in the address with the corresponding value from validatedParams', () => {
		const result = generate({ address: '/example/[id]', paramsValue: { id: '123' } });
		expect(result.url).toBe('/example/123');
	});

	it('should remove all instances of "/(...)" from the address', () => {
		const result = generate({
			address: '/another/(optional)/[title]',
			paramsValue: { title: 'true' },
			searchParamsValue: { filter: 'active' }
		});
		expect(result.url.startsWith('/another/')).toBe(true);
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
			url: '/example/123'
		});
	});
});
