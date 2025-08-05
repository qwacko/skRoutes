import { z } from 'zod';
import type { RouteConfigDefinition } from '$lib/route-config-types';

// Use new unified route config format
export const _routeConfig = {
	paramsValidation: z.object({
		id: z.string()
	}),
	searchParamsValidation: z.object({
		data: z.string(),
		date: z.date().optional()
	})
} satisfies RouteConfigDefinition;

export const load = ({ params, url }: any) => {
	// Simple server-side data loading without serverPageInfo for now
	return {
		params: { id: params.id },
		searchParams: {
			data: url.searchParams.get('data') || '',
			date: url.searchParams.get('date')
		}
	};
};
