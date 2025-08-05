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

export const load = ({ params, url }: any) => {
	// Simple server-side data loading without serverPageInfo for now
	return {
		user: { id: params.id }, // Mock user data
		activeTab: url.searchParams.get('tab') || 'profile',
		currentPage: parseInt(url.searchParams.get('page') || '1'),
		sortBy: url.searchParams.get('sort') || 'name'
	};
};
