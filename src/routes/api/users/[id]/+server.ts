import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RouteConfigDefinition } from '$lib/route-config-types';

// Use new unified route config format
export const _routeConfig = {
	paramsValidation: z.object({
		id: z.string().uuid()
	}),
	searchParamsValidation: z.object({
		include: z.array(z.string()).optional(),
		format: z.enum(['json', 'xml']).default('json')
	})
} satisfies RouteConfigDefinition;

export async function GET({ params, url }: any) {
	// Simple API endpoint without serverPageInfo for now
	return json({
		userId: params.id,
		query: {
			include: url.searchParams.getAll('include'),
			format: url.searchParams.get('format') || 'json'
		}
	});
}
