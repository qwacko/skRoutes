import { describe, it, expect } from 'vitest';
import { skRoutes } from './skRoutes-v2.js';
import { z } from 'zod';

// Create Zod schemas that are Standard Schema compliant
const userParamsSchema = z.object({
	id: z.string().uuid()
});

const userSearchParamsSchema = z.object({
	tab: z.enum(['profile', 'settings']).optional(),
	page: z.coerce.number().positive().optional()
});

describe('skRoutes v2 with Standard Schema', () => {
	const { urlGenerator, serverPageInfo } = skRoutes({
		config: {
			'/users/[id]': {
				paramsValidation: userParamsSchema,
				searchParamsValidation: userSearchParamsSchema
			}
		},
		errorURL: '/error'
	});

	it('should generate URLs with valid params', () => {
		const result = urlGenerator({
			address: '/users/[id]',
			paramsValue: { id: '123e4567-e89b-12d3-a456-426614174000' },
			searchParamsValue: { tab: 'profile', page: 1 }
		});

		expect(result.error).toBe(false);
		expect(result.url).toBe('/users/123e4567-e89b-12d3-a456-426614174000?tab=profile&page=1');
		expect(result.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
		expect(result.searchParams).toEqual({ tab: 'profile', page: 1 });
	});

	it('should handle validation errors gracefully', () => {
		const result = urlGenerator({
			address: '/users/[id]',
			paramsValue: { id: 'invalid-uuid' },
			searchParamsValue: { tab: 'invalid-tab' as any }
		});

		expect(result.error).toBe(true);
		expect(result.url).toContain('/error');
	});

	it('should work with serverPageInfo', () => {
		const mockPageData = {
			params: { id: '123e4567-e89b-12d3-a456-426614174000' },
			url: { search: '?tab=settings&page=2' },
			route: { id: '/users/[id]' as const }
		};

		const { current } = serverPageInfo('/users/[id]', mockPageData);

		expect(current.error).toBe(false);
		expect(current.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
		expect(current.searchParams).toEqual({ tab: 'settings', page: 2 });
	});
});