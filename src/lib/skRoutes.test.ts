import { describe, it, expect } from 'vitest';
import { skRoutes } from './skRoutes.svelte.js';
import { z } from 'zod';

// Create Zod schemas that are Standard Schema compliant
const userParamsSchema = z.object({
	id: z.string().min(1)
});

const userSearchParamsSchema = z.object({
	tab: z.enum(['profile', 'settings']).optional(),
	page: z.coerce.number().positive().optional()
});

describe('skRoutes with Standard Schema', () => {
	const { urlGenerator } = skRoutes({
		config: async () => ({
			'/users/[id]': {
				paramsValidation: userParamsSchema,
				searchParamsValidation: userSearchParamsSchema
			}
		}),
		errorURL: '/error'
	});

	it('should generate URLs with valid params', () => {
		const result = urlGenerator({
			address: '/users/[id]',
			paramsValue: { id: 'user123' },
			searchParamsValue: { tab: 'profile', page: 1 }
		});

		expect(result.error).toBe(false);
		expect(result.url).toBe('/users/user123?tab=profile&page=1');
		expect(result.params).toEqual({ id: 'user123' });
		expect(result.searchParams).toEqual({ tab: 'profile', page: 1 });
	});

	it('should handle validation errors gracefully', () => {
		const result = urlGenerator({
			address: '/users/[id]',
			paramsValue: { id: '' },
			searchParamsValue: { tab: 'invalid-tab' as any }
		});

		expect(result.error).toBe(true);
		expect(result.url).toContain('/error');
	});

	it('should validate and generate URLs correctly with default parameters', () => {
		const result = urlGenerator({
			address: '/users/[id]',
			paramsValue: { id: 'user456' },
			searchParamsValue: {}
		});

		expect(result.error).toBe(false);
		expect(result.url).toBe('/users/user456');
		expect(result.params).toEqual({ id: 'user456' });
		expect(result.searchParams).toEqual({});
	});
});
