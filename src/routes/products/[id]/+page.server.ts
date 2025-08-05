import { z } from 'zod';
import type { RouteConfigDefinition } from '$lib/route-config-types';

// Route configuration for the plugin (using current library format)
export const _routeConfig = {
	paramsValidation: z.object({
		id: z.string().regex(/^[A-Z0-9]{8}$/, 'Product ID must be 8 uppercase alphanumeric characters')
	}),
	searchParamsValidation: z.object({
		color: z.string().optional(),
		size: z.enum(['S', 'M', 'L', 'XL']).optional(),
		inStock: z.coerce.boolean().default(true),
		page: z.coerce.number().positive().default(1)
	})
} satisfies RouteConfigDefinition;

export const load = async ({ params, url }: any) => {
	// Simple server-side data loading without serverPageInfo for now
	return {
		productId: params.id,
		filters: {
			color: url.searchParams.get('color'),
			size: url.searchParams.get('size'),
			inStock: url.searchParams.get('inStock') !== 'false',
			page: parseInt(url.searchParams.get('page') || '1')
		}
	};
};
