import { z } from 'zod';

// Route configuration for the plugin (using current library format)
export const _routeConfig = {
	paramsValidation: z.object({
		id: z.string().uuid()
	}),

	searchParamsValidation: z.object({
		tab: z.enum(['profile', 'settings', 'billing']).optional(),
		page: z.coerce.number().positive().default(1),
		sort: z.enum(['name', 'date', 'activity']).default('name')
	})
};

export const load = (data: any) => {
	return {
		message: 'Type test route - check TypeScript errors in this file'
	};
};
