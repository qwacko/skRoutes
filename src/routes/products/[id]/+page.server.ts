import { serverPageInfo } from '$lib/auto-skroutes-server.js';
import type { RouteConfigDefinition } from '$lib/route-config-types';
import { skRoutes, type RouteConfig } from '$lib/skRoutes.js';
import { z } from 'zod';

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

export const load = async (data: any) => {
	const { current: urlData } = serverPageInfo('/products/[id]', data);

	// Now fully typed with proper inference from the schemas above
	const productId = urlData.params.id; // string (with regex validation)
	const color = urlData.searchParams.color; // string | undefined
	const size = urlData.searchParams.size; // 'S' | 'M' | 'L' | 'XL' | undefined
	const inStock = urlData.searchParams.inStock; // boolean
	const page = urlData.searchParams.page; // number

	return {
		productId,
		filters: { color, size, inStock, page }
	};
};
