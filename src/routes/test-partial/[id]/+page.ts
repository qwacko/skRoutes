import type { RouteConfigDefinition } from '$lib/route-config-types';
import z from 'zod';

// Test route with only paramsValidation - no searchParamsValidation
export const _routeConfig = {
	paramsValidation: z.object({ id: z.string().min(1) })
} satisfies RouteConfigDefinition;

export const load = ({ params }: any) => {
	return {
		id: params.id
	};
};