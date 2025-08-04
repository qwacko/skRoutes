import { serverPageInfo } from '$lib/auto-skroutes-server.js';
import { skRoutes } from '$lib/skRoutes.js';
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

export const load = (data: any) => {
	const { current: urlData } = serverPageInfo('/server/[id]', data);

	// Test type checking - urlData.params should be typed as { id: string }
	// and urlData.searchParams should be typed as { data: string }
	console.log('Param ID (typed):', urlData.params.id);
	console.log('Search param data (typed):', urlData.searchParams.data);

	return {
		params: urlData.params,
		searchParams: urlData.searchParams
	};
};
