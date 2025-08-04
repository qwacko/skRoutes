import { serverPageInfo } from '$lib/auto-skroutes-server.js';
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

export async function GET(data) {
	const { current: urlInfo } = serverPageInfo('/server/[id]', data);
	// This would be properly typed if we used serverPageInfo here
	return json({
		userId: urlInfo.params.id,
		query: urlInfo.searchParams
	});
}
