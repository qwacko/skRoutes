import { skRoutes } from '$lib/skRoutes.js';
import { z } from 'zod';

export const { pageStoreURLInfo, urlGenerator, serverLoadValidation } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		}
	},
	errorURL: '/error'
});
