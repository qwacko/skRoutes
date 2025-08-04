import { serverPageInfo } from '$lib/auto-skroutes.js';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { RouteConfig } from '$lib/route-config-types.js';

// New unified route configuration
export const _routeConfig = {
	params: z.object({
		id: z.uuid()
	}),

	searchParams: z.object({
		tab: z.enum(['profile', 'settings', 'billing']).optional(),
		page: z.coerce.number().positive().default(1),
		sort: z.enum(['name', 'date', 'activity']).default('name')
	}),

	// Custom error handling per route
	onParamsError: (error, rawParams) => {
		console.error('Invalid user params:', error, rawParams);
		// Redirect to users list if invalid ID
		return { redirect: '/users' };
	},

	onSearchParamsError: (error, rawSearchParams) => {
		console.warn('Invalid search params, using defaults:', error);
		// Return default search params instead of failing
		return {
			searchParams: {
        
			}
		};
	},

	// Optional metadata
	meta: {
		title: 'User Profile',
		description: 'View and manage user profile information',
		tags: ['user', 'profile', 'settings']
	}
} satisfies RouteConfig;

export const load = (data) => {
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
