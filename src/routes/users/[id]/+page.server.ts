import { serverPageInfo } from '$lib/auto-skroutes-server.js';
import type { RouteConfigDefinition } from '$lib/route-config-types';
import { z } from 'zod';

// Route configuration for the plugin (using current library format)
export const _routeConfig = {
	paramsValidation: z.object({
		id: z.uuid()
	}),

	searchParamsValidation: z.object({
		tab: z.enum(['profile', 'settings', 'billing']).optional(),
		page: z.coerce.number().positive().default(1),
		sort: z.enum(['name', 'date', 'activity']).default('name')
	})
} satisfies RouteConfigDefinition;

export const load = (data: any) => {
	const { current: urlData } = serverPageInfo('/users/[id]', data);

	// urlData.params is now typed as { id: string } with UUID validation and custom error handling
	// urlData.searchParams is typed as { tab?: 'profile' | 'settings' | 'billing', page: number, sort: 'name' | 'date' | 'activity' }

	return {
		user: { id: urlData.params.id }, // Mock user data
		activeTab: urlData.searchParams.tab || 'profile',
		currentPage: urlData.searchParams.page,
		sortBy: urlData.searchParams.sort
	};
};
