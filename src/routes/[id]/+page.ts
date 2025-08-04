import type { RouteConfigDefinition } from '$lib/route-config-types';
import z from 'zod';

export const _routeConfig = {
	paramsValidation: z.object({ id: z.string().min(1) }),
	searchParamsValidation: z.object({
		tab: z.enum(['profile', 'settings']).optional(),
		page: z.coerce.number().positive().optional()
	})
} satisfies RouteConfigDefinition;
