import type { RouteConfigDefinition } from '$lib/route-config-types';
import z from 'zod';

// Test route with only searchParamsValidation - no paramsValidation
export const _routeConfig = {
	searchParamsValidation: z.object({
		query: z.string().optional(),
		limit: z.coerce.number().positive().default(10)
	})
} satisfies RouteConfigDefinition;

export const load = ({ url }: any) => {
	return {
		query: url.searchParams.get('query') || '',
		limit: parseInt(url.searchParams.get('limit') || '10')
	};
};
