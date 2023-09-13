import { skRoutes } from '$lib/skRoutes.js';
import { z } from 'zod';

export const { pageInfo, urlGenerator, serverPageInfo } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse,
			searchParamsValidation: z.object({ data: z.string().optional() }).parse
		}
	},
	errorURL: '/error'
});
